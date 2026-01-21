const express = require('express');
const router = express.Router();
const sensorFetcher = require('../services/sensorFetcher');
const notificationService = require('../services/notificationService');
const workOrderService = require('../services/workOrderService');
const deviceControl = require('../services/deviceControl');

// Update internal state after control
function updateInternalStateAfterControl(sensorType, action) {
  if (sensorType === 'light') {
    if (action === 'turn_on') {
      sensorFetcher.updateLightInternalState('on');
    } else if (action === 'turn_off') {
      sensorFetcher.updateLightInternalState('off');
    }
  } else if (sensorType === 'door') {
    if (action === 'open') {
      sensorFetcher.updateDoorInternalState('open');
    } else if (action === 'close') {
      sensorFetcher.updateDoorInternalState('close');
    }
  }
}

// Get current sensor data
router.get('/sensors', async (req, res) => {
  try {
    const data = await sensorFetcher.fetchAllSensors();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all notifications
router.get('/notifications', (req, res) => {
  const tier = req.query.tier;
  const notifications = tier 
    ? notificationService.getNotificationsByTier(tier)
    : notificationService.getAllNotifications();
  res.json(notifications);
});

// Acknowledge notification
router.post('/notifications/:id/acknowledge', (req, res) => {
  const notification = notificationService.acknowledgeNotification(parseFloat(req.params.id));
  if (notification) {
    res.json(notification);
  } else {
    res.status(404).json({ error: 'Notification not found' });
  }
});

// Unacknowledge notification
router.post('/notifications/:id/unacknowledge', (req, res) => {
  const notification = notificationService.unacknowledgeNotification(parseFloat(req.params.id));
  if (notification) {
    res.json(notification);
  } else {
    res.status(404).json({ error: 'Notification not found' });
  }
});

// Get work orders
router.get('/work-orders', (req, res) => {
  const status = req.query.status;
  const orders = status === 'open'
    ? workOrderService.getOpenWorkOrders()
    : workOrderService.getAllWorkOrders();
  res.json(orders);
});

// Update work order status
router.patch('/work-orders/:id', (req, res) => {
  const { status, assignedTo } = req.body;
  const workOrder = workOrderService.updateWorkOrderStatus(req.params.id, status, assignedTo);
  if (workOrder) {
    res.json(workOrder);
  } else {
    res.status(404).json({ error: 'Work order not found' });
  }
});

// Get current device state (separate from sensor fetcher)
router.get('/devices/:locationId/:sensorType/state', async (req, res) => {
  try {
    const { locationId, sensorType } = req.params;
    
    // Fetch current state directly from API
    let stateEndpoint = '';
    if (sensorType === 'conveyor') {
      stateEndpoint = 'conveyor/state';
    } else if (sensorType === 'door') {
      stateEndpoint = 'door/state';
    } else if (sensorType === 'light') {
      stateEndpoint = 'light/state/';
    } else {
      return res.status(400).json({ error: `Unknown sensor type: ${sensorType}` });
    }

    const axios = require('axios');
    const sensorFetcher = require('../services/sensorFetcher');
    const BASE_URL = 'https://apco-demo.agile.co.id/api';
    
    let currentState = null;
    
    // For light and door, only use internal state (don't fetch from API)
    if (sensorType === 'light' || sensorType === 'door') {
      const sensors = await sensorFetcher.fetchAllSensors();
      const sensor = sensors.find(s => s.type === sensorType);
      if (sensorType === 'light') {
        currentState = sensor?.state || 'off';
      } else {
        currentState = sensor?.state || 'close';
      }
    } else {
      const response = await axios.get(`${BASE_URL}/device/${stateEndpoint}`);
      const stateValue = response.data.device_stream_value || response.data.device_stream_message;
      currentState = stateValue ? stateValue.toLowerCase().trim() : null;
    }
    
    res.json({
      success: true,
      locationId: parseInt(locationId),
      sensorType,
      state: currentState
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch device state' });
  }
});

// Direct device control
router.post('/devices/control', async (req, res) => {
  try {
    const { locationId, sensorType, action } = req.body;
    
    if (!locationId || !sensorType || !action) {
      return res.status(400).json({ error: 'Missing required fields: locationId, sensorType, action' });
    }

    // Only allow for controllable sensors
    const controllableSensors = ['conveyor', 'door', 'light'];
    if (!controllableSensors.includes(sensorType)) {
      return res.status(400).json({ error: `Sensor ${sensorType} is not controllable` });
    }

    // First, check current state to ensure we're sending the correct action
    const axios = require('axios');
    const BASE_URL = 'https://apco-demo.agile.co.id/api';
    let stateEndpoint = '';
    if (sensorType === 'conveyor') {
      stateEndpoint = 'conveyor/state';
    } else if (sensorType === 'door') {
      stateEndpoint = 'door/state';
    } else if (sensorType === 'light') {
      stateEndpoint = 'light/state/';
    }

    let currentState = null;
    try {
      // For light and door, only use internal state (don't fetch from API)
      if (sensorType === 'light' || sensorType === 'door') {
        const sensors = await sensorFetcher.fetchAllSensors();
        const sensor = sensors.find(s => s.type === sensorType && s.deviceId === locationId);
        if (sensorType === 'light') {
          currentState = sensor?.state || 'off';
        } else {
          currentState = sensor?.state || 'close';
        }
      } else {
        const stateResponse = await axios.get(`${BASE_URL}/device/${stateEndpoint}`);
        const stateValue = stateResponse.data.device_stream_value || stateResponse.data.device_stream_message;
        currentState = stateValue ? stateValue.toLowerCase().trim() : null;
      }
    } catch (stateError) {
      console.error('Error fetching current state:', stateError.message);
      // For light and door, use internal state
      if (sensorType === 'light' || sensorType === 'door') {
        const sensors = await sensorFetcher.fetchAllSensors();
        const sensor = sensors.find(s => s.type === sensorType && s.deviceId === locationId);
        if (sensorType === 'light') {
          currentState = sensor?.state || 'off';
        } else {
          currentState = sensor?.state || 'close';
        }
      }
    }

    // Determine the correct action based on current state if action is 'toggle'
    let finalAction = action;
    if (action === 'toggle' && currentState !== null) {
      finalAction = deviceControl.getResolutionAction(sensorType, currentState);
      if (!finalAction) {
        return res.status(400).json({ error: 'Could not determine toggle action from current state' });
      }
    }

    // Send control command
    const result = await deviceControl.sendControlCommand(locationId, sensorType, finalAction);

    if (result.success) {
      // Update internal state after successful toggle
      updateInternalStateAfterControl(sensorType, finalAction);
      
      res.json({
        success: true,
        message: result.message,
        topic: result.topic,
        payload: result.payload,
        previousState: currentState
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve work order with quick action
router.post('/work-orders/:id/resolve', async (req, res) => {
  try {
    const workOrder = workOrderService.getAllWorkOrders().find(wo => wo.id === req.params.id);
    
    if (!workOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }

    // Only allow resolution for EQUIPMENT_STATE category
    if (workOrder.category !== 'EQUIPMENT_STATE') {
      return res.status(400).json({ error: 'Quick resolution only available for equipment state issues' });
    }

    // Only allow for controllable sensors
    const controllableSensors = ['conveyor', 'door', 'light'];
    if (!controllableSensors.includes(workOrder.sensor)) {
      return res.status(400).json({ error: `Sensor ${workOrder.sensor} is not controllable` });
    }

    // Get current sensor state to determine action
    const sensors = await sensorFetcher.fetchAllSensors();
    const sensor = sensors.find(s => 
      s.deviceId === workOrder.deviceId && 
      s.type === workOrder.sensor
    );
    
    const currentState = sensor?.state || null;

    // Determine resolution action based on current state
    const action = deviceControl.getResolutionAction(workOrder.sensor, currentState);
    if (!action) {
      return res.status(400).json({ error: 'Could not determine resolution action' });
    }

    // Send control command
    const result = await deviceControl.sendControlCommand(
      workOrder.deviceId,
      workOrder.sensor,
      action
    );

    if (result.success) {
      // Optionally update work order status
      const { autoClose } = req.body;
      if (autoClose) {
        workOrderService.updateWorkOrderStatus(req.params.id, 'CLOSED');
      } else {
        workOrderService.updateWorkOrderStatus(req.params.id, 'IN_PROGRESS');
      }

      res.json({
        success: true,
        message: result.message,
        workOrder: workOrderService.getAllWorkOrders().find(wo => wo.id === req.params.id),
        action: {
          sensor: workOrder.sensor,
          action: action,
          topic: result.topic,
          payload: result.payload
        }
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const sensorFetcher = require('../services/sensorFetcher');
const notificationService = require('../services/notificationService');
const workOrderService = require('../services/workOrderService');

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

module.exports = router;

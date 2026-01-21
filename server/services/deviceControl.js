const axios = require('axios');

const BASE_URL = 'https://apco-demo.agile.co.id/api';

// Location-to-topic mappings
// Office (location_id 1): light and door
// Factory (location_id 2): conveyor
const TOPIC_MAPPINGS = {
  1: { // Office
    light: 'control/5002917623C1/light',
    door: 'control/5002917623C1/door'
  },
  2: { // Factory
    conveyor: 'control/C4D8D539DA84/conveyor'
  }
};

// Action mappings - what payload to send for each action
const ACTION_PAYLOADS = {
  conveyor: {
    start: 'running',
    stop: 'stopped'
  },
  door: {
    close: 'close',
    open: 'open'
  },
  light: {
    turn_on: 'on',
    turn_off: 'off'
  }
};

async function sendControlCommand(locationId, sensorType, action) {
  try {
    // Get the topic for this location and sensor
    const locationTopics = TOPIC_MAPPINGS[locationId];
    if (!locationTopics) {
      throw new Error(`Unknown location ID: ${locationId}`);
    }

    const topic = locationTopics[sensorType];
    if (!topic) {
      throw new Error(`Sensor ${sensorType} not available for location ${locationId}`);
    }

    // Get the payload for this action
    const sensorActions = ACTION_PAYLOADS[sensorType];
    if (!sensorActions) {
      throw new Error(`Unknown sensor type: ${sensorType}`);
    }

    const payload = sensorActions[action];
    if (!payload) {
      throw new Error(`Unknown action ${action} for sensor ${sensorType}`);
    }

    // Update internal state immediately before sending command (for instant UI feedback)
    const sensorFetcher = require('./sensorFetcher');
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

    // Send control command
    const response = await axios.post(`${BASE_URL}/device/send-control`, {
      commands: [
        {
          topic: topic,
          payload: payload
        }
      ]
    });

    if (response.data.status === 'success') {
      return {
        success: true,
        message: response.data.message || 'Command sent successfully',
        topic,
        payload,
        action, // Return action so caller can update internal state
        sensorType
      };
    } else {
      // Revert internal state on failure
      if (sensorType === 'light') {
        sensorFetcher.updateLightInternalState(action === 'turn_on' ? 'off' : 'on');
      } else if (sensorType === 'door') {
        sensorFetcher.updateDoorInternalState(action === 'open' ? 'close' : 'open');
      }
      throw new Error(response.data.message || 'Unknown error');
    }
  } catch (error) {
    console.error('Control command error:', error.message);
    return {
      success: false,
      error: error.message || 'Failed to send control command'
    };
  }
}

// Helper function to determine action based on current state and desired resolution
function getResolutionAction(sensorType, currentState) {
  if (sensorType === 'conveyor') {
    return currentState === 'stopped' ? 'start' : 'stop';
  } else if (sensorType === 'door') {
    return currentState === 'open' ? 'close' : 'open';
  } else if (sensorType === 'light') {
    return currentState === 'off' ? 'turn_on' : 'turn_off';
  }
  return null;
}

module.exports = {
  sendControlCommand,
  getResolutionAction
};

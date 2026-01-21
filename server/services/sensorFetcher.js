const axios = require('axios');

const BASE_URL = 'https://apco-demo.agile.co.id/api';

// Normalize unit strings to fix encoding issues
function normalizeUnit(unit) {
  if (!unit) return null;
  
  // Fix common encoding issues
  const normalized = unit
    .replace(/Ã‚Â°C/g, '°C')
    .replace(/Ã‚Â°/g, '°')
    .replace(/Â°C/g, '°C')
    .replace(/Â°/g, '°')
    .trim();
  
  // If it's just "C" and looks like temperature, assume it's Celsius
  if (normalized === 'C' && unit.toLowerCase().includes('c')) {
    return '°C';
  }
  
  return normalized || unit;
}

async function fetchSensorData(deviceId) {
  try {
    const response = await axios.get(`${BASE_URL}/device/stream/data/${deviceId}`);
    const sensorData = response.data.sensor_data;
    
    // Normalize units
    if (sensorData.temperature?.unit) {
      sensorData.temperature.unit = normalizeUnit(sensorData.temperature.unit);
    }
    if (sensorData.humidity?.unit) {
      sensorData.humidity.unit = normalizeUnit(sensorData.humidity.unit);
    }
    
    return {
      deviceId,
      type: 'temperature_humidity',
      data: sensorData,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching sensor ${deviceId}:`, error.message);
    return null;
  }
}

async function fetchLightState() {
  try {
    const response = await axios.get(`${BASE_URL}/device/light/state/`);
    return {
      deviceId: response.data.device_id,
      type: 'light',
      state: response.data.device_stream_value,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching light state:', error.message);
    return null;
  }
}

async function fetchDoorState() {
  try {
    const response = await axios.get(`${BASE_URL}/device/door/state`);
    return {
      deviceId: response.data.device_id,
      type: 'door',
      state: response.data.device_stream_value,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching door state:', error.message);
    return null;
  }
}

async function fetchConveyorState() {
  try {
    const response = await axios.get(`${BASE_URL}/device/conveyor/state`);
    return {
      deviceId: response.data.device_id,
      type: 'conveyor',
      state: response.data.device_stream_value,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching conveyor state:', error.message);
    return null;
  }
}

async function fetchAllSensors() {
  const results = await Promise.all([
    fetchSensorData(1), // Office
    fetchSensorData(2), // Factory
    fetchLightState(),
    fetchDoorState(),
    fetchConveyorState()
  ]);
  
  return results.filter(r => r !== null);
}

module.exports = { fetchAllSensors };

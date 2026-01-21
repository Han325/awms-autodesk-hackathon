// Rule engine with explicit categories and reasoning for future ML integration

// Normalize unit strings to fix encoding issues
function normalizeUnit(unit) {
  if (!unit) return null;
  const normalized = unit
    .replace(/Ã‚Â°C/g, '°C')
    .replace(/Ã‚Â°/g, '°')
    .replace(/Â°C/g, '°C')
    .replace(/Â°/g, '°')
    .trim();
  if (normalized === 'C' && unit.toLowerCase().includes('c')) {
    return '°C';
  }
  return normalized || unit;
}

const RULES = {
  temperature: {
    // Future: ML will learn optimal thresholds per location/time
    office: { warning: 25, critical: 30 },
    factory: { warning: 35, critical: 40 }
  },
  humidity: {
    // Future: ML will detect patterns like "rapid humidity drop = equipment failure"
    warning: { min: 30, max: 70 },
    critical: { min: 20, max: 80 }
  },
  equipment: {
    // Future: ML will learn normal operational patterns
    conveyor: { critical: ['stopped'] },
    door: { warning: ['open'] },
    light: { info: ['off'] }
  }
};

function evaluateTemperature(deviceId, temp) {
  const tempValue = parseFloat(temp.value);
  const location = deviceId === 1 ? 'office' : 'factory';
  const thresholds = RULES.temperature[location];
  
  if (tempValue >= thresholds.critical) {
    return {
      tier: 'CRITICAL',
      category: 'TEMPERATURE_THRESHOLD',
      reasoning: `Temperature (${tempValue}°C) exceeds critical threshold (${thresholds.critical}°C) for ${location}. Risk of equipment damage or safety hazard.`,
      deviceId,
      sensor: 'temperature',
      value: tempValue,
      threshold: thresholds.critical,
      unit: normalizeUnit(temp.unit)
    };
  } else if (tempValue >= thresholds.warning) {
    return {
      tier: 'WARNING',
      category: 'TEMPERATURE_THRESHOLD',
      reasoning: `Temperature (${tempValue}°C) approaching critical threshold for ${location}. Monitor closely.`,
      deviceId,
      sensor: 'temperature',
      value: tempValue,
      threshold: thresholds.warning,
      unit: normalizeUnit(temp.unit)
    };
  }
  return null;
}

function evaluateHumidity(deviceId, humidity) {
  const humidityValue = parseFloat(humidity.value);
  const thresholds = RULES.humidity;
  
  if (humidityValue <= thresholds.critical.min || humidityValue >= thresholds.critical.max) {
    return {
      tier: 'CRITICAL',
      category: 'HUMIDITY_THRESHOLD',
      reasoning: `Humidity (${humidityValue}%) outside critical range (${thresholds.critical.min}-${thresholds.critical.max}%). May indicate equipment malfunction or environmental issue.`,
      deviceId,
      sensor: 'humidity',
      value: humidityValue,
      threshold: thresholds.critical,
      unit: normalizeUnit(humidity.unit)
    };
  } else if (humidityValue <= thresholds.warning.min || humidityValue >= thresholds.warning.max) {
    return {
      tier: 'WARNING',
      category: 'HUMIDITY_THRESHOLD',
      reasoning: `Humidity (${humidityValue}%) outside optimal range (${thresholds.warning.min}-${thresholds.warning.max}%).`,
      deviceId,
      sensor: 'humidity',
      value: humidityValue,
      threshold: thresholds.warning,
      unit: normalizeUnit(humidity.unit)
    };
  }
  return null;
}

function evaluateEquipment(type, state, deviceId) {
  const rules = RULES.equipment[type];
  
  if (rules.critical && rules.critical.includes(state)) {
    return {
      tier: 'CRITICAL',
      category: 'EQUIPMENT_STATE',
      reasoning: `${type.charAt(0).toUpperCase() + type.slice(1)} is ${state}. Production may be halted or safety compromised.`,
      deviceId,
      sensor: type,
      value: state
    };
  } else if (rules.warning && rules.warning.includes(state)) {
    return {
      tier: 'WARNING',
      category: 'EQUIPMENT_STATE',
      reasoning: `${type.charAt(0).toUpperCase() + type.slice(1)} is ${state}. May require attention.`,
      deviceId,
      sensor: type,
      value: state
    };
  } else if (rules.info && rules.info.includes(state)) {
    return {
      tier: 'INFO',
      category: 'EQUIPMENT_STATE',
      reasoning: `${type.charAt(0).toUpperCase() + type.slice(1)} is ${state}.`,
      deviceId,
      sensor: type,
      value: state
    };
  }
  return null;
}

function evaluateAll(sensorData) {
  const evaluations = [];
  
  for (const sensor of sensorData) {
    if (sensor.type === 'temperature_humidity') {
      const tempEval = evaluateTemperature(sensor.deviceId, sensor.data.temperature);
      const humidityEval = evaluateHumidity(sensor.deviceId, sensor.data.humidity);
      
      if (tempEval) evaluations.push({ ...tempEval, timestamp: sensor.timestamp });
      if (humidityEval) evaluations.push({ ...humidityEval, timestamp: sensor.timestamp });
    } else if (sensor.type === 'conveyor' || sensor.type === 'door' || sensor.type === 'light') {
      const eval = evaluateEquipment(sensor.type, sensor.state, sensor.deviceId);
      if (eval) evaluations.push({ ...eval, timestamp: sensor.timestamp });
    }
  }
  
  return evaluations;
}

module.exports = { evaluateAll, RULES };

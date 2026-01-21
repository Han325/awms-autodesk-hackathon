import { useTimestamp } from '../hooks/useTimestamp';

function SensorCard({ sensor }) {
  const getLocationName = (deviceId) => {
    return deviceId === 1 ? 'Office' : deviceId === 2 ? 'Factory' : `Device ${deviceId}`;
  };

  const formatValue = (value) => {
    return typeof value === 'string' ? value : value?.toFixed(2) || 'N/A';
  };

  const formatUnit = (unit, defaultUnit) => {
    if (!unit) return defaultUnit;
    // Fix encoding issues in frontend as well
    const normalized = unit
      .replace(/Ã‚Â°C/g, '°C')
      .replace(/Ã‚Â°/g, '°')
      .replace(/Â°C/g, '°C')
      .replace(/Â°/g, '°')
      .trim();
    // If it's just "C", assume it's Celsius
    if (normalized === 'C' && unit.toLowerCase().includes('c')) {
      return '°C';
    }
    return normalized || defaultUnit;
  };

  const timestamp = useTimestamp(sensor.timestamp);

  if (sensor.type === 'temperature_humidity') {
    const location = getLocationName(sensor.deviceId);
    const tempValue = parseFloat(sensor.data?.temperature?.value) || 0;
    const humidityValue = parseFloat(sensor.data?.humidity?.value) || 0;
    
    // Temperature thresholds
    // Office: warning 25°C, critical 30°C
    // Factory: warning 35°C, critical 40°C
    const isOffice = sensor.deviceId === 1;
    const tempWarningThreshold = isOffice ? 25 : 35;
    const tempCriticalThreshold = isOffice ? 30 : 40;
    
    // Humidity thresholds: warning (30-70%), critical (20-80%)
    const humidityWarningMin = 30;
    const humidityWarningMax = 70;
    const humidityCriticalMin = 20;
    const humidityCriticalMax = 80;
    
    // Temperature styling
    let tempBorderColor = 'border-blue-500';
    let tempTextColor = 'text-blue-600';
    let tempBgColor = 'bg-white';
    let tempGlowClass = '';
    
    if (tempValue >= tempCriticalThreshold) {
      // Red for critical - red glow
      tempBorderColor = 'border-red-500';
      tempTextColor = 'text-red-600';
      tempBgColor = 'bg-red-50';
      tempGlowClass = 'glow-red';
    } else if (tempValue >= tempWarningThreshold || tempValue >= tempCriticalThreshold - 5) {
      // Amber/orange for warning or close to critical (within 5 degrees) - orange glow
      tempBorderColor = 'border-orange-500';
      tempTextColor = 'text-orange-600';
      tempBgColor = 'bg-orange-50';
      tempGlowClass = 'glow-orange';
    }
    
    // Humidity styling
    let humidityBorderColor = 'border-green-500';
    let humidityTextColor = 'text-green-600';
    let humidityBgColor = 'bg-white';
    let humidityGlowClass = '';
    
    if (humidityValue <= humidityCriticalMin || humidityValue >= humidityCriticalMax) {
      // Red for critical humidity
      humidityBorderColor = 'border-red-500';
      humidityTextColor = 'text-red-600';
      humidityBgColor = 'bg-red-50';
      humidityGlowClass = 'glow-red';
    } else if (humidityValue <= humidityWarningMin || humidityValue >= humidityWarningMax) {
      // Yellow/amber for warning humidity
      humidityBorderColor = 'border-yellow-500';
      humidityTextColor = 'text-yellow-600';
      humidityBgColor = 'bg-yellow-50';
      humidityGlowClass = 'glow-yellow';
    }
    
    return (
      <>
        <div className={`${tempBgColor} p-5 rounded-lg border-l-4 ${tempBorderColor} shadow-md transition-colors duration-300 ${tempGlowClass}`}>
          <h3 className="text-sm text-gray-600 uppercase tracking-wide mb-3">
            {location} - Temperature
          </h3>
          <div className={`text-3xl font-bold ${tempTextColor} mb-1 transition-colors duration-300`}>
            {formatValue(sensor.data?.temperature?.value)}
          </div>
          <div className="text-sm text-gray-500">
            {formatUnit(sensor.data?.temperature?.unit, '°C')}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {timestamp}
          </div>
        </div>
        <div className={`${humidityBgColor} p-5 rounded-lg border-l-4 ${humidityBorderColor} shadow-md transition-colors duration-300 ${humidityGlowClass}`}>
          <h3 className="text-sm text-gray-600 uppercase tracking-wide mb-3">
            {location} - Humidity
          </h3>
          <div className={`text-3xl font-bold ${humidityTextColor} mb-1 transition-colors duration-300`}>
            {formatValue(sensor.data?.humidity?.value)}
          </div>
          <div className="text-sm text-gray-500">
            {formatUnit(sensor.data?.humidity?.unit, '%')}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {timestamp}
          </div>
        </div>
      </>
    );
  }

  // Format state for display (capitalize first letter)
  const formatState = (state) => {
    if (!state) return 'N/A';
    return state.charAt(0).toUpperCase() + state.slice(1);
  };

  const sensorType = sensor.type.charAt(0).toUpperCase() + sensor.type.slice(1);
  const borderColor = {
    light: 'border-yellow-500',
    door: 'border-purple-500',
    conveyor: 'border-orange-500'
  }[sensor.type] || 'border-gray-400';

  return (
    <div className={`bg-white p-5 rounded-lg border-l-4 ${borderColor} shadow-md`}>
      <h3 className="text-sm text-gray-600 uppercase tracking-wide mb-3">
        {sensorType}
      </h3>
      <div className="text-3xl font-bold text-gray-800 mb-1">
        {formatState(sensor.state)}
      </div>
      <div className="text-xs text-gray-400 mt-2">
        {timestamp}
      </div>
    </div>
  );
}

export default SensorCard;

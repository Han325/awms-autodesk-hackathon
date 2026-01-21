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
    return (
      <>
        <div className="bg-white p-5 rounded-lg border-l-4 border-blue-500 shadow-md">
          <h3 className="text-sm text-gray-600 uppercase tracking-wide mb-3">
            {location} - Temperature
          </h3>
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {formatValue(sensor.data?.temperature?.value)}
          </div>
          <div className="text-sm text-gray-500">
            {formatUnit(sensor.data?.temperature?.unit, '°C')}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {timestamp}
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border-l-4 border-green-500 shadow-md">
          <h3 className="text-sm text-gray-600 uppercase tracking-wide mb-3">
            {location} - Humidity
          </h3>
          <div className="text-3xl font-bold text-green-600 mb-1">
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
        {sensor.state || 'N/A'}
      </div>
      <div className="text-xs text-gray-400 mt-2">
        {timestamp}
      </div>
    </div>
  );
}

export default SensorCard;

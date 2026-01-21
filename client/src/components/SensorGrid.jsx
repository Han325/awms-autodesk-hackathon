import SensorCard from './SensorCard';

function SensorGrid({ sensors }) {
  if (!sensors || sensors.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        Loading sensor data...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sensors.map((sensor, index) => (
        <SensorCard 
          key={`${sensor.deviceId}-${sensor.type}-${index}`} 
          sensor={sensor}
        />
      ))}
    </div>
  );
}

export default SensorGrid;

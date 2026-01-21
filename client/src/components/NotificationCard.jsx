import { useState } from 'react';
import { acknowledgeNotification } from '../utils/api';
import { useTimestamp } from '../hooks/useTimestamp';
import NotificationModal from './NotificationModal';

function NotificationCard({ notification, onAcknowledge }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const timestamp = useTimestamp(notification.timestamp);

  const formatUnit = (unit) => {
    if (!unit) return '';
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
  };

  const tierColors = {
    CRITICAL: 'bg-red-500 text-white border-red-500',
    WARNING: 'bg-orange-500 text-white border-orange-500',
    INFO: 'bg-blue-500 text-white border-blue-500'
  };

  const borderColors = {
    CRITICAL: 'border-red-500',
    WARNING: 'border-orange-500',
    INFO: 'border-blue-500'
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleAcknowledge = async () => {
    if (!notification.acknowledged) {
      await acknowledgeNotification(notification.id);
      if (onAcknowledge) {
        onAcknowledge();
      }
    }
  };

  return (
    <>
      <div
        className={`bg-white p-4 rounded-lg border-l-4 ${borderColors[notification.tier]} cursor-pointer transition-transform hover:translate-x-1 shadow-sm ${
          notification.acknowledged ? 'opacity-60' : ''
        }`}
        onClick={handleCardClick}
      >
      <div className="flex justify-between items-center mb-2">
        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${tierColors[notification.tier]}`}>
          {notification.tier}
        </span>
        <span className="text-xs text-gray-600 font-medium">
          {notification.category}
        </span>
      </div>
      <div className="text-gray-800 text-sm mt-3 leading-relaxed">
        {notification.reasoning}
      </div>
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span>Device {notification.deviceId}</span>
        <span>Sensor: {notification.sensor}</span>
        <span>Value: {notification.value}{formatUnit(notification.unit)}</span>
        <span>{timestamp}</span>
      </div>
      <div className="text-xs text-blue-600 mt-2 font-medium">
        Click to view details →
      </div>
    </div>
      <NotificationModal
        notification={notification}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAcknowledge={handleAcknowledge}
      />
    </>
  );
}

export default NotificationCard;

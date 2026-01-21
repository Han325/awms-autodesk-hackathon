import { acknowledgeNotification } from '../utils/api';
import { useTimestamp } from '../hooks/useTimestamp';

function NotificationModal({ notification, isOpen, onClose, onAcknowledge }) {
  if (!isOpen || !notification) return null;

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

  const handleAcknowledge = async () => {
    if (!notification.acknowledged) {
      await acknowledgeNotification(notification.id);
      if (onAcknowledge) {
        onAcknowledge();
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className={`px-3 py-1 rounded text-sm font-bold uppercase ${tierColors[notification.tier]}`}>
                {notification.tier}
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-2">Notification Details</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Category</label>
              <p className="text-gray-900 mt-1">{notification.category}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">Reasoning</label>
              <p className="text-gray-900 mt-1 leading-relaxed">{notification.reasoning}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Device ID</label>
                <p className="text-gray-900 mt-1">Device {notification.deviceId}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Sensor</label>
                <p className="text-gray-900 mt-1 capitalize">{notification.sensor}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Value</label>
                <p className="text-gray-900 mt-1">{notification.value}{formatUnit(notification.unit)}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Timestamp</label>
                <p className="text-gray-900 mt-1">{timestamp}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">Status</label>
              <p className="text-gray-900 mt-1">
                {notification.acknowledged ? (
                  <span className="text-green-600 font-medium">Acknowledged</span>
                ) : (
                  <span className="text-orange-600 font-medium">Pending</span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            {!notification.acknowledged && (
              <button
                onClick={handleAcknowledge}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Acknowledge
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationModal;

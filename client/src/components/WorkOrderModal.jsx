import { useState, useEffect } from 'react';
import { useTimestamp } from '../hooks/useTimestamp';
import { resolveWorkOrder, fetchSensors } from '../utils/api';

function WorkOrderModal({ workOrder, isOpen, onClose, sensors = [], onResolved }) {
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState(null);
  const [resolveSuccess, setResolveSuccess] = useState(false);
  const [currentSensorState, setCurrentSensorState] = useState(null);

  const createdAt = useTimestamp(workOrder?.createdAt);
  const updatedAt = useTimestamp(workOrder?.updatedAt);

  // Fetch current sensor state when modal opens
  useEffect(() => {
    if (isOpen && workOrder && workOrder.category === 'EQUIPMENT_STATE') {
      const sensor = sensors.find(s => 
        s.deviceId === workOrder.deviceId && 
        s.type === workOrder.sensor
      );
      setCurrentSensorState(sensor?.state || null);
    } else {
      setCurrentSensorState(null);
    }
    setResolveError(null);
    setResolveSuccess(false);
  }, [isOpen, workOrder, sensors]);

  if (!isOpen || !workOrder) return null;

  const statusColors = {
    OPEN: 'bg-red-500 text-white',
    IN_PROGRESS: 'bg-orange-500 text-white',
    CLOSED: 'bg-green-500 text-white'
  };

  // Check if quick actions are available
  const isEquipmentState = workOrder.category === 'EQUIPMENT_STATE';
  const controllableSensors = ['conveyor', 'door', 'light'];
  const canResolve = isEquipmentState && 
                     controllableSensors.includes(workOrder.sensor) && 
                     (workOrder.status === 'OPEN' || workOrder.status === 'IN_PROGRESS');

  // Get action button text based on sensor type and current state
  const getActionButtonText = () => {
    if (workOrder.sensor === 'conveyor' && currentSensorState === 'stopped') {
      return 'Start Conveyor';
    } else if (workOrder.sensor === 'door' && currentSensorState === 'open') {
      return 'Close Door';
    } else if (workOrder.sensor === 'light' && currentSensorState === 'off') {
      return 'Turn On Light';
    }
    return null;
  };

  const handleQuickResolve = async () => {
    setIsResolving(true);
    setResolveError(null);
    setResolveSuccess(false);

    try {
      const result = await resolveWorkOrder(workOrder.id, false);
      if (result.success) {
        setResolveSuccess(true);
        // Notify parent to refresh work orders
        if (onResolved) {
          onResolved();
        }
        // Refresh sensor state after a short delay
        setTimeout(async () => {
          try {
            const updatedSensors = await fetchSensors();
            const sensor = updatedSensors.find(s => 
              s.deviceId === workOrder.deviceId && 
              s.type === workOrder.sensor
            );
            setCurrentSensorState(sensor?.state || null);
          } catch (err) {
            console.error('Error fetching updated sensor state:', err);
          }
        }, 2000);
      } else {
        setResolveError(result.error || 'Failed to resolve work order');
      }
    } catch (error) {
      setResolveError(error.message || 'Failed to resolve work order');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-blue-600">{workOrder.id}</h2>
              <p className="text-sm text-gray-600 mt-1">Work Order Issued</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-orange-500">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</label>
                <div className="mt-1">
                  <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase ${statusColors[workOrder.status]}`}>
                    {workOrder.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Priority</label>
                <div className="mt-1">
                  <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                    workOrder.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {workOrder.priority}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Assigned To</label>
                <div className="mt-1">
                  {workOrder.assignedTo ? (
                    <span className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-100 text-blue-700">
                      {workOrder.assignedTo}
                    </span>
                  ) : (
                    <span className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-200 text-gray-600">
                      Unassigned
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Issue Description</label>
              <p className="text-gray-900 mt-1 leading-relaxed bg-gray-50 p-3 rounded border">{workOrder.issue}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Category</label>
                <p className="text-gray-900 mt-1">{workOrder.category}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Device ID</label>
                <p className="text-gray-900 mt-1">Device {workOrder.deviceId}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Sensor</label>
                <p className="text-gray-900 mt-1 capitalize">{workOrder.sensor}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Work Order Number</label>
                <p className="text-gray-900 mt-1 font-mono">{workOrder.number}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Issued At</label>
                <p className="text-gray-900 mt-1">{createdAt}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Last Updated</label>
                <p className="text-gray-900 mt-1">{updatedAt}</p>
              </div>
            </div>

            {/* Quick Actions Section */}
            {canResolve && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-900 mb-3">Quick Resolution</h3>
                {currentSensorState && (
                  <div className="mb-3">
                    <span className="text-xs text-gray-600">Current State: </span>
                    <span className="text-sm font-medium text-gray-900 capitalize">{currentSensorState}</span>
                  </div>
                )}
                {getActionButtonText() && (
                  <div className="space-y-2">
                    <button
                      onClick={handleQuickResolve}
                      disabled={isResolving}
                      className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                        isResolving
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isResolving ? 'Executing...' : getActionButtonText()}
                    </button>
                    {resolveSuccess && (
                      <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                        ✓ Action executed successfully! Sensor state will update shortly.
                      </div>
                    )}
                    {resolveError && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        ✗ Error: {resolveError}
                      </div>
                    )}
                  </div>
                )}
                {!getActionButtonText() && (
                  <p className="text-sm text-gray-600">
                    Sensor state is already in desired state or cannot be determined.
                  </p>
                )}
              </div>
            )}

          </div>

          <div className="mt-6 flex gap-3">
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

export default WorkOrderModal;

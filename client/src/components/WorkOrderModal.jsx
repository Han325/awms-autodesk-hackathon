import { useTimestamp } from '../hooks/useTimestamp';

function WorkOrderModal({ workOrder, isOpen, onClose }) {
  if (!isOpen || !workOrder) return null;

  const createdAt = useTimestamp(workOrder.createdAt);
  const updatedAt = useTimestamp(workOrder.updatedAt);

  const statusColors = {
    OPEN: 'bg-red-500 text-white',
    IN_PROGRESS: 'bg-orange-500 text-white',
    CLOSED: 'bg-green-500 text-white'
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

          </div>

          <div className="mt-6">
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

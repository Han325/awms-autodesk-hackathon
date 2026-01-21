import { useState } from 'react';
import { usePolling } from '../hooks/usePolling';
import { fetchWorkOrders, updateWorkOrder, fetchNotifications, acknowledgeNotification, unacknowledgeNotification } from '../utils/api';

function AdminDashboard() {
  const { data: workOrders } = usePolling(() => fetchWorkOrders(), 3000);
  const { data: notifications } = usePolling(() => fetchNotifications(), 3000);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editAssignedTo, setEditAssignedTo] = useState('');

  const handleEditWorkOrder = (wo) => {
    setSelectedWorkOrder(wo);
    setEditStatus(wo.status);
    setEditAssignedTo(wo.assignedTo || '');
  };

  const handleSaveWorkOrder = async () => {
    if (!selectedWorkOrder) return;
    
    await updateWorkOrder(selectedWorkOrder.id, editStatus, editAssignedTo || null);
    setSelectedWorkOrder(null);
    setEditStatus('');
    setEditAssignedTo('');
  };

  const handleCancelEdit = () => {
    setSelectedWorkOrder(null);
    setEditStatus('');
    setEditAssignedTo('');
  };

  const statusColors = {
    OPEN: 'bg-red-500 text-white',
    IN_PROGRESS: 'bg-orange-500 text-white',
    CLOSED: 'bg-green-500 text-white'
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Admin Panel</h1>
            <p className="text-sm text-gray-600 mt-1">Manage Work Orders & Notifications</p>
          </div>
          <a
            href="/"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            ← Back to Dashboard
          </a>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Work Orders Section */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">
              Work Orders ({workOrders?.length || 0})
            </h2>
            <div className="max-h-[600px] overflow-y-auto space-y-3">
              {!workOrders || workOrders.length === 0 ? (
                <div className="text-center text-gray-500 py-10">No work orders</div>
              ) : (
                workOrders.map(wo => (
                  <div
                    key={wo.id}
                    className={`p-4 rounded-lg border-l-4 border-orange-500 shadow-sm ${
                      selectedWorkOrder?.id === wo.id ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-lg font-bold text-blue-600">{wo.id}</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-bold uppercase ${statusColors[wo.status]}`}>
                          {wo.status}
                        </span>
                      </div>
                      <button
                        onClick={() => handleEditWorkOrder(wo)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{wo.issue}</p>
                    <div className="text-xs text-gray-500">
                      <span>Device {wo.deviceId}</span> • <span>Priority: {wo.priority}</span>
                      {wo.assignedTo && <span> • Assigned: {wo.assignedTo}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Edit Panel / Notifications */}
          <div className="space-y-6">
            {selectedWorkOrder ? (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-blue-600 mb-4">
                  Edit Work Order: {selectedWorkOrder.id}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Assign To
                    </label>
                    <input
                      type="text"
                      value={editAssignedTo}
                      onChange={(e) => setEditAssignedTo(e.target.value)}
                      placeholder="Enter name or leave empty"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveWorkOrder}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-blue-600 mb-4">
                  Notifications ({notifications?.length || 0})
                </h2>
                <div className="max-h-[600px] overflow-y-auto space-y-3">
                  {!notifications || notifications.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">No notifications</div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`p-4 rounded-lg border-l-4 ${
                          notif.tier === 'CRITICAL' ? 'border-red-500' :
                          notif.tier === 'WARNING' ? 'border-orange-500' : 'border-blue-500'
                        } ${notif.acknowledged ? 'opacity-60' : ''} bg-gray-50`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                            notif.tier === 'CRITICAL' ? 'bg-red-500 text-white' :
                            notif.tier === 'WARNING' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                          }`}>
                            {notif.tier}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">
                              {notif.acknowledged ? 'Acknowledged' : 'Pending'}
                            </span>
                            <button
                              onClick={async () => {
                                if (notif.acknowledged) {
                                  await unacknowledgeNotification(notif.id);
                                } else {
                                  await acknowledgeNotification(notif.id);
                                }
                              }}
                              className={`text-xs px-2 py-1 rounded ${
                                notif.acknowledged
                                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              } transition-colors`}
                            >
                              {notif.acknowledged ? 'Unacknowledge' : 'Acknowledge'}
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{notif.reasoning}</p>
                        <div className="text-xs text-gray-500">
                          <span>{notif.category}</span> • <span>Device {notif.deviceId}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

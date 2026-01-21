import SensorGrid from './SensorGrid';
import NotificationList from './NotificationList';
import WorkOrderList from './WorkOrderList';

function Dashboard({ sensors, notifications, workOrders, onRefreshNotifications }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-blue-600">
            Alert & Work Order Management System
          </h1>
          <div className="flex items-center gap-4">
            <a
              href="/admin"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Admin Panel
            </a>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          <section className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">Sensor Data</h2>
            <SensorGrid sensors={sensors} />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NotificationList
              notifications={notifications || []}
              onRefresh={onRefreshNotifications}
            />
            <WorkOrderList workOrders={workOrders || []} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

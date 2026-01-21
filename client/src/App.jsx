import { usePolling } from './hooks/usePolling';
import { fetchSensors, fetchNotifications, fetchWorkOrders } from './utils/api';
import Dashboard from './components/Dashboard';

function App() {
  const { data: sensors, loading: sensorsLoading } = usePolling(fetchSensors, 3000);
  const { data: notifications, loading: notificationsLoading } = usePolling(fetchNotifications, 3000);
  const { data: workOrders, loading: workOrdersLoading } = usePolling(() => fetchWorkOrders('open'), 3000);

  const handleRefreshNotifications = () => {
    // The polling hook will automatically refresh on next interval
  };

  if (sensorsLoading && sensors === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-blue-600 text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <Dashboard
      sensors={sensors || []}
      notifications={notifications || []}
      workOrders={workOrders || []}
      onRefreshNotifications={handleRefreshNotifications}
    />
  );
}

export default App;

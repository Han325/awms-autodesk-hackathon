import { useState, useEffect } from 'react';
import { usePolling } from './hooks/usePolling';
import { fetchSensors, fetchNotifications, fetchWorkOrders } from './utils/api';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen for popstate (back/forward buttons)
    window.addEventListener('popstate', handleLocationChange);
    
    // Intercept link clicks
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('/')) {
        e.preventDefault();
        window.history.pushState({}, '', e.target.getAttribute('href'));
        handleLocationChange();
      }
    });

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const { data: sensors, loading: sensorsLoading, refresh: refreshSensors } = usePolling(fetchSensors, 3000);
  const { data: notifications, loading: notificationsLoading } = usePolling(fetchNotifications, 3000);
  const { data: workOrders, loading: workOrdersLoading } = usePolling(() => fetchWorkOrders('open'), 3000);

  const handleRefreshNotifications = () => {
    // The polling hook will automatically refresh on next interval
  };

  const handleRefreshWorkOrders = () => {
    // The polling hook will automatically refresh on next interval
  };

  const handleRefreshSensors = () => {
    refreshSensors();
  };

  if (currentPath === '/admin') {
    return <AdminDashboard />;
  }

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
      onRefreshWorkOrders={handleRefreshWorkOrders}
      onRefreshSensors={handleRefreshSensors}
    />
  );
}

export default App;

import { useState } from 'react';
import NotificationCard from './NotificationCard';
import CategorizationInfoModal from './CategorizationInfoModal';

function NotificationList({ notifications, onRefresh }) {
  const [filter, setFilter] = useState('all');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.tier === filter);

  const unacknowledgedCount = notifications.filter(n => !n.acknowledged).length;

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'CRITICAL', label: 'Critical' },
    { key: 'WARNING', label: 'Warning' },
    { key: 'INFO', label: 'Info' }
  ];

  return (
    <>
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-blue-600 mb-4 flex items-center gap-2">
          Notifications
          {unacknowledgedCount > 0 && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              {unacknowledgedCount}
            </span>
          )}
          <button
            onClick={() => setIsInfoModalOpen(true)}
            className="ml-auto text-gray-400 hover:text-blue-600 transition-colors"
            title="Learn about categorization"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </h2>
      <div className="flex gap-2 mb-4">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
              filter === f.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="max-h-[500px] overflow-y-auto space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No notifications
          </div>
        ) : (
          filteredNotifications.map(notif => (
            <NotificationCard
              key={notif.id}
              notification={notif}
              onAcknowledge={onRefresh}
            />
          ))
        )}
      </div>
      </div>
      <CategorizationInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </>
  );
}

export default NotificationList;

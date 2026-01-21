// Notification service with tiered alerts
// Future: ML will optimize notification routing and reduce false positives

const notifications = [];
const MAX_NOTIFICATIONS = 100;

function addNotification(evaluation) {
  const notification = {
    id: Date.now() + Math.random(),
    tier: evaluation.tier,
    category: evaluation.category,
    reasoning: evaluation.reasoning,
    deviceId: evaluation.deviceId,
    sensor: evaluation.sensor,
    value: evaluation.value,
    timestamp: evaluation.timestamp || new Date().toISOString(),
    acknowledged: false
  };
  
  // Prevent duplicate notifications (same device + sensor + tier within 30 seconds)
  const recentDuplicate = notifications.find(n => 
    n.deviceId === notification.deviceId &&
    n.sensor === notification.sensor &&
    n.tier === notification.tier &&
    !n.acknowledged &&
    new Date(notification.timestamp) - new Date(n.timestamp) < 30000
  );
  
  if (!recentDuplicate) {
    notifications.unshift(notification);
    
    // Keep only recent notifications
    if (notifications.length > MAX_NOTIFICATIONS) {
      notifications.pop();
    }
    
    console.log(`[${notification.tier}] ${notification.category}: ${notification.reasoning}`);
  }
  
  return notification;
}

function getAllNotifications() {
  return notifications;
}

function getNotificationsByTier(tier) {
  return notifications.filter(n => n.tier === tier);
}

function acknowledgeNotification(id) {
  const notification = notifications.find(n => n.id === id);
  if (notification) {
    notification.acknowledged = true;
  }
  return notification;
}

function unacknowledgeNotification(id) {
  const notification = notifications.find(n => n.id === id);
  if (notification) {
    notification.acknowledged = false;
  }
  return notification;
}

function getUnacknowledgedCount() {
  return notifications.filter(n => !n.acknowledged).length;
}

module.exports = {
  addNotification,
  getAllNotifications,
  getNotificationsByTier,
  acknowledgeNotification,
  unacknowledgeNotification,
  getUnacknowledgedCount
};

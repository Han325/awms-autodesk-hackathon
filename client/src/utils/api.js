import axios from 'axios';

const API_BASE = '/api';

export async function fetchSensors() {
  const response = await axios.get(`${API_BASE}/sensors`);
  return response.data;
}

export async function fetchNotifications(tier = null) {
  const url = tier ? `${API_BASE}/notifications?tier=${tier}` : `${API_BASE}/notifications`;
  const response = await axios.get(url);
  return response.data;
}

export async function acknowledgeNotification(id) {
  const response = await axios.post(`${API_BASE}/notifications/${id}/acknowledge`);
  return response.data;
}

export async function unacknowledgeNotification(id) {
  const response = await axios.post(`${API_BASE}/notifications/${id}/unacknowledge`);
  return response.data;
}

export async function fetchWorkOrders(status = null) {
  const url = status ? `${API_BASE}/work-orders?status=${status}` : `${API_BASE}/work-orders`;
  const response = await axios.get(url);
  return response.data;
}

export async function updateWorkOrder(id, status, assignedTo = null) {
  const response = await axios.patch(`${API_BASE}/work-orders/${id}`, { status, assignedTo });
  return response.data;
}

export async function resolveWorkOrder(id, autoClose = false) {
  const response = await axios.post(`${API_BASE}/work-orders/${id}/resolve`, { autoClose });
  return response.data;
}

export async function getDeviceState(locationId, sensorType) {
  const response = await axios.get(`${API_BASE}/devices/${locationId}/${sensorType}/state`);
  return response.data;
}

export async function controlDevice(locationId, sensorType, action) {
  const response = await axios.post(`${API_BASE}/devices/control`, { 
    locationId, 
    sensorType, 
    action 
  });
  return response.data;
}

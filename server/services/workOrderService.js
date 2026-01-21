// Work order service - auto-generates work orders for critical issues
// Future: ML will predict maintenance needs and optimize work order scheduling

const workOrders = [];
let workOrderCounter = 1;

function createWorkOrder(evaluation) {
  // Check if work order already exists for this issue (within last 5 minutes)
  const recentOrder = workOrders.find(wo => 
    wo.deviceId === evaluation.deviceId &&
    wo.sensor === evaluation.sensor &&
    wo.status === 'OPEN' &&
    new Date() - new Date(wo.createdAt) < 300000
  );
  
  if (recentOrder) {
    return recentOrder;
  }
  
  const workOrder = {
    id: `WO-${String(workOrderCounter).padStart(4, '0')}`,
    number: workOrderCounter++,
    deviceId: evaluation.deviceId,
    sensor: evaluation.sensor,
    category: evaluation.category,
    issue: evaluation.reasoning,
    priority: evaluation.tier === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
    status: 'OPEN',
    assignedTo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  workOrders.unshift(workOrder);
  console.log(`Work Order Created: ${workOrder.id} - ${workOrder.issue}`);
  
  return workOrder;
}

function getAllWorkOrders() {
  return workOrders;
}

function getOpenWorkOrders() {
  return workOrders.filter(wo => wo.status === 'OPEN');
}

function hasOpenWorkOrder(deviceId, sensor) {
  return workOrders.some(wo => 
    wo.deviceId === deviceId &&
    wo.sensor === sensor &&
    wo.status === 'OPEN'
  );
}

function updateWorkOrderStatus(id, status, assignedTo = null) {
  const workOrder = workOrders.find(wo => wo.id === id);
  if (workOrder) {
    workOrder.status = status;
    workOrder.assignedTo = assignedTo;
    workOrder.updatedAt = new Date().toISOString();
  }
  return workOrder;
}

module.exports = {
  createWorkOrder,
  getAllWorkOrders,
  getOpenWorkOrders,
  updateWorkOrderStatus,
  hasOpenWorkOrder
};

import WorkOrderCard from './WorkOrderCard';

function WorkOrderList({ workOrders, sensors, onRefresh }) {
  const openCount = workOrders.filter(wo => wo.status === 'OPEN').length;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <h2 className="text-xl font-semibold text-blue-600 mb-4 flex items-center gap-2">
        Work Orders
        {openCount > 0 && (
          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {openCount}
          </span>
        )}
      </h2>
      <div className="max-h-[500px] overflow-y-auto space-y-3">
        {workOrders.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No open work orders
          </div>
        ) : (
          workOrders.map(wo => (
            <WorkOrderCard key={wo.id} workOrder={wo} sensors={sensors} onResolved={onRefresh} />
          ))
        )}
      </div>
    </div>
  );
}

export default WorkOrderList;

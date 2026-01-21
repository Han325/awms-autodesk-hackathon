import { useState } from 'react';
import { useRelativeTime } from '../hooks/useRelativeTime';
import WorkOrderModal from './WorkOrderModal';

function WorkOrderCard({ workOrder, sensors, onResolved }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const relativeTime = useRelativeTime(workOrder.createdAt);

  const statusColors = {
    OPEN: 'bg-red-500 text-white',
    IN_PROGRESS: 'bg-orange-500 text-white',
    CLOSED: 'bg-green-500 text-white'
  };

  return (
    <>
      <div 
        className="bg-white p-4 rounded-lg border-l-4 border-orange-500 shadow-sm cursor-pointer transition-transform hover:translate-x-1"
        onClick={() => setIsModalOpen(true)}
      >
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-bold text-blue-600">
          {workOrder.id}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${statusColors[workOrder.status]}`}>
          {workOrder.status}
        </span>
      </div>
      <div className="text-gray-800 text-sm mt-3">
        {workOrder.issue}
      </div>
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span>Device {workOrder.deviceId}</span>
        <span>Priority: {workOrder.priority}</span>
        <span>{relativeTime}</span>
      </div>
      <div className="text-xs text-blue-600 mt-2 font-medium">
        Click to view details →
      </div>
    </div>
      <WorkOrderModal
        workOrder={workOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sensors={sensors}
        onResolved={onResolved}
      />
    </>
  );
}

export default WorkOrderCard;

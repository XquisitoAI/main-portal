import React from 'react';
import { formatTimeAgo } from '../../utils/formatters';
interface Activity {
  id: string;
  type: string;
  orderId: string;
  branchId: string;
  clientName: string;
  status: string;
  timestamp: string;
}
interface ActivityLogProps {
  activities: Activity[];
}
const ActivityLog: React.FC<ActivityLogProps> = ({
  activities
}) => {
  return <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-800 mb-4">
        Actividad Reciente
      </h2>
      <div className="space-y-4">
        {activities.length === 0 ? <p className="text-gray-500 text-center py-4">
            No hay actividad reciente
          </p> : activities.map(activity => <div key={activity.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Orden {activity.orderId}
                  </p>
                  <p className="text-xs text-gray-500">{activity.clientName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-600">
                  {activity.status}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>)}
      </div>
      {activities.length > 0 && <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800">
            Ver toda la actividad
          </button>
        </div>}
    </div>;
};
export default ActivityLog;
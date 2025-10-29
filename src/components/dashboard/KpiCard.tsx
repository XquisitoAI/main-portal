import React from 'react';
interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}
const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  color,
  onClick
}) => {
  return <div className="bg-white rounded-lg shadow-sm p-6 transition-all duration-200 hover:shadow-md cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <div className={`rounded-full p-3 ${color}`}>{icon}</div>
      </div>
      <div className="mt-4">
        <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
          Ver todo
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>;
};
export default KpiCard;
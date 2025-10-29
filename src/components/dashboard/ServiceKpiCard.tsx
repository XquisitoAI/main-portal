import React, { useState } from 'react';
import { formatCurrency, formatCompactNumber, formatPercent } from '../../utils/formatters';
import ServiceDashboardModal from './ServiceDashboardModal';
interface KeyMetric {
  name: string;
  value: number;
  unit: string;
}
interface ServiceKpiCardProps {
  name: string;
  status: 'active' | 'paused' | 'suspended' | 'trial';
  gmv: number;
  gmvPercentage: number;
  usage: number;
  quota: number;
  keyMetric: KeyMetric;
  secondaryMetric: KeyMetric;
  onClick?: () => void;
}
const ServiceKpiCard: React.FC<ServiceKpiCardProps> = ({
  name,
  status,
  gmv,
  gmvPercentage,
  usage,
  quota,
  keyMetric,
  secondaryMetric,
  onClick
}) => {
  // Estado para controlar la visualización del modal
  const [showDashboard, setShowDashboard] = useState(false);
  // Status badge styling
  const getStatusStyle = () => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'trial':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  // Key metric styling
  const getMetricStyle = () => {
    if (keyMetric.name === 'Tasa de aprobación' && keyMetric.value < 90) {
      return 'text-red-600';
    }
    return 'text-gray-700';
  };
  // Manejar el clic en la tarjeta
  const handleCardClick = () => {
    setShowDashboard(true);
    if (onClick) onClick();
  };
  return <>
      <div className="bg-gray-50 rounded-lg border border-gray-100 p-3 cursor-pointer transition-all hover:shadow-sm hover:bg-gray-50" onClick={handleCardClick}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-800 text-sm">{name}</h3>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusStyle()}`}>
            {status === 'active' ? 'activo' : status === 'paused' ? 'pausado' : status === 'suspended' ? 'suspendido' : 'prueba'}
          </span>
        </div>
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">GMV</span>
            <span className="text-xs font-medium">
              {formatCompactNumber(gmv)}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-500">{keyMetric.name}</p>
            <p className={`text-xs font-medium ${getMetricStyle()}`}>
              {keyMetric.value}
              {keyMetric.unit}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{secondaryMetric.name}</p>
            <p className="text-xs font-medium">
              {secondaryMetric.value}
              {secondaryMetric.unit}
            </p>
          </div>
        </div>
      </div>
      {/* Modal de dashboard detallado */}
      {showDashboard && <ServiceDashboardModal onClose={() => setShowDashboard(false)} serviceName={name} />}
    </>;
};
export default ServiceKpiCard;
import React, { useState } from 'react';
import { formatChange } from '../../utils/formatters';
import DetailedVolumeChart from './DetailedVolumeChart';
import DetailedMetricChart from './DetailedMetricChart';
import DetailedPaymentMethodsChart from './DetailedPaymentMethodsChart';
import type { SuperAdminFilters } from '../../types/api';

interface GlobalKpiCardProps {
  title: string;
  value: string;
  previousValue: string;
  change: number;
  trendData: number[];
  tooltip?: string;
  thresholds?: {
    warning: number;
    danger: number;
  };
  icon?: React.ReactNode;
  onClick?: () => void;
  isText?: boolean;
  hideChange?: boolean;
  filters?: SuperAdminFilters;
}
const GlobalKpiCard: React.FC<GlobalKpiCardProps> = ({
  title,
  value,
  previousValue,
  change,
  trendData,
  tooltip,
  thresholds,
  icon,
  onClick,
  isText = false,
  hideChange = false,
  filters
}) => {
  const [showDetailedChart, setShowDetailedChart] = useState(false);
  // Determinar el tipo de tarjeta para mostrar la gráfica adecuada
  const getCardType = () => {
    if (title === 'Volumen transaccionado') return 'volume';
    if (title === 'Ingresos Xquisito') return 'revenue';
    if (title === 'Órdenes Exitosas') return 'orders';
    if (title === 'Diners Activos') return 'diners';
    if (title === 'Total de Transacciones') return 'transactions';
    if (title === 'Clientes con Pago a Meses') return 'monthlyClients';
    if (title === 'Tasa de Conversión de Invitados a Usuarios') return 'conversionRate';
    if (title === 'Administradores Activos') return 'adminUsers';
    if (title === 'Tasa de Aprobación de Pagos') return 'paymentApprovalRate';
    if (title === 'Método de Pago más Usado') return 'paymentMethod';
    return 'other';
  };
  // Determinar si la tarjeta debe mostrar una gráfica detallada
  const shouldShowDetailedChart = () => {
    const cardType = getCardType();
    return ['volume', 'revenue', 'orders', 'diners', 'transactions', 'monthlyClients', 'conversionRate', 'adminUsers', 'paymentApprovalRate', 'paymentMethod'].includes(cardType);
  };
  // Manejar clic en la tarjeta
  const handleCardClick = () => {
    if (shouldShowDetailedChart()) {
      setShowDetailedChart(true);
    } else if (onClick) {
      onClick();
    }
  };
  // Determinar color del indicador de cambio
  const getChangeColor = () => {
    if (thresholds) {
      if (change < thresholds.danger) return 'text-red-600 bg-red-50';
      if (change < thresholds.warning) return 'text-yellow-600 bg-yellow-50';
      return 'text-green-600 bg-green-50';
    }
    return change >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  };
  // Determinar el tipo de métrica para la gráfica
  const getMetricType = () => {
    if (title.includes('Volumen') || title.includes('Ingresos')) return 'currency';
    if (title.includes('Tasa') || title.includes('Conversión') || title.includes('Aprobación')) return 'percent';
    return 'number';
  };
  // Determinar el color para la gráfica
  const getChartColor = () => {
    if (title === 'Volumen transaccionado') return '#22c55e'; // verde
    if (title === 'Ingresos Xquisito') return '#3b82f6'; // azul
    if (title === 'Órdenes Exitosas') return '#22c55e'; // verde
    if (title === 'Diners Activos') return '#6366f1'; // indigo
    if (title === 'Total de Transacciones') return '#6366f1'; // indigo
    if (title === 'Clientes con Pago a Meses') return '#f97316'; // naranja
    if (title === 'Tasa de Conversión de Invitados a Usuarios') return '#a855f7'; // morado
    if (title === 'Administradores Activos') return '#9333ea'; // morado oscuro
    if (title === 'Tasa de Aprobación de Pagos') return '#10b981'; // verde esmeralda
    if (title === 'Método de Pago más Usado') return '#0ea5e9'; // azul cielo
    return '#8884d8'; // default
  };
  return <>
      <div className={`bg-white rounded-lg p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-shadow ${shouldShowDetailedChart() ? 'cursor-pointer' : ''}`} onClick={handleCardClick} title={tooltip}>
        <div className="flex justify-between items-start gap-1">
          <div className="flex items-center min-w-0 flex-1">
            {icon && <span className="mr-1 sm:mr-1.5 flex-shrink-0">{icon}</span>}
            <h3 className="text-xs sm:text-sm font-medium text-gray-700 truncate">{title}</h3>
          </div>
          {!hideChange && (
            <div className={`text-[10px] sm:text-xs font-medium px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0 ${getChangeColor()}`}>
              {formatChange(change)}
            </div>
          )}
        </div>
        <div className="mt-1.5 sm:mt-2">
          <div className="text-lg sm:text-xl font-semibold text-gray-800 truncate">{value}</div>
        </div>
      </div>
      {/* Mostrar gráfica detallada cuando showDetailedChart es true */}
      {showDetailedChart && (getCardType() === 'volume' ? <DetailedVolumeChart onClose={() => setShowDetailedChart(false)} initialFilters={filters} /> : getCardType() === 'paymentMethod' ? <DetailedPaymentMethodsChart onClose={() => setShowDetailedChart(false)} initialFilters={filters} /> : <DetailedMetricChart onClose={() => setShowDetailedChart(false)} title={title} metricType={getMetricType()} metricLabel={title} color={getChartColor()} initialFilters={filters} />)}
    </>;
};
export default GlobalKpiCard;
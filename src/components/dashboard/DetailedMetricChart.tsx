import React, { useEffect, useState } from 'react';
import { XIcon, RefreshCwIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatCurrency, formatNumber, formatPercent, formatChange } from '../../utils/formatters';
interface DetailedMetricChartProps {
  onClose: () => void;
  title: string;
  metricType: 'currency' | 'number' | 'percent';
  metricLabel: string;
  color?: string;
}
// Datos mock para la gráfica
const generateMockData = (viewType: 'daily' | 'weekly' | 'monthly', startDate: Date, endDate: Date, metricType: 'currency' | 'number' | 'percent') => {
  const data = [];
  const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  // Rangos de valores según tipo de métrica
  let minValue, maxValue;
  switch (metricType) {
    case 'currency':
      minValue = 50000;
      maxValue = 100000;
      break;
    case 'number':
      minValue = 100;
      maxValue = 1000;
      break;
    case 'percent':
      minValue = 10;
      maxValue = 100;
      break;
    default:
      minValue = 50;
      maxValue = 500;
  }
  // Generar datos según el tipo de vista
  if (viewType === 'daily') {
    // Datos diarios
    for (let i = 0; i <= dayDiff; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      data.push({
        date: currentDate.toISOString().split('T')[0],
        value: Math.floor(Math.random() * (maxValue - minValue)) + minValue
      });
    }
  } else if (viewType === 'weekly') {
    // Datos semanales
    const weekCount = Math.ceil(dayDiff / 7);
    for (let i = 0; i < weekCount; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i * 7);
      data.push({
        date: `Semana ${i + 1}`,
        value: Math.floor(Math.random() * (maxValue * 3 - minValue * 3)) + minValue * 3
      });
    }
  } else {
    // Datos mensuales
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();
    const yearDiff = endDate.getFullYear() - startDate.getFullYear();
    const monthDiff = endMonth - startMonth + yearDiff * 12;
    for (let i = 0; i <= monthDiff; i++) {
      const currentDate = new Date(startDate);
      currentDate.setMonth(startDate.getMonth() + i);
      data.push({
        date: `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`,
        value: Math.floor(Math.random() * (maxValue * 6 - minValue * 6)) + minValue * 6
      });
    }
  }
  return data;
};
// Calcular el cambio porcentual
const calculatePercentChange = (data: any[]) => {
  if (data.length < 2) return 0;
  // Para simplificar, comparamos el último valor con el primero
  const firstValue = data[0].value;
  const lastValue = data[data.length - 1].value;
  return (lastValue - firstValue) / firstValue * 100;
};
const DetailedMetricChart: React.FC<DetailedMetricChartProps> = ({
  onClose,
  title,
  metricType,
  metricLabel,
  color = '#8884d8'
}) => {
  // Estado para los filtros
  const [viewType, setViewType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });
  // Estado para los datos de la gráfica
  const [chartData, setChartData] = useState<any[]>([]);
  const [percentChange, setPercentChange] = useState<number>(0);
  // Actualizar los datos cuando cambien los filtros
  useEffect(() => {
    const data = generateMockData(viewType, dateRange.startDate, dateRange.endDate, metricType);
    setChartData(data);
    setPercentChange(calculatePercentChange(data));
  }, [viewType, dateRange, metricType]);
  // Formatear valores según el tipo de métrica
  const formatValue = (value: number) => {
    switch (metricType) {
      case 'currency':
        return formatCurrency(value);
      case 'number':
        return formatNumber(value);
      case 'percent':
        return formatPercent(value);
      default:
        return value.toString();
    }
  };
  // Formatear fechas para los inputs
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  // Manejar cambios en el rango de fechas
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({
      ...dateRange,
      startDate: new Date(e.target.value)
    });
  };
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({
      ...dateRange,
      endDate: new Date(e.target.value)
    });
  };
  // Función para limpiar filtros
  const resetFilters = () => {
    setViewType('weekly');
    setDateRange({
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date()
    });
  };
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 mx-4 relative">
        {/* Botón de cierre */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <XIcon className="w-5 h-5" />
        </button>
        {/* Título y cambio porcentual */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            {title} por período
          </h3>
          <div className={`text-sm font-medium px-2 py-1 rounded ${percentChange >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {formatChange(percentChange)}
          </div>
        </div>
        {/* Controles de filtro */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          {/* Selector de rango de fechas */}
          <div className="flex gap-2 items-center">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Inicio</label>
              <input type="date" value={formatDateForInput(dateRange.startDate)} onChange={handleStartDateChange} className="text-sm p-1.5 border border-gray-200 rounded" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Fin</label>
              <input type="date" value={formatDateForInput(dateRange.endDate)} onChange={handleEndDateChange} className="text-sm p-1.5 border border-gray-200 rounded" />
            </div>
          </div>
          {/* Toggle de visualización */}
          <div className="flex bg-gray-100 rounded-md p-1 ml-auto">
            <button onClick={() => setViewType('daily')} className={`px-3 py-1 text-sm rounded-md ${viewType === 'daily' ? 'bg-white text-purple-700 shadow' : 'text-gray-600'}`}>
              Diario
            </button>
            <button onClick={() => setViewType('weekly')} className={`px-3 py-1 text-sm rounded-md ${viewType === 'weekly' ? 'bg-white text-purple-700 shadow' : 'text-gray-600'}`}>
              Semanal
            </button>
            <button onClick={() => setViewType('monthly')} className={`px-3 py-1 text-sm rounded-md ${viewType === 'monthly' ? 'bg-white text-purple-700 shadow' : 'text-gray-600'}`}>
              Mensual
            </button>
          </div>
        </div>
        {/* Gráfica */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 30
          }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{
              fontSize: 12
            }} tickMargin={10} axisLine={{
              stroke: '#E5E7EB'
            }} tickLine={false} />
              <YAxis tickFormatter={value => {
              const formatted = formatValue(value);
              return metricType === 'currency' ? formatted.split('.')[0] : formatted;
            }} tick={{
              fontSize: 12
            }} axisLine={false} tickLine={false} />
              <Tooltip formatter={value => [formatValue(value as number), metricLabel]} labelFormatter={label => `Fecha: ${label}`} />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{
              r: 4,
              fill: color
            }} activeDot={{
              r: 6
            }} />
              <ReferenceLine y={chartData.length > 0 ? chartData[0].value : 0} stroke="#ddd" strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Botón de limpiar filtros */}
        <div className="flex justify-end mt-4">
          <button onClick={resetFilters} className="flex items-center text-sm text-gray-600 hover:text-purple-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded transition-colors">
            <RefreshCwIcon className="w-4 h-4 mr-1.5" />
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>;
};
export default DetailedMetricChart;
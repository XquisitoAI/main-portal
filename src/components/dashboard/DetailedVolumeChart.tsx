import React, { useEffect, useState } from 'react';
import { XIcon, RefreshCwIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatCurrency, formatChange } from '../../utils/formatters';
interface DetailedVolumeChartProps {
  onClose: () => void;
}
// Datos mock para la gráfica
const generateMockData = (viewType: 'daily' | 'weekly' | 'monthly', startDate: Date, endDate: Date) => {
  const data = [];
  const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  // Generar datos según el tipo de vista
  if (viewType === 'daily') {
    // Datos diarios
    for (let i = 0; i <= dayDiff; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      data.push({
        date: currentDate.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 50000) + 50000 // Valor aleatorio entre 50,000 y 100,000
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
        value: Math.floor(Math.random() * 300000) + 200000 // Valor aleatorio entre 200,000 y 500,000
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
        value: Math.floor(Math.random() * 1000000) + 500000 // Valor aleatorio entre 500,000 y 1,500,000
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
const DetailedVolumeChart: React.FC<DetailedVolumeChartProps> = ({
  onClose
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
    const data = generateMockData(viewType, dateRange.startDate, dateRange.endDate);
    setChartData(data);
    setPercentChange(calculatePercentChange(data));
  }, [viewType, dateRange]);
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
            Volumen Transaccionado por período
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
              <YAxis tickFormatter={value => formatCurrency(value).split('.')[0]} tick={{
              fontSize: 12
            }} axisLine={false} tickLine={false} />
              <Tooltip formatter={value => [formatCurrency(value), 'Volumen']} labelFormatter={label => `Fecha: ${label}`} />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={{
              r: 4,
              fill: '#8884d8'
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
export default DetailedVolumeChart;
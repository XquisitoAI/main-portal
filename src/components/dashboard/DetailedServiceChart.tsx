import React, { useEffect, useState } from 'react';
import { XIcon, RefreshCwIcon, SearchIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency, formatNumber, formatChange } from '../../utils/formatters';
interface DetailedServiceChartProps {
  onClose: () => void;
  title: string;
  chartType: 'volume' | 'orders' | 'transactions';
  serviceData: {
    name: string;
    value: number;
    color: string;
  }[];
}
// Datos mock para la gráfica temporal
const generateMockTimeData = (chartType: 'volume' | 'orders' | 'transactions', viewType: 'daily' | 'weekly' | 'monthly', startDate: Date, endDate: Date, serviceData: {
  name: string;
  value: number;
  color: string;
}[]) => {
  const data = [];
  const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  // Generar datos según el tipo de vista
  if (viewType === 'daily') {
    // Limitamos a 14 días para mejor visualización
    for (let i = 0; i <= Math.min(dayDiff, 14); i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const entry: any = {
        date: currentDate.toISOString().split('T')[0]
      };
      // Agregar valores para cada servicio
      serviceData.forEach(service => {
        // Valor base proporcional al valor actual del servicio
        const baseValue = service.value / 30; // Dividir el valor total entre 30 días
        // Añadir variación aleatoria (±20%)
        const randomFactor = 0.8 + Math.random() * 0.4;
        // Tendencia ascendente suave (aumenta ligeramente con el tiempo)
        const trendFactor = 1 + i / 30 * 0.1;
        let value = Math.round(baseValue * randomFactor * trendFactor);
        // Ajustar según el tipo de gráfica
        if (chartType === 'volume') {
          // Los valores ya están en formato adecuado
        } else if (chartType === 'orders' || chartType === 'transactions') {
          // Redondear a enteros para órdenes y transacciones
          value = Math.round(value);
        }
        entry[service.name] = value;
      });
      data.push(entry);
    }
  } else if (viewType === 'weekly') {
    const weekCount = Math.ceil(dayDiff / 7);
    for (let i = 0; i < Math.min(weekCount, 8); i++) {
      const entry: any = {
        date: `Semana ${i + 1}`
      };
      serviceData.forEach(service => {
        // Valor base proporcional al valor actual del servicio
        const baseValue = service.value / 4; // Dividir el valor total entre 4 semanas
        // Añadir variación aleatoria (±15%)
        const randomFactor = 0.85 + Math.random() * 0.3;
        // Tendencia ascendente suave
        const trendFactor = 1 + i / 8 * 0.15;
        let value = Math.round(baseValue * randomFactor * trendFactor);
        // Ajustar según el tipo de gráfica
        if (chartType === 'volume') {
          // Los valores ya están en formato adecuado
        } else if (chartType === 'orders' || chartType === 'transactions') {
          // Redondear a enteros para órdenes y transacciones
          value = Math.round(value);
        }
        entry[service.name] = value;
      });
      data.push(entry);
    }
  } else {
    // Datos mensuales
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();
    const yearDiff = endDate.getFullYear() - startDate.getFullYear();
    const monthDiff = endMonth - startMonth + yearDiff * 12;
    for (let i = 0; i <= Math.min(monthDiff, 6); i++) {
      const currentDate = new Date(startDate);
      currentDate.setMonth(startDate.getMonth() + i);
      const entry: any = {
        date: `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`
      };
      serviceData.forEach(service => {
        // Valor base proporcional al valor actual del servicio
        const baseValue = service.value; // Valor mensual
        // Añadir variación aleatoria (±10%)
        const randomFactor = 0.9 + Math.random() * 0.2;
        // Tendencia ascendente suave
        const trendFactor = 1 + i / 6 * 0.2;
        let value = Math.round(baseValue * randomFactor * trendFactor);
        // Ajustar según el tipo de gráfica
        if (chartType === 'volume') {
          // Los valores ya están en formato adecuado
        } else if (chartType === 'orders' || chartType === 'transactions') {
          // Redondear a enteros para órdenes y transacciones
          value = Math.round(value);
        }
        entry[service.name] = value;
      });
      data.push(entry);
    }
  }
  return data;
};
// Calcular el cambio porcentual total
const calculateTotalChange = (data: any[], services: string[]) => {
  if (data.length < 2) return 0;
  // Sumar todos los valores del primer período
  const firstTotal = services.reduce((sum, service) => {
    return sum + (data[0][service] || 0);
  }, 0);
  // Sumar todos los valores del último período
  const lastTotal = services.reduce((sum, service) => {
    return sum + (data[data.length - 1][service] || 0);
  }, 0);
  // Calcular el cambio porcentual
  return (lastTotal - firstTotal) / firstTotal * 100;
};
const DetailedServiceChart: React.FC<DetailedServiceChartProps> = ({
  onClose,
  title,
  chartType,
  serviceData
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
  // Extraer nombres de servicios
  const serviceNames = serviceData.map(service => service.name);
  // Actualizar los datos cuando cambien los filtros
  useEffect(() => {
    const data = generateMockTimeData(chartType, viewType, dateRange.startDate, dateRange.endDate, serviceData);
    setChartData(data);
    setPercentChange(calculateTotalChange(data, serviceNames));
  }, [viewType, dateRange, chartType, serviceData]);
  // Formatear valores según el tipo de métrica
  const formatValue = (value: number) => {
    switch (chartType) {
      case 'volume':
        return formatCurrency(value);
      case 'orders':
      case 'transactions':
        return formatNumber(value);
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
  // Personalizar tooltip
  const CustomTooltip = ({
    active,
    payload,
    label
  }: any) => {
    if (active && payload && payload.length) {
      return <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
          <p className="text-sm font-medium mb-1">{`Fecha: ${label}`}</p>
          {payload.map((entry: any, index: number) => <div key={index} className="flex justify-between items-center text-xs mb-1">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-1" style={{
              backgroundColor: entry.color
            }} />
                <span>{entry.name}: </span>
              </div>
              <span className="font-medium ml-2">
                {formatValue(entry.value)}
              </span>
            </div>)}
          <div className="text-xs font-medium border-t border-gray-100 mt-1 pt-1">
            Total:{' '}
            {formatValue(payload.reduce((sum: number, entry: any) => sum + entry.value, 0))}
          </div>
        </div>;
    }
    return null;
  };
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 mx-4 relative">
        {/* Botón de cierre */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <XIcon className="w-5 h-5" />
        </button>
        {/* Título y cambio porcentual */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
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
              return chartType === 'volume' ? formatted.split('.')[0] : formatted;
            }} tick={{
              fontSize: 12
            }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{
              paddingTop: 15,
              fontSize: 12
            }} />
              {serviceData.map(service => <Line key={service.name} type="monotone" dataKey={service.name} stroke={service.color} strokeWidth={2} dot={{
              r: 3,
              fill: service.color
            }} activeDot={{
              r: 5
            }} />)}
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
export default DetailedServiceChart;
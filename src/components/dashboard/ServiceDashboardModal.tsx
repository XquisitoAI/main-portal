import React, { useEffect, useState } from 'react';
import { XIcon, RefreshCwIcon, ChevronDownIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatNumber, formatChange } from '../../utils/formatters';
interface ServiceDashboardModalProps {
  onClose: () => void;
  serviceName: string;
}
const ServiceDashboardModal: React.FC<ServiceDashboardModalProps> = ({
  onClose,
  serviceName
}) => {
  // Estado para los filtros
  const [viewType, setViewType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });
  // Estado para la métrica seleccionada en el dropdown
  const [selectedMetric, setSelectedMetric] = useState<'gmv' | 'orders' | 'activeAdmins' | 'avgTicket'>('gmv');
  // Estado para controlar la apertura del dropdown
  const [isMetricDropdownOpen, setIsMetricDropdownOpen] = useState(false);
  // Datos simulados para las métricas
  const serviceData = {
    'Flex Bill': {
      gmv: 1300000,
      orders: 6225,
      activeAdmins: 12,
      avgTicket: 210,
      gmvChange: 8.3,
      ordersChange: 5.7,
      activeAdminsChange: 9.1,
      avgTicketChange: 3.4
    },
    'Tap Order & Pay': {
      gmv: 381000,
      orders: 2840,
      activeAdmins: 8,
      avgTicket: 134,
      gmvChange: 6.2,
      ordersChange: 7.5,
      activeAdminsChange: 14.3,
      avgTicketChange: 2.1
    },
    'Tap and Pay': {
      gmv: 635000,
      orders: 1496,
      activeAdmins: 15,
      avgTicket: 425,
      gmvChange: 9.1,
      ordersChange: 8.3,
      activeAdminsChange: 7.1,
      avgTicketChange: 4.5
    },
    'Pick&Go': {
      gmv: 254000,
      orders: 845,
      activeAdmins: 6,
      avgTicket: 300,
      gmvChange: 12.4,
      ordersChange: 10.8,
      activeAdminsChange: 20.0,
      avgTicketChange: 1.8
    },
    'Food Hall': {
      gmv: 127000,
      orders: 992,
      activeAdmins: 5,
      avgTicket: 128,
      gmvChange: 15.7,
      ordersChange: 13.2,
      activeAdminsChange: 25.0,
      avgTicketChange: 2.2
    }
  };
  // Configuración de las métricas para el dropdown
  const metricOptions = [{
    value: 'gmv',
    label: 'GMV total'
  }, {
    value: 'orders',
    label: 'Total de órdenes'
  }, {
    value: 'activeAdmins',
    label: 'Administradores activos'
  }, {
    value: 'avgTicket',
    label: 'Ticket promedio por orden'
  }];
  // Datos para la gráfica
  const [chartData, setChartData] = useState<any[]>([]);
  // Generar datos para la gráfica
  useEffect(() => {
    const generateChartData = () => {
      const data = [];
      const dayDiff = Math.ceil((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const currentService = serviceData[serviceName as keyof typeof serviceData] || {
        gmv: 0,
        orders: 0,
        activeAdmins: 0,
        avgTicket: 0
      };
      // Valores base para cada métrica
      const baseValues = {
        gmv: currentService.gmv / 30,
        orders: currentService.orders / 30,
        activeAdmins: currentService.activeAdmins,
        avgTicket: currentService.avgTicket
      };
      if (viewType === 'daily') {
        for (let i = 0; i <= Math.min(dayDiff, 14); i++) {
          const currentDate = new Date(dateRange.startDate);
          currentDate.setDate(dateRange.startDate.getDate() + i);
          const randomFactor = 0.8 + Math.random() * 0.4;
          const trendFactor = 1 + i / 30 * 0.1;
          // Generar datos para todas las métricas
          data.push({
            date: currentDate.toISOString().split('T')[0],
            gmv: Math.round(baseValues.gmv * randomFactor * trendFactor),
            orders: Math.round(baseValues.orders * randomFactor * trendFactor),
            activeAdmins: Math.max(1, Math.round(baseValues.activeAdmins * (0.9 + Math.random() * 0.2))),
            avgTicket: Math.round(baseValues.avgTicket * (0.95 + Math.random() * 0.1))
          });
        }
      } else if (viewType === 'weekly') {
        const weekCount = Math.ceil(dayDiff / 7);
        for (let i = 0; i < Math.min(weekCount, 8); i++) {
          const randomFactor = 0.85 + Math.random() * 0.3;
          const trendFactor = 1 + i / 8 * 0.15;
          data.push({
            date: `Semana ${i + 1}`,
            gmv: Math.round(baseValues.gmv * 7 * randomFactor * trendFactor),
            orders: Math.round(baseValues.orders * 7 * randomFactor * trendFactor),
            activeAdmins: Math.max(1, Math.round(baseValues.activeAdmins * (0.9 + Math.random() * 0.2))),
            avgTicket: Math.round(baseValues.avgTicket * (0.95 + Math.random() * 0.1))
          });
        }
      } else {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const startMonth = dateRange.startDate.getMonth();
        const endMonth = dateRange.endDate.getMonth();
        const yearDiff = dateRange.endDate.getFullYear() - dateRange.startDate.getFullYear();
        const monthDiff = endMonth - startMonth + yearDiff * 12;
        for (let i = 0; i <= Math.min(monthDiff, 6); i++) {
          const currentDate = new Date(dateRange.startDate);
          currentDate.setMonth(dateRange.startDate.getMonth() + i);
          const randomFactor = 0.9 + Math.random() * 0.2;
          const trendFactor = 1 + i / 6 * 0.2;
          data.push({
            date: `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`,
            gmv: Math.round(baseValues.gmv * 30 * randomFactor * trendFactor),
            orders: Math.round(baseValues.orders * 30 * randomFactor * trendFactor),
            activeAdmins: Math.max(2, Math.round(baseValues.activeAdmins * (0.9 + Math.random() * 0.3))),
            avgTicket: Math.round(baseValues.avgTicket * (0.95 + Math.random() * 0.15))
          });
        }
      }
      return data;
    };
    setChartData(generateChartData());
  }, [viewType, dateRange, serviceName]);
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
    setSelectedMetric('gmv');
  };
  // Obtener los datos del servicio actual
  const currentServiceData = serviceData[serviceName as keyof typeof serviceData] || {
    gmv: 0,
    orders: 0,
    activeAdmins: 0,
    avgTicket: 0,
    gmvChange: 0,
    ordersChange: 0,
    activeAdminsChange: 0,
    avgTicketChange: 0
  };
  // Obtener el título de la métrica seleccionada
  const getMetricLabel = () => {
    return metricOptions.find(option => option.value === selectedMetric)?.label || 'GMV total';
  };
  // Formatear valores según el tipo de métrica
  const formatMetricValue = (value: number) => {
    switch (selectedMetric) {
      case 'gmv':
      case 'avgTicket':
        return formatCurrency(value);
      case 'orders':
      case 'activeAdmins':
        return formatNumber(value);
      default:
        return value.toString();
    }
  };
  // Formatear valores del eje Y
  const formatYAxisTick = (value: number) => {
    if (selectedMetric === 'gmv') {
      return formatCurrency(value).split('.')[0];
    } else if (selectedMetric === 'avgTicket') {
      return `$${value}`;
    } else {
      return value.toString();
    }
  };
  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.metric-dropdown')) {
        setIsMetricDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl p-6 mx-4 relative overflow-y-auto max-h-[90vh]">
        {/* Botón de cierre */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <XIcon className="w-5 h-5" />
        </button>
        {/* Encabezado */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Dashboard: {serviceName}
          </h2>
        </div>
        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-6 items-center bg-gray-50 p-3 rounded-lg">
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
          <div className="flex bg-white rounded-md p-1 ml-auto shadow-sm">
            <button onClick={() => setViewType('daily')} className={`px-3 py-1 text-sm rounded-md ${viewType === 'daily' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600'}`}>
              Diario
            </button>
            <button onClick={() => setViewType('weekly')} className={`px-3 py-1 text-sm rounded-md ${viewType === 'weekly' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600'}`}>
              Semanal
            </button>
            <button onClick={() => setViewType('monthly')} className={`px-3 py-1 text-sm rounded-md ${viewType === 'monthly' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600'}`}>
              Mensual
            </button>
          </div>
        </div>
        {/* Indicadores clave (grid 2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* GMV total */}
          <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              GMV total
            </h3>
            <p className="text-2xl font-semibold">
              {formatCurrency(currentServiceData.gmv)}
            </p>
            <div className={`text-xs mt-1 ${currentServiceData.gmvChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatChange(currentServiceData.gmvChange)} vs. período anterior
            </div>
          </div>
          {/* Total de órdenes */}
          <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Total de órdenes
            </h3>
            <p className="text-2xl font-semibold">
              {formatNumber(currentServiceData.orders)}
            </p>
            <div className={`text-xs mt-1 ${currentServiceData.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatChange(currentServiceData.ordersChange)} vs. período
              anterior
            </div>
          </div>
          {/* Administradores activos */}
          <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Administradores activos
            </h3>
            <p className="text-2xl font-semibold">
              {currentServiceData.activeAdmins}
            </p>
            <div className={`text-xs mt-1 ${currentServiceData.activeAdminsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatChange(currentServiceData.activeAdminsChange)} vs. período
              anterior
            </div>
          </div>
          {/* Ticket promedio */}
          <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Ticket promedio por orden
            </h3>
            <p className="text-2xl font-semibold">
              ${currentServiceData.avgTicket}
            </p>
            <div className={`text-xs mt-1 ${currentServiceData.avgTicketChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatChange(currentServiceData.avgTicketChange)} vs. período
              anterior
            </div>
          </div>
        </div>
        {/* Gráfica de líneas */}
        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm mb-6">
          {/* Dropdown de selección de métrica */}
          <div className="flex items-center justify-between mb-4">
            <div className="relative metric-dropdown">
              <label className="text-sm font-medium text-gray-700 mr-2">
                Visualizar:
              </label>
              <button className="flex items-center text-sm bg-white border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50" onClick={() => setIsMetricDropdownOpen(!isMetricDropdownOpen)}>
                <span className="font-medium">{getMetricLabel()}</span>
                <ChevronDownIcon className="w-4 h-4 ml-1.5" />
              </button>
              {isMetricDropdownOpen && <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-md z-10 w-60">
                  {metricOptions.map(option => <button key={option.value} className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${selectedMetric === option.value ? 'bg-purple-50 text-purple-700 font-medium' : ''}`} onClick={() => {
                setSelectedMetric(option.value as any);
                setIsMetricDropdownOpen(false);
              }}>
                      {option.label}
                    </button>)}
                </div>}
            </div>
          </div>
          <div className="h-72">
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
                <YAxis tickFormatter={formatYAxisTick} tick={{
                fontSize: 12
              }} axisLine={false} tickLine={false} />
                <Tooltip formatter={value => [formatMetricValue(value as number), getMetricLabel()]} labelFormatter={label => `Fecha: ${label}`} />
                <Line type="monotone" dataKey={selectedMetric} stroke="#8884d8" strokeWidth={2} dot={{
                r: 4,
                fill: '#8884d8'
              }} activeDot={{
                r: 6
              }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
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
export default ServiceDashboardModal;
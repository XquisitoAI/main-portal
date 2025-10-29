import React, { useEffect, useState } from 'react';
import { XIcon, RefreshCwIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatNumber, formatChange } from '../../utils/formatters';
interface DetailedPaymentMethodsChartProps {
  onClose: () => void;
}
// Datos mock para la gráfica
const generateMockData = (viewType: 'daily' | 'weekly' | 'monthly', startDate: Date, endDate: Date) => {
  const data = [];
  const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  // Métodos de pago disponibles - Ahora solo débito y crédito
  const paymentMethods = ['Tarjeta Débito', 'Tarjeta Crédito'];
  // Generar datos según el tipo de vista
  if (viewType === 'daily') {
    // Datos diarios
    for (let i = 0; i <= Math.min(dayDiff, 14); i++) {
      // Limitamos a 14 días para mejor visualización
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const entry = {
        date: currentDate.toISOString().split('T')[0],
        total: 0
      };
      // Agregar valores para cada método de pago
      paymentMethods.forEach(method => {
        // Valores aleatorios con tendencia a que débito sea ligeramente mayor
        let value = 0;
        if (method === 'Tarjeta Débito') {
          value = Math.floor(Math.random() * 100) + 40; // 40-140
        } else {
          value = Math.floor(Math.random() * 90) + 30; // 30-120
        }
        entry[method] = value;
        entry.total += value;
      });
      data.push(entry);
    }
  } else if (viewType === 'weekly') {
    // Datos semanales
    const weekCount = Math.ceil(dayDiff / 7);
    for (let i = 0; i < Math.min(weekCount, 8); i++) {
      // Limitamos a 8 semanas
      const entry = {
        date: `Semana ${i + 1}`,
        total: 0
      };
      // Agregar valores para cada método de pago
      paymentMethods.forEach(method => {
        // Valores aleatorios con tendencia a que débito sea ligeramente mayor
        let value = 0;
        if (method === 'Tarjeta Débito') {
          value = Math.floor(Math.random() * 500) + 200; // 200-700
        } else {
          value = Math.floor(Math.random() * 450) + 150; // 150-600
        }
        entry[method] = value;
        entry.total += value;
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
      // Limitamos a 6 meses
      const currentDate = new Date(startDate);
      currentDate.setMonth(startDate.getMonth() + i);
      const entry = {
        date: `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`,
        total: 0
      };
      // Agregar valores para cada método de pago
      paymentMethods.forEach(method => {
        // Valores aleatorios con tendencia a que débito sea ligeramente mayor
        let value = 0;
        if (method === 'Tarjeta Débito') {
          value = Math.floor(Math.random() * 2000) + 800; // 800-2800
        } else {
          value = Math.floor(Math.random() * 1800) + 700; // 700-2500
        }
        entry[method] = value;
        entry.total += value;
      });
      data.push(entry);
    }
  }
  return {
    data,
    paymentMethods
  };
};
// Calcular el método de pago más usado
const calculateMostUsedMethod = (data: any[], paymentMethods: string[]) => {
  if (data.length === 0 || !paymentMethods.length) return null;
  // Sumar las transacciones por método de pago
  const methodTotals = paymentMethods.reduce((acc, method) => {
    acc[method] = data.reduce((sum, entry) => sum + (entry[method] || 0), 0);
    return acc;
  }, {} as Record<string, number>);
  // Encontrar el método con mayor número de transacciones
  let mostUsed = paymentMethods[0];
  paymentMethods.forEach(method => {
    if (methodTotals[method] > methodTotals[mostUsed]) {
      mostUsed = method;
    }
  });
  return {
    method: mostUsed,
    count: methodTotals[mostUsed]
  };
};
// Calcular el cambio porcentual en el uso del método más popular
const calculatePercentChange = (data: any[], paymentMethods: string[]) => {
  if (data.length < 2) return 0;
  // Obtener el método más usado
  const mostUsed = calculateMostUsedMethod(data, paymentMethods);
  if (!mostUsed) return 0;
  // Comparar el valor del método más usado entre el primer y último período
  const firstValue = data[0][mostUsed.method] || 0;
  const lastValue = data[data.length - 1][mostUsed.method] || 0;
  if (firstValue === 0) return 0;
  return (lastValue - firstValue) / firstValue * 100;
};
// Colores para los diferentes métodos de pago - Actualizado para solo dos métodos
const methodColors = {
  'Tarjeta Débito': '#0088fe',
  'Tarjeta Crédito': '#22c55e' // Verde
};
const DetailedPaymentMethodsChart: React.FC<DetailedPaymentMethodsChartProps> = ({
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
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [percentChange, setPercentChange] = useState<number>(0);
  const [mostUsedMethod, setMostUsedMethod] = useState<string>('');
  // Actualizar los datos cuando cambien los filtros
  useEffect(() => {
    const {
      data,
      paymentMethods
    } = generateMockData(viewType, dateRange.startDate, dateRange.endDate);
    setChartData(data);
    setPaymentMethods(paymentMethods);
    setPercentChange(calculatePercentChange(data, paymentMethods));
    const mostUsed = calculateMostUsedMethod(data, paymentMethods);
    if (mostUsed) {
      setMostUsedMethod(mostUsed.method);
    }
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
                {formatNumber(entry.value)} transacciones
              </span>
            </div>)}
          <div className="text-xs font-medium border-t border-gray-100 mt-1 pt-1">
            Total:{' '}
            {formatNumber(payload.reduce((sum: number, entry: any) => sum + entry.value, 0))}
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
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              Uso de Métodos de Pago por período
            </h3>
            <p className="text-sm text-gray-500">
              Método más usado:{' '}
              <span className="font-medium">{mostUsedMethod}</span>
            </p>
          </div>
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
            <BarChart data={chartData} margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 30
          }} stackOffset="sign">
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{
              fontSize: 12
            }} tickMargin={10} axisLine={{
              stroke: '#E5E7EB'
            }} tickLine={false} />
              <YAxis tickFormatter={value => formatNumber(value)} tick={{
              fontSize: 12
            }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{
              paddingTop: 15,
              fontSize: 12
            }} />
              {paymentMethods.map(method => <Bar key={method} dataKey={method} stackId="a" fill={methodColors[method as keyof typeof methodColors]} name={method} />)}
            </BarChart>
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
export default DetailedPaymentMethodsChart;
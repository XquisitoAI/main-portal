import React, { useState, useMemo } from "react";
import { XIcon, RefreshCwIcon } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatNumber, formatChange } from "../../utils/formatters";
import { usePaymentMethodsTimeline } from "../../hooks/useApiData";
import LoadingSpinner from "../ui/LoadingSpinner";
import type { SuperAdminFilters } from "../../types/api";

interface DetailedPaymentMethodsChartProps {
  onClose: () => void;
  initialFilters?: SuperAdminFilters;
}

interface PaymentMethodDataItem {
  date: string;
  [key: string]: number | string;
}

// Calcular el método de pago más usado
const calculateMostUsedMethod = (data: PaymentMethodDataItem[]) => {
  if (data.length === 0) return null;

  // Obtener todos los métodos de pago únicos
  const paymentMethods = new Set<string>();
  data.forEach((item: PaymentMethodDataItem) => {
    Object.keys(item).forEach((key) => {
      if (key !== "date") {
        paymentMethods.add(key);
      }
    });
  });

  if (paymentMethods.size === 0) return null;

  // Sumar las transacciones por método de pago
  const methodTotals: Record<string, number> = {};
  paymentMethods.forEach((method) => {
    methodTotals[method] = data.reduce(
      (sum, entry) => sum + (typeof entry[method] === 'number' ? entry[method] : 0),
      0
    );
  });

  // Encontrar el método con mayor número de transacciones
  let mostUsed = Array.from(paymentMethods)[0];
  paymentMethods.forEach((method) => {
    if (methodTotals[method] > methodTotals[mostUsed]) {
      mostUsed = method;
    }
  });

  return {
    method: mostUsed,
    count: methodTotals[mostUsed],
  };
};

// Calcular el cambio porcentual en el uso del método más popular
const calculatePercentChange = (data: PaymentMethodDataItem[]) => {
  if (data.length < 2) return 0;

  // Obtener el método más usado
  const mostUsed = calculateMostUsedMethod(data);
  if (!mostUsed) return 0;

  // Comparar el valor del método más usado entre el primer y último período
  const firstValue: number = typeof data[0][mostUsed.method] === 'number' ? data[0][mostUsed.method] as number : 0;
  const lastValue: number = typeof data[data.length - 1][mostUsed.method] === 'number' ? data[data.length - 1][mostUsed.method] as number : 0;

  if (firstValue === 0) return lastValue > 0 ? 100 : 0;

  return ((lastValue - firstValue) / firstValue) * 100;
};

// Colores para los diferentes métodos de pago
const methodColors: Record<string, string> = {
  "Tarjeta Débito": "#0088fe",
  "Tarjeta Crédito": "#22c55e",
  Desconocido: "#999999",
};

const DetailedPaymentMethodsChart: React.FC<
  DetailedPaymentMethodsChartProps
> = ({ onClose, initialFilters }) => {
  // Función helper para obtener las fechas por defecto
  const getDefaultDateRange = () => {
    if (initialFilters?.start_date && initialFilters?.end_date) {
      return {
        startDate: new Date(initialFilters.start_date),
        endDate: new Date(initialFilters.end_date)
      };
    }
    return {
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date()
    };
  };

  // Estado para los filtros
  const [viewType, setViewType] = useState<"daily" | "weekly" | "monthly">(
    "weekly"
  );
  const [dateRange, setDateRange] = useState(getDefaultDateRange());

  // Obtener datos del backend
  const {
    data: timelineData,
    isLoading,
    isError,
  } = usePaymentMethodsTimeline({
    view_type: viewType,
    start_date: dateRange.startDate.toISOString().split("T")[0],
    end_date: dateRange.endDate.toISOString().split("T")[0],
    restaurant_id: initialFilters?.restaurant_id,
    service: initialFilters?.service,
    gender: initialFilters?.gender,
    age_range: initialFilters?.age_range,
  });

  // Calcular métricas
  const percentChange = useMemo(() => {
    if (!timelineData || timelineData.length === 0) return 0;
    return calculatePercentChange(timelineData);
  }, [timelineData]);

  const mostUsedMethod = useMemo(() => {
    if (!timelineData || timelineData.length === 0) return null;
    return calculateMostUsedMethod(timelineData);
  }, [timelineData]);

  // Obtener métodos de pago únicos
  const paymentMethods = useMemo(() => {
    if (!timelineData || timelineData.length === 0) return [];
    const methods = new Set<string>();
    timelineData.forEach((item: PaymentMethodDataItem) => {
      Object.keys(item).forEach((key) => {
        if (key !== "date") {
          methods.add(key);
        }
      });
    });
    return Array.from(methods);
  }, [timelineData]);

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
    setViewType("weekly");
    setDateRange({
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date(),
    });
  };

  // Formatear etiqueta de fecha para mostrar en el eje X
  const formatDateLabel = (dateKey: string) => {
    if (viewType === "daily") {
      const [year, month, day] = dateKey.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
      });
    } else if (viewType === "weekly") {
      const [year, month, day] = dateKey.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return `Sem ${date.toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}`;
    } else if (viewType === "monthly") {
      const [year, month] = dateKey.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString("es-MX", {
        month: "short",
        year: "numeric",
      });
    }
    return dateKey;
  };

  // Personalizar tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
          <p className="text-sm font-medium mb-1">{`Fecha: ${formatDateLabel(label)}`}</p>
          {payload.map((entry: any, index: number) => (
            <div
              key={index}
              className="flex justify-between items-center text-xs mb-1"
            >
              <div className="flex items-center">
                <div
                  className="w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: entry.color }}
                />
                <span>{entry.name}: </span>
              </div>
              <span className="font-medium ml-2">
                {formatNumber(entry.value)} transacciones
              </span>
            </div>
          ))}
          <div className="text-xs font-medium border-t border-gray-100 mt-1 pt-1">
            Total:{" "}
            {formatNumber(
              payload.reduce((sum: number, entry: any) => sum + entry.value, 0)
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 mx-4 relative max-h-[90vh] overflow-y-auto">
        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <XIcon className="w-5 h-5" />
        </button>

        {/* Título y cambio porcentual */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              Uso de Métodos de Pago por período
            </h3>
            {mostUsedMethod && (
              <p className="text-sm text-gray-500">
                Método más usado:{" "}
                <span className="font-medium">{mostUsedMethod.method}</span> (
                {formatNumber(mostUsedMethod.count)} transacciones)
              </p>
            )}
          </div>
          <div
            className={`text-sm font-medium px-2 py-1 rounded ${
              percentChange >= 0
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {formatChange(percentChange)}
          </div>
        </div>

        {/* Controles de filtro */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          {/* Selector de rango de fechas */}
          <div className="flex gap-2 items-center">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Inicio</label>
              <input
                type="date"
                value={formatDateForInput(dateRange.startDate)}
                onChange={handleStartDateChange}
                className="text-sm p-1.5 border border-gray-200 rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Fin</label>
              <input
                type="date"
                value={formatDateForInput(dateRange.endDate)}
                onChange={handleEndDateChange}
                className="text-sm p-1.5 border border-gray-200 rounded"
              />
            </div>
          </div>

          {/* Toggle de visualización */}
          <div className="flex bg-gray-100 rounded-md p-1 ml-auto">
            <button
              onClick={() => setViewType("daily")}
              className={`px-3 py-1 text-sm rounded-md ${
                viewType === "daily"
                  ? "bg-white text-purple-700 shadow"
                  : "text-gray-600"
              }`}
            >
              Diario
            </button>
            <button
              onClick={() => setViewType("weekly")}
              className={`px-3 py-1 text-sm rounded-md ${
                viewType === "weekly"
                  ? "bg-white text-purple-700 shadow"
                  : "text-gray-600"
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setViewType("monthly")}
              className={`px-3 py-1 text-sm rounded-md ${
                viewType === "monthly"
                  ? "bg-white text-purple-700 shadow"
                  : "text-gray-600"
              }`}
            >
              Mensual
            </button>
          </div>
        </div>

        {/* Gráfica */}
        <div className="h-80">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner message="Cargando datos..." />
            </div>
          ) : isError || !timelineData || timelineData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No hay datos disponibles para el rango seleccionado</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={timelineData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 20,
                  bottom: 30,
                }}
                stackOffset="sign"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDateLabel}
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                  axisLine={{ stroke: "#E5E7EB" }}
                  tickLine={false}
                  angle={viewType === "daily" ? -45 : 0}
                  textAnchor={viewType === "daily" ? "end" : "middle"}
                  height={viewType === "daily" ? 60 : 30}
                />
                <YAxis
                  tickFormatter={(value) => formatNumber(value)}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    paddingTop: 15,
                    fontSize: 12,
                  }}
                />
                {paymentMethods.map((method) => (
                  <Bar
                    key={method}
                    dataKey={method}
                    stackId="a"
                    fill={methodColors[method] || "#8884d8"}
                    name={method}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Botón de limpiar filtros */}
        <div className="flex justify-end mt-4">
          <button
            onClick={resetFilters}
            className="flex items-center text-sm text-gray-600 hover:text-purple-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded transition-colors"
          >
            <RefreshCwIcon className="w-4 h-4 mr-1.5" />
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailedPaymentMethodsChart;

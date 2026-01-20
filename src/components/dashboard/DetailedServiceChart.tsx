import React, { useEffect, useState } from "react";
import { XIcon, RefreshCwIcon, SearchIcon } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  formatCurrency,
  formatNumber,
  formatChange,
} from "../../utils/formatters";
import { useAuthenticatedApi } from "../../hooks/useAuthenticatedApi";
import LoadingSpinner from "../ui/LoadingSpinner";

interface DetailedServiceChartProps {
  onClose: () => void;
  title: string;
  chartType: "volume" | "orders" | "transactions";
  serviceData: {
    name: string;
    value: number;
    color: string;
  }[];
  filters?: {
    restaurant_id?: number | number[];
    service?: string;
    start_date?: string;
    end_date?: string;
  };
}

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
  return ((lastTotal - firstTotal) / firstTotal) * 100;
};

const DetailedServiceChart: React.FC<DetailedServiceChartProps> = ({
  onClose,
  title,
  chartType,
  serviceData,
  filters = {},
}) => {
  const authenticatedApi = useAuthenticatedApi();

  // Determinar fechas iniciales basadas en los filtros o usar valores por defecto
  const getInitialDateRange = () => {
    if (filters.start_date && filters.end_date) {
      return {
        startDate: new Date(filters.start_date),
        endDate: new Date(filters.end_date),
      };
    }
    return {
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date(),
    };
  };

  // Estado para los filtros
  const [viewType, setViewType] = useState<"daily" | "weekly" | "monthly">(
    "weekly"
  );
  const [dateRange, setDateRange] = useState(getInitialDateRange());
  // Estado para los datos de la gráfica
  const [chartData, setChartData] = useState<any[]>([]);
  const [percentChange, setPercentChange] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Extraer nombres de servicios
  const serviceNames = serviceData.map((service) => service.name);

  // Función para obtener datos reales del backend
  const fetchTimelineData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const endpoint =
        chartType === "volume"
          ? "/api/super-admin/timeline/volume"
          : chartType === "orders"
            ? "/api/super-admin/timeline/orders"
            : "/api/super-admin/timeline/transactions";

      const params = new URLSearchParams();
      params.append("view_type", viewType);
      params.append("start_date", dateRange.startDate.toISOString());
      params.append("end_date", dateRange.endDate.toISOString());

      if (filters.restaurant_id !== undefined) {
        if (Array.isArray(filters.restaurant_id)) {
          params.append("restaurant_id", filters.restaurant_id.join(","));
        } else {
          params.append("restaurant_id", filters.restaurant_id.toString());
        }
      }

      if (filters.service && filters.service !== "todos") {
        params.append("service", filters.service);
      }

      const response = await authenticatedApi.get(
        `${endpoint}?${params.toString()}`
      );
      const data = response.data.data;

      setChartData(data);
      setPercentChange(calculateTotalChange(data, serviceNames));
    } catch (err: any) {
      console.error("Error fetching timeline data:", err);
      setError(err.message || "Error al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar los datos cuando cambien los filtros
  useEffect(() => {
    fetchTimelineData();
  }, [viewType, dateRange, chartType, filters]);
  // Formatear valores según el tipo de métrica
  const formatValue = (value: number) => {
    switch (chartType) {
      case "volume":
        return formatCurrency(value);
      case "orders":
      case "transactions":
        return formatNumber(value);
      default:
        return value.toString();
    }
  };

  // Formatear fechas para los inputs
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // Manejar cambios en el rango de fechas
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({
      ...dateRange,
      startDate: new Date(e.target.value),
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({
      ...dateRange,
      endDate: new Date(e.target.value),
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
      // El formato es "YYYY-MM"
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
        <div className="bg-white p-1.5 sm:p-2 border border-gray-200 shadow-sm rounded-md">
          <p className="text-xs sm:text-sm font-medium mb-1">{`Fecha: ${formatDateLabel(label)}`}</p>
          {payload.map((entry: any, index: number) => (
            <div
              key={index}
              className="flex justify-between items-center text-[10px] sm:text-xs mb-1"
            >
              <div className="flex items-center">
                <div
                  className="w-2 h-2 rounded-full mr-1"
                  style={{
                    backgroundColor: entry.color,
                  }}
                />
                <span>{entry.name}: </span>
              </div>
              <span className="font-medium ml-2">
                {formatValue(entry.value)}
              </span>
            </div>
          ))}
          <div className="text-[10px] sm:text-xs font-medium border-t border-gray-100 mt-1 pt-1">
            Total:{" "}
            {formatValue(
              payload.reduce((sum: number, entry: any) => sum + entry.value, 0)
            )}
          </div>
        </div>
      );
    }
    return null;
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-3 sm:p-6 relative max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700"
        >
          <XIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        {/* Título y cambio porcentual */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 sm:mb-6 pr-6">
          <h3 className="text-base sm:text-xl font-semibold text-gray-800">{title}</h3>
          <div
            className={`text-xs sm:text-sm font-medium px-2 py-1 rounded w-fit ${percentChange >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
          >
            {formatChange(percentChange)}
          </div>
        </div>
        {/* Mensaje de error si hay */}
        {error && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs sm:text-sm text-yellow-800">
              {error} - Mostrando datos estimados
            </p>
          </div>
        )}
        {/* Controles de filtro */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6 items-start sm:items-center">
          {/* Selector de rango de fechas */}
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <div className="flex-1 sm:flex-none">
              <label className="text-[10px] sm:text-xs text-gray-500 block mb-1">Inicio</label>
              <input
                type="date"
                value={formatDateForInput(dateRange.startDate)}
                onChange={handleStartDateChange}
                className="text-xs sm:text-sm p-1 sm:p-1.5 border border-gray-200 rounded w-full"
              />
            </div>
            <div className="flex-1 sm:flex-none">
              <label className="text-[10px] sm:text-xs text-gray-500 block mb-1">Fin</label>
              <input
                type="date"
                value={formatDateForInput(dateRange.endDate)}
                onChange={handleEndDateChange}
                className="text-xs sm:text-sm p-1 sm:p-1.5 border border-gray-200 rounded w-full"
              />
            </div>
          </div>
          {/* Toggle de visualización */}
          <div className="flex bg-gray-100 rounded-md p-0.5 sm:p-1 sm:ml-auto w-full sm:w-auto justify-center">
            <button
              onClick={() => setViewType("daily")}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md flex-1 sm:flex-none ${viewType === "daily" ? "bg-white text-purple-700 shadow" : "text-gray-600"}`}
            >
              Diario
            </button>
            <button
              onClick={() => setViewType("weekly")}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md flex-1 sm:flex-none ${viewType === "weekly" ? "bg-white text-purple-700 shadow" : "text-gray-600"}`}
            >
              Semanal
            </button>
            <button
              onClick={() => setViewType("monthly")}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md flex-1 sm:flex-none ${viewType === "monthly" ? "bg-white text-purple-700 shadow" : "text-gray-600"}`}
            >
              Mensual
            </button>
          </div>
        </div>
        {/* Gráfica */}
        <div className="h-56 sm:h-80 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
              <LoadingSpinner message="Cargando datos..." />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 0,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDateLabel}
                  tick={{
                    fontSize: 10,
                  }}
                  tickMargin={8}
                  axisLine={{
                    stroke: "#E5E7EB",
                  }}
                  tickLine={false}
                  angle={viewType === "daily" ? -45 : 0}
                  textAnchor={viewType === "daily" ? "end" : "middle"}
                  height={viewType === "daily" ? 50 : 25}
                />
                <YAxis
                  tickFormatter={(value) => {
                    const formatted = formatValue(value);
                    return chartType === "volume"
                      ? formatted.split(".")[0]
                      : formatted;
                  }}
                  tick={{
                    fontSize: 10,
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    paddingTop: 10,
                    fontSize: 10,
                  }}
                />
                {serviceData.map((service) => (
                  <Line
                    key={service.name}
                    type="monotone"
                    dataKey={service.name}
                    stroke={service.color}
                    strokeWidth={2}
                    dot={{
                      r: 2,
                      fill: service.color,
                    }}
                    activeDot={{
                      r: 4,
                    }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        {/* Botón de limpiar filtros */}
        <div className="flex justify-end mt-3 sm:mt-4">
          <button
            onClick={resetFilters}
            className="flex items-center text-xs sm:text-sm text-gray-600 hover:text-purple-600 bg-gray-100 hover:bg-gray-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded transition-colors"
          >
            <RefreshCwIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );
};
export default DetailedServiceChart;

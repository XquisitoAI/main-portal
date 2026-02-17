import React, { useState, useMemo } from "react";
import { XIcon, RefreshCwIcon } from "lucide-react";
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
import { formatCurrency, formatChange } from "../../utils/formatters";
import { useVolumeTimeline } from "../../hooks/useApiData";
import LoadingSpinner from "../ui/LoadingSpinner";
import type { SuperAdminFilters } from "../../types/api";

interface DetailedVolumeChartProps {
  onClose: () => void;
  initialFilters?: SuperAdminFilters;
}

interface TimelineDataItem {
  date: string;
  "Flex Bill"?: number;
  "Tap Order & Pay"?: number;
  "Pick & Go"?: number;
  "Room Service"?: number;
  "Tap & Pay"?: number;
}

// Calcular el cambio porcentual entre primer y último valor
const calculatePercentChange = (data: any[]) => {
  if (data.length < 2) return 0;

  // Sumar Flex Bill, Tap Order & Pay, Pick & Go, Room Service & Tap & Pay para cada período
  const firstTotal =
    (data[0]["Flex Bill"] || 0) +
    (data[0]["Tap Order & Pay"] || 0) +
    (data[0]["Pick & Go"] || 0) +
    (data[0]["Room Service"] || 0) +
    (data[0]["Tap & Pay"] || 0);
  const lastTotal =
    (data[data.length - 1]["Flex Bill"] || 0) +
    (data[data.length - 1]["Tap Order & Pay"] || 0) +
    (data[data.length - 1]["Pick & Go"] || 0) +
    (data[data.length - 1]["Room Service"] || 0) +
    (data[data.length - 1]["Tap & Pay"] || 0);

  if (firstTotal === 0) return lastTotal > 0 ? 100 : 0;

  return ((lastTotal - firstTotal) / firstTotal) * 100;
};

const DetailedVolumeChart: React.FC<DetailedVolumeChartProps> = ({
  onClose,
  initialFilters,
}) => {
  // Función helper para obtener las fechas por defecto
  const getDefaultDateRange = () => {
    if (initialFilters?.start_date && initialFilters?.end_date) {
      return {
        startDate: new Date(initialFilters.start_date),
        endDate: new Date(initialFilters.end_date),
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
  const [dateRange, setDateRange] = useState(getDefaultDateRange());

  // Obtener datos del backend
  const {
    data: timelineData,
    isLoading,
    isError,
  } = useVolumeTimeline({
    view_type: viewType,
    start_date: dateRange.startDate.toISOString().split("T")[0],
    end_date: dateRange.endDate.toISOString().split("T")[0],
  });

  // Calcular el cambio porcentual
  const percentChange = useMemo(() => {
    if (!timelineData || timelineData.length === 0) return 0;
    return calculatePercentChange(timelineData);
  }, [timelineData]);

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

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce(
        (sum: number, entry: any) => sum + entry.value,
        0
      );
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
                  style={{ backgroundColor: entry.color }}
                />
                <span>{entry.name}: </span>
              </div>
              <span className="font-medium ml-2">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
          <div className="border-t border-gray-200 mt-1 pt-1 flex justify-between text-[10px] sm:text-xs font-semibold">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
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
          <h3 className="text-base sm:text-xl font-semibold text-gray-800">
            Volumen Transaccionado por período
          </h3>
          <div
            className={`text-xs sm:text-sm font-medium px-2 py-1 rounded w-fit ${
              percentChange >= 0
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {formatChange(percentChange)}
          </div>
        </div>

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
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md flex-1 sm:flex-none ${
                viewType === "daily"
                  ? "bg-white text-purple-700 shadow"
                  : "text-gray-600"
              }`}
            >
              Diario
            </button>
            <button
              onClick={() => setViewType("weekly")}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md flex-1 sm:flex-none ${
                viewType === "weekly"
                  ? "bg-white text-purple-700 shadow"
                  : "text-gray-600"
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setViewType("monthly")}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md flex-1 sm:flex-none ${
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
        <div className="h-56 sm:h-80">
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
              <LineChart
                data={timelineData}
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
                  tick={{ fontSize: 10 }}
                  tickMargin={8}
                  axisLine={{ stroke: "#E5E7EB" }}
                  tickLine={false}
                  angle={viewType === "daily" ? -45 : 0}
                  textAnchor={viewType === "daily" ? "end" : "middle"}
                  height={viewType === "daily" ? 50 : 25}
                />
                <YAxis
                  tickFormatter={(value) => formatCurrency(value).split(".")[0]}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "10px" }} iconType="line" />
                <Line
                  type="monotone"
                  dataKey="Flex Bill"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Tap Order & Pay"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Pick & Go"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="Room Service"
                  stroke="#d92926"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="Tap & Pay"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
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

export default DetailedVolumeChart;

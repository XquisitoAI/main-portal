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
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatChange,
} from "../../utils/formatters";
import {
  useVolumeTimeline,
  useOrdersTimeline,
  useTransactionsTimeline,
} from "../../hooks/useApiData";
import LoadingSpinner from "../ui/LoadingSpinner";
import type { SuperAdminFilters } from "../../types/api";

interface DetailedMetricChartProps {
  onClose: () => void;
  title: string;
  metricType: "currency" | "number" | "percent";
  metricLabel: string;
  color?: string;
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
const calculatePercentChange = (
  data: any[],
  metricType: "currency" | "number" | "percent"
) => {
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

const DetailedMetricChart: React.FC<DetailedMetricChartProps> = ({
  onClose,
  title,
  metricType,
  metricLabel,
  color = "#8884d8",
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

  // Determinar qué hook usar basado en el título
  const getTimelineHook = () => {
    if (title === "Ingresos Xquisito") {
      // Ingresos Xquisito usa los mismos datos que Volumen, pero se calculará con el fee
      return useVolumeTimeline;
    } else if (title === "Órdenes Exitosas") {
      return useOrdersTimeline;
    } else if (title === "Total de Transacciones") {
      return useTransactionsTimeline;
    }
    // Por defecto, usar volume timeline
    return useVolumeTimeline;
  };

  const timelineHook = getTimelineHook();

  // Obtener datos del backend
  const {
    data: rawTimelineData,
    isLoading,
    isError,
  } = timelineHook({
    view_type: viewType,
    start_date: dateRange.startDate.toISOString().split("T")[0],
    end_date: dateRange.endDate.toISOString().split("T")[0],
  });

  // Procesar datos según el tipo de métrica
  const timelineData = useMemo(() => {
    if (!rawTimelineData) return [];

    // Para Ingresos Xquisito, aplicar el fee del 3%
    if (title === "Ingresos Xquisito") {
      const processedData = rawTimelineData.map((item: TimelineDataItem) => ({
        date: item.date,
        "Flex Bill": (item["Flex Bill"] || 0) * 0.03,
        "Tap Order & Pay": (item["Tap Order & Pay"] || 0) * 0.03,
        "Pick & Go": (item["Pick & Go"] || 0) * 0.03,
        "Room Service": (item["Room Service"] || 0) * 0.03,
        "Tap & Pay": (item["Tap & Pay"] || 0) * 0.03,
      }));

      console.log("=== FRONTEND: DetailedMetricChart (Ingresos Xquisito) ===");
      console.log("Raw data total before 3% fee:");
      const rawTotal = rawTimelineData.reduce(
        (sum: number, item: TimelineDataItem) =>
          sum +
          (item["Flex Bill"] || 0) +
          (item["Tap Order & Pay"] || 0) +
          (item["Pick & Go"] || 0) +
          (item["Room Service"] || 0) +
          (item["Tap & Pay"] || 0),
        0
      );
      console.log("  Total:", rawTotal);

      const processedTotal = processedData.reduce(
        (sum: number, item: TimelineDataItem) =>
          sum +
          (item["Flex Bill"] || 0) +
          (item["Tap Order & Pay"] || 0) +
          (item["Pick & Go"] || 0) +
          (item["Room Service"] || 0) +
          (item["Tap & Pay"] || 0),
        0
      );
      console.log("Total after 3% fee:", processedTotal);

      return processedData;
    }

    // Log para otras métricas
    if (rawTimelineData.length > 0) {
      console.log(`=== FRONTEND: DetailedMetricChart (${title}) ===`);
      console.log("View type:", viewType);
      console.log("Total data points:", rawTimelineData.length);
      const total = rawTimelineData.reduce(
        (sum: number, item: TimelineDataItem) =>
          sum +
          (item["Flex Bill"] || 0) +
          (item["Tap Order & Pay"] || 0) +
          (item["Pick & Go"] || 0) +
          (item["Room Service"] || 0) +
          (item["Tap & Pay"] || 0),
        0
      );
      console.log("Grand Total:", total);
    }

    return rawTimelineData;
  }, [rawTimelineData, title, viewType]);

  // Calcular el cambio porcentual
  const percentChange = useMemo(() => {
    if (!timelineData || timelineData.length === 0) return 0;
    return calculatePercentChange(timelineData, metricType);
  }, [timelineData, metricType]);

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

  // Formatear valor según el tipo de métrica
  const formatValue = (value: number) => {
    switch (metricType) {
      case "currency":
        return formatCurrency(value);
      case "percent":
        return formatPercent(value);
      case "number":
      default:
        return formatNumber(value);
    }
  };

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce(
        (sum: number, entry: any) => sum + entry.value,
        0
      );
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
                {formatValue(entry.value)}
              </span>
            </div>
          ))}
          <div className="border-t border-gray-200 mt-1 pt-1 flex justify-between text-xs font-semibold">
            <span>Total:</span>
            <span>{formatValue(total)}</span>
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
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
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
              <LineChart
                data={timelineData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 20,
                  bottom: 30,
                }}
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
                  tickFormatter={(value) => {
                    const formatted = formatValue(value);
                    return metricType === "currency"
                      ? formatted.split(".")[0]
                      : formatted;
                  }}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px" }} iconType="line" />
                <Line
                  type="monotone"
                  dataKey="Flex Bill"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="Tap Order & Pay"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
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

export default DetailedMetricChart;

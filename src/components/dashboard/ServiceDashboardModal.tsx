import React, { useEffect, useState, useMemo } from "react";
import { XIcon, RefreshCwIcon, ChevronDownIcon } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  formatCurrency,
  formatNumber,
  formatChange,
} from "../../utils/formatters";
import {
  useVolumeTimeline,
  useOrdersTimeline,
  useTransactionsTimeline,
} from "../../hooks/useApiData";
import LoadingSpinner from "../ui/LoadingSpinner";
import type { SuperAdminFilters } from "../../types/api";

interface ServiceDashboardModalProps {
  onClose: () => void;
  serviceName: string;
  initialFilters?: SuperAdminFilters;
}
const ServiceDashboardModal: React.FC<ServiceDashboardModalProps> = ({
  onClose,
  serviceName,
  initialFilters,
}) => {
  // Estado para los filtros
  const [viewType, setViewType] = useState<"daily" | "weekly" | "monthly">(
    "weekly"
  );

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

  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [selectedMetric, setSelectedMetric] = useState<
    "gmv" | "orders" | "transactions" | "avgTicket"
  >("gmv");
  const [isMetricDropdownOpen, setIsMetricDropdownOpen] = useState(false);

  // Convertir nombre del servicio a formato de filtro
  const serviceFilter =
    serviceName === "Flex Bill"
      ? "flex-bill"
      : serviceName === "Tap Order & Pay"
        ? "tap-order-pay"
        : serviceName === "Pick & Go"
          ? "pick-and-go"
          : serviceName === "Room Service"
            ? "room-service"
            : "todos";

  // Obtener datos del backend
  const { data: volumeData, isLoading: volumeLoading } = useVolumeTimeline({
    view_type: viewType,
    start_date: dateRange.startDate.toISOString().split("T")[0],
    end_date: dateRange.endDate.toISOString().split("T")[0],
    service: serviceFilter,
    restaurant_id: initialFilters?.restaurant_id,
    gender: initialFilters?.gender,
    age_range: initialFilters?.age_range,
  });

  const { data: ordersData, isLoading: ordersLoading } = useOrdersTimeline({
    view_type: viewType,
    start_date: dateRange.startDate.toISOString().split("T")[0],
    end_date: dateRange.endDate.toISOString().split("T")[0],
    service: serviceFilter,
    restaurant_id: initialFilters?.restaurant_id,
    gender: initialFilters?.gender,
    age_range: initialFilters?.age_range,
  });

  const { data: transactionsData, isLoading: transactionsLoading } =
    useTransactionsTimeline({
      view_type: viewType,
      start_date: dateRange.startDate.toISOString().split("T")[0],
      end_date: dateRange.endDate.toISOString().split("T")[0],
      service: serviceFilter,
      restaurant_id: initialFilters?.restaurant_id,
      gender: initialFilters?.gender,
      age_range: initialFilters?.age_range,
    });

  const isLoading = volumeLoading || ordersLoading || transactionsLoading;

  // Tipos para los datos de timeline
  interface TimelineDataItem {
    date: string;
    "Flex Bill"?: number;
    "Tap Order & Pay"?: number;
    "Pick & Go"?: number;
    "Room Service"?: number;
  }

  // Calcular métricas actuales del servicio desde los datos reales
  const serviceMetrics = useMemo(() => {
    if (!volumeData || !ordersData || !transactionsData) {
      return {
        gmv: 0,
        orders: 0,
        transactions: 0,
        avgTicket: 0,
        gmvChange: 0,
        ordersChange: 0,
        transactionsChange: 0,
        avgTicketChange: 0,
      };
    }

    // Calcular totales actuales
    const totalGmv = volumeData.reduce(
      (sum: number, item: TimelineDataItem) => {
        const flexBill = item["Flex Bill"] || 0;
        const tapOrder = item["Tap Order & Pay"] || 0;
        const pickAndGo = item["Pick & Go"] || 0;
        const roomService = item["Room Service"] || 0;
        return sum + flexBill + tapOrder + pickAndGo + roomService;
      },
      0
    );

    const totalOrders = ordersData.reduce(
      (sum: number, item: TimelineDataItem) => {
        const flexBill = item["Flex Bill"] || 0;
        const tapOrder = item["Tap Order & Pay"] || 0;
        const pickAndGo = item["Pick & Go"] || 0;
        const roomService = item["Room Service"] || 0;
        return sum + flexBill + tapOrder + pickAndGo + roomService;
      },
      0
    );

    const totalTransactions = transactionsData.reduce(
      (sum: number, item: TimelineDataItem) => {
        const flexBill = item["Flex Bill"] || 0;
        const tapOrder = item["Tap Order & Pay"] || 0;
        const pickAndGo = item["Pick & Go"] || 0;
        const roomService = item["Room Service"] || 0;
        return sum + flexBill + tapOrder + pickAndGo + roomService;
      },
      0
    );

    const avgTicket = totalOrders > 0 ? totalGmv / totalOrders : 0;

    // Calcular cambios porcentuales (comparar primer y último valor)
    const firstGmv =
      volumeData.length > 0
        ? (volumeData[0]["Flex Bill"] || 0) +
          (volumeData[0]["Tap Order & Pay"] || 0) +
          (volumeData[0]["Pick & Go"] || 0) +
          (volumeData[0]["Room Service"] || 0)
        : 0;
    const lastGmv =
      volumeData.length > 0
        ? (volumeData[volumeData.length - 1]["Flex Bill"] || 0) +
          (volumeData[volumeData.length - 1]["Tap Order & Pay"] || 0) +
          (volumeData[volumeData.length - 1]["Pick & Go"] || 0) +
          (volumeData[volumeData.length - 1]["Room Service"] || 0)
        : 0;
    const gmvChange =
      firstGmv > 0 ? ((lastGmv - firstGmv) / firstGmv) * 100 : 0;

    const firstOrders =
      ordersData.length > 0
        ? (ordersData[0]["Flex Bill"] || 0) +
          (ordersData[0]["Tap Order & Pay"] || 0) +
          (ordersData[0]["Pick & Go"] || 0) +
          (ordersData[0]["Room Service"] || 0)
        : 0;
    const lastOrders =
      ordersData.length > 0
        ? (ordersData[ordersData.length - 1]["Flex Bill"] || 0) +
          (ordersData[ordersData.length - 1]["Tap Order & Pay"] || 0) +
          (ordersData[ordersData.length - 1]["Pick & Go"] || 0) +
          (ordersData[ordersData.length - 1]["Room Service"] || 0)
        : 0;
    const ordersChange =
      firstOrders > 0 ? ((lastOrders - firstOrders) / firstOrders) * 100 : 0;

    const firstTransactions =
      transactionsData.length > 0
        ? (transactionsData[0]["Flex Bill"] || 0) +
          (transactionsData[0]["Tap Order & Pay"] || 0) +
          (transactionsData[0]["Pick & Go"] || 0) +
          (transactionsData[0]["Room Service"] || 0)
        : 0;
    const lastTransactions =
      transactionsData.length > 0
        ? (transactionsData[transactionsData.length - 1]["Flex Bill"] || 0) +
          (transactionsData[transactionsData.length - 1]["Tap Order & Pay"] ||
            0) +
          (transactionsData[transactionsData.length - 1]["Pick & Go"] || 0) +
          (transactionsData[transactionsData.length - 1]["Room Service"] || 0)
        : 0;
    const transactionsChange =
      firstTransactions > 0
        ? ((lastTransactions - firstTransactions) / firstTransactions) * 100
        : 0;

    const firstAvgTicket = firstOrders > 0 ? firstGmv / firstOrders : 0;
    const lastAvgTicket = lastOrders > 0 ? lastGmv / lastOrders : 0;
    const avgTicketChange =
      firstAvgTicket > 0
        ? ((lastAvgTicket - firstAvgTicket) / firstAvgTicket) * 100
        : 0;

    return {
      gmv: totalGmv,
      orders: totalOrders,
      transactions: totalTransactions,
      avgTicket,
      gmvChange,
      ordersChange,
      transactionsChange,
      avgTicketChange,
    };
  }, [volumeData, ordersData, transactionsData]);
  // Configuración de las métricas para el dropdown
  const metricOptions = [
    {
      value: "gmv",
      label: "GMV total",
    },
    {
      value: "orders",
      label: "Total de órdenes",
    },
    {
      value: "transactions",
      label: "Total de transacciones",
    },
    {
      value: "avgTicket",
      label: "Ticket promedio por orden",
    },
  ];

  // Procesar datos para la gráfica con datos reales
  const chartData = useMemo(() => {
    if (!volumeData || !ordersData || !transactionsData) return [];

    // Combinar todos los datos por fecha
    return volumeData.map((volumeItem: TimelineDataItem, index: number) => {
      const ordersItem = ordersData[index] || {
        "Flex Bill": 0,
        "Tap Order & Pay": 0,
        "Pick & Go": 0,
        "Room Service": 0,
      };
      const transactionsItem = transactionsData[index] || {
        "Flex Bill": 0,
        "Tap Order & Pay": 0,
        "Pick & Go": 0,
        "Room Service": 0,
      };

      const totalGmv =
        (volumeItem["Flex Bill"] || 0) +
        (volumeItem["Tap Order & Pay"] || 0) +
        +(volumeItem["Pick & Go"] || 0) +
        +(volumeItem["Room Service"] || 0);
      const totalOrders =
        (ordersItem["Flex Bill"] || 0) +
        (ordersItem["Tap Order & Pay"] || 0) +
        (ordersItem["Pick & Go"] || 0) +
        (ordersItem["Room Service"] || 0);
      const totalTransactions =
        (transactionsItem["Flex Bill"] || 0) +
        (transactionsItem["Tap Order & Pay"] || 0) +
        (transactionsItem["Pick & Go"] || 0) +
        (transactionsItem["Room Service"] || 0);
      const avgTicket = totalOrders > 0 ? totalGmv / totalOrders : 0;

      return {
        date: volumeItem.date,
        gmv: totalGmv,
        orders: totalOrders,
        transactions: totalTransactions,
        avgTicket: Math.round(avgTicket),
      };
    });
  }, [volumeData, ordersData, transactionsData]);

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
    setSelectedMetric("gmv");
  };

  // Obtener el título de la métrica seleccionada
  const getMetricLabel = () => {
    return (
      metricOptions.find((option) => option.value === selectedMetric)?.label ||
      "GMV total"
    );
  };
  // Formatear valores según el tipo de métrica
  const formatMetricValue = (value: number) => {
    switch (selectedMetric) {
      case "gmv":
      case "avgTicket":
        return formatCurrency(value);
      case "orders":
      case "transactions":
        return formatNumber(value);
      default:
        return value.toString();
    }
  };

  // Formatear valores del eje Y
  const formatYAxisTick = (value: number) => {
    if (selectedMetric === "gmv") {
      return formatCurrency(value).split(".")[0];
    } else if (selectedMetric === "avgTicket") {
      return `$${value}`;
    } else {
      return value.toString();
    }
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

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".metric-dropdown")) {
        setIsMetricDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl p-6 mx-4 relative overflow-y-auto max-h-[90vh]">
        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
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
          <div className="flex bg-white rounded-md p-1 ml-auto shadow-sm">
            <button
              onClick={() => setViewType("daily")}
              className={`px-3 py-1 text-sm rounded-md ${viewType === "daily" ? "bg-purple-100 text-purple-700 font-medium" : "text-gray-600"}`}
            >
              Diario
            </button>
            <button
              onClick={() => setViewType("weekly")}
              className={`px-3 py-1 text-sm rounded-md ${viewType === "weekly" ? "bg-purple-100 text-purple-700 font-medium" : "text-gray-600"}`}
            >
              Semanal
            </button>
            <button
              onClick={() => setViewType("monthly")}
              className={`px-3 py-1 text-sm rounded-md ${viewType === "monthly" ? "bg-purple-100 text-purple-700 font-medium" : "text-gray-600"}`}
            >
              Mensual
            </button>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner message="Cargando datos..." />
          </div>
        ) : (
          <>
            {/* Indicadores clave (grid 2x2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* GMV total */}
              <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  GMV total
                </h3>
                <p className="text-2xl font-semibold">
                  {formatCurrency(serviceMetrics.gmv)}
                </p>
                <div
                  className={`text-xs mt-1 ${serviceMetrics.gmvChange >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatChange(serviceMetrics.gmvChange)} vs. período anterior
                </div>
              </div>
              {/* Total de órdenes */}
              <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Total de órdenes
                </h3>
                <p className="text-2xl font-semibold">
                  {formatNumber(serviceMetrics.orders)}
                </p>
                <div
                  className={`text-xs mt-1 ${serviceMetrics.ordersChange >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatChange(serviceMetrics.ordersChange)} vs. período
                  anterior
                </div>
              </div>
              {/* Total de transacciones */}
              <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Total de transacciones
                </h3>
                <p className="text-2xl font-semibold">
                  {formatNumber(serviceMetrics.transactions)}
                </p>
                <div
                  className={`text-xs mt-1 ${serviceMetrics.transactionsChange >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatChange(serviceMetrics.transactionsChange)} vs. período
                  anterior
                </div>
              </div>
              {/* Ticket promedio */}
              <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Ticket promedio por orden
                </h3>
                <p className="text-2xl font-semibold">
                  {formatCurrency(serviceMetrics.avgTicket)}
                </p>
                <div
                  className={`text-xs mt-1 ${serviceMetrics.avgTicketChange >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatChange(serviceMetrics.avgTicketChange)} vs. período
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
                  <button
                    className="flex items-center text-sm bg-white border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                    onClick={() =>
                      setIsMetricDropdownOpen(!isMetricDropdownOpen)
                    }
                  >
                    <span className="font-medium">{getMetricLabel()}</span>
                    <ChevronDownIcon className="w-4 h-4 ml-1.5" />
                  </button>
                  {isMetricDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-md z-10 w-60">
                      {metricOptions.map((option) => (
                        <button
                          key={option.value}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${selectedMetric === option.value ? "bg-purple-50 text-purple-700 font-medium" : ""}`}
                          onClick={() => {
                            setSelectedMetric(option.value as any);
                            setIsMetricDropdownOpen(false);
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
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
                    />
                    <YAxis
                      tickFormatter={formatYAxisTick}
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [
                        formatMetricValue(value as number),
                        getMetricLabel(),
                      ]}
                      labelFormatter={(label) =>
                        `Fecha: ${formatDateLabel(label)}`
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#8884d8" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
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
          </>
        )}
      </div>
    </div>
  );
};
export default ServiceDashboardModal;

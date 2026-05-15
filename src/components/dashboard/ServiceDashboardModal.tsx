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

const SERVICES = [
  "Flex Bill",
  "Tap Order & Pay",
  "Pick & Go",
  "Room Service",
  "Tap & Pay",
];

const sumRow = (row: any) => SERVICES.reduce((s, k) => s + (row?.[k] || 0), 0);

const ServiceDashboardModal: React.FC<ServiceDashboardModalProps> = ({
  onClose,
  serviceName,
  initialFilters,
}) => {
  const hasOrders = serviceName === "Flex Bill" || serviceName === "Tap & Pay";
  const [viewType, setViewType] = useState<
    "daily" | "weekly" | "monthly" | "hourly"
  >("weekly");

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
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const [startHour, setStartHour] = useState<number>(0);
  const [endHour, setEndHour] = useState<number>(23);
  const [selectedMetric, setSelectedMetric] = useState<
    | "gmv"
    | "orders"
    | "transactions"
    | "avgTicket"
    | "avgTicketPerTransaction"
    | "even"
  >("gmv");
  const [isMetricDropdownOpen, setIsMetricDropdownOpen] = useState(false);

  const crossesMidnight = viewType === "hourly" && endHour < startHour;

  const endDayForHourly = (() => {
    if (!crossesMidnight) return selectedDay;
    const d = new Date(selectedDay);
    d.setDate(d.getDate() + 1);
    return d;
  })();

  const localDateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const hourlyTimelineFilters =
    viewType === "hourly"
      ? {
          start_date: localDateStr(selectedDay),
          end_date: localDateStr(endDayForHourly),
          start_time: `${String(startHour).padStart(2, "0")}:00`,
          end_time: `${String(endHour).padStart(2, "0")}:00`,
        }
      : {
          start_date: dateRange.startDate.toISOString().split("T")[0],
          end_date: dateRange.endDate.toISOString().split("T")[0],
        };

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
            : serviceName === "Tap & Pay"
              ? "tap-and-pay"
              : "todos";

  const commonFilters = {
    view_type: viewType,
    ...hourlyTimelineFilters,
    service: serviceFilter,
    restaurant_id: initialFilters?.restaurant_id,
    gender: initialFilters?.gender,
    age_range: initialFilters?.age_range,
  };

  const { data: volumeData, isLoading: volumeLoading } =
    useVolumeTimeline(commonFilters);
  const { data: ordersData, isLoading: ordersLoading } =
    useOrdersTimeline(commonFilters);
  const { data: transactionsData, isLoading: transactionsLoading } =
    useTransactionsTimeline(commonFilters);

  const isLoading = volumeLoading || ordersLoading || transactionsLoading;

  interface TimelineDataItem {
    date: string;
    "Flex Bill"?: number;
    "Tap Order & Pay"?: number;
    "Pick & Go"?: number;
    "Room Service"?: number;
    "Tap & Pay"?: number;
  }

  const serviceMetrics = useMemo(() => {
    if (!volumeData || !ordersData || !transactionsData) {
      return {
        gmv: 0,
        orders: 0,
        transactions: 0,
        avgTicket: 0,
        avgTicketPerTransaction: 0,
        even: 0,
        gmvChange: 0,
        ordersChange: 0,
        transactionsChange: 0,
        avgTicketChange: 0,
        avgTicketPerTransactionChange: 0,
        evenChange: 0,
      };
    }

    const totalGmv = volumeData.reduce(
      (s: number, i: TimelineDataItem) => s + sumRow(i),
      0,
    );
    const totalOrders = ordersData.reduce(
      (s: number, i: TimelineDataItem) => s + sumRow(i),
      0,
    );
    const totalTransactions = transactionsData.reduce(
      (s: number, i: TimelineDataItem) => s + sumRow(i),
      0,
    );
    const avgTicket = totalOrders > 0 ? totalGmv / totalOrders : 0;
    const avgTicketPerTransaction =
      totalTransactions > 0 ? totalGmv / totalTransactions : 0;

    const calcChange = (data: any[]) => {
      if (data.length < 2) return 0;
      const prev = sumRow(data[data.length - 2]);
      const curr = sumRow(data[data.length - 1]);
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    const gmvChange = calcChange(volumeData);
    const ordersChange = calcChange(ordersData);
    const transactionsChange = calcChange(transactionsData);

    const prevGmv =
      volumeData.length > 1 ? sumRow(volumeData[volumeData.length - 2]) : 0;
    const lastGmv =
      volumeData.length > 0 ? sumRow(volumeData[volumeData.length - 1]) : 0;
    const prevOrders =
      ordersData.length > 1 ? sumRow(ordersData[ordersData.length - 2]) : 0;
    const lastOrders =
      ordersData.length > 0 ? sumRow(ordersData[ordersData.length - 1]) : 0;
    const prevAvgTicket = prevOrders > 0 ? prevGmv / prevOrders : 0;
    const lastAvgTicket = lastOrders > 0 ? lastGmv / lastOrders : 0;
    const avgTicketChange =
      prevAvgTicket > 0
        ? ((lastAvgTicket - prevAvgTicket) / prevAvgTicket) * 100
        : 0;

    const prevTx =
      transactionsData.length > 1
        ? sumRow(transactionsData[transactionsData.length - 2])
        : 0;
    const lastTx =
      transactionsData.length > 0
        ? sumRow(transactionsData[transactionsData.length - 1])
        : 0;
    const prevAvgTxTicket = prevTx > 0 ? prevGmv / prevTx : 0;
    const lastAvgTxTicket = lastTx > 0 ? lastGmv / lastTx : 0;
    const avgTicketPerTransactionChange =
      prevAvgTxTicket > 0
        ? ((lastAvgTxTicket - prevAvgTxTicket) / prevAvgTxTicket) * 100
        : 0;

    const evenKey = `${serviceName}_income`;
    const totalEven = volumeData.reduce(
      (s: number, i: any) => s + (i[evenKey] || 0),
      0,
    );
    const lastEven =
      volumeData.length > 0
        ? volumeData[volumeData.length - 1][evenKey] || 0
        : 0;
    const prevEven =
      volumeData.length > 1
        ? volumeData[volumeData.length - 2][evenKey] || 0
        : 0;
    const evenChange =
      prevEven > 0
        ? ((lastEven - prevEven) / prevEven) * 100
        : lastEven > 0
          ? 100
          : 0;

    return {
      gmv: totalGmv,
      orders: totalOrders,
      transactions: totalTransactions,
      avgTicket,
      avgTicketPerTransaction,
      even: totalEven,
      gmvChange,
      ordersChange,
      transactionsChange,
      avgTicketChange,
      avgTicketPerTransactionChange,
      evenChange,
    };
  }, [volumeData, ordersData, transactionsData, serviceName]);

  const metricOptions = hasOrders
    ? [
        { value: "gmv", label: "GMV total" },
        { value: "orders", label: "Total de órdenes" },
        { value: "transactions", label: "Total de transacciones" },
        { value: "avgTicket", label: "Ticket promedio por orden" },
        {
          value: "avgTicketPerTransaction",
          label: "Ticket promedio por transacción",
        },
        { value: "even", label: "Ingresos Even" },
      ]
    : [
        { value: "gmv", label: "GMV total" },
        { value: "transactions", label: "Total de transacciones" },
        {
          value: "avgTicketPerTransaction",
          label: "Ticket promedio por transacción",
        },
        { value: "even", label: "Ingresos Even" },
      ];

  const chartData = useMemo(() => {
    if (!volumeData || !ordersData || !transactionsData) return [];
    return volumeData.map((volumeItem: TimelineDataItem, index: number) => {
      const ordersItem = ordersData[index] || {};
      const transactionsItem = transactionsData[index] || {};
      const totalGmv = sumRow(volumeItem);
      const totalOrders = sumRow(ordersItem);
      const totalTransactions = sumRow(transactionsItem);
      const avgTicket = totalOrders > 0 ? totalGmv / totalOrders : 0;
      const avgTicketPerTx =
        totalTransactions > 0 ? totalGmv / totalTransactions : 0;
      const evenKey = `${serviceName}_income`;
      return {
        date: volumeItem.date,
        gmv: totalGmv,
        orders: totalOrders,
        transactions: totalTransactions,
        avgTicket: Math.round(avgTicket),
        avgTicketPerTransaction: Math.round(avgTicketPerTx),
        even: (volumeItem as any)[evenKey] || 0,
      };
    });
  }, [volumeData, ordersData, transactionsData, serviceName]);

  const formatDateForInput = (date: Date) => date.toISOString().split("T")[0];

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({ ...dateRange, startDate: new Date(e.target.value) });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({ ...dateRange, endDate: new Date(e.target.value) });
  };

  const navigateDay = (delta: number) => {
    setSelectedDay((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + delta);
      return next;
    });
  };

  const formatDayDisplay = (date: Date) =>
    date.toLocaleDateString("es-MX", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const resetFilters = () => {
    setViewType("weekly");
    setDateRange({
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date(),
    });
    setSelectedDay(new Date());
    setStartHour(0);
    setEndHour(23);
    setSelectedMetric("gmv");
  };

  const getMetricLabel = () =>
    metricOptions.find((o) => o.value === selectedMetric)?.label || "GMV total";

  const formatMetricValue = (value: number) => {
    switch (selectedMetric) {
      case "gmv":
      case "avgTicket":
      case "avgTicketPerTransaction":
      case "even":
        return formatCurrency(value);
      default:
        return formatNumber(value);
    }
  };

  const formatYAxisTick = (value: number) => {
    if (selectedMetric === "gmv" || selectedMetric === "even")
      return formatCurrency(value).split(".")[0];
    if (
      selectedMetric === "avgTicket" ||
      selectedMetric === "avgTicketPerTransaction"
    )
      return `$${value}`;
    return value.toString();
  };

  const formatDateLabel = (dateKey: string) => {
    if (viewType === "hourly") {
      const hour = dateKey.split("T")[1];
      return `${hour}:00`;
    } else if (viewType === "daily") {
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".metric-dropdown")) setIsMetricDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${String(i).padStart(2, "0")}:00`,
  }));

  const isHourly = viewType === "hourly";
  const xAxisAngle = isHourly || viewType === "daily" ? -45 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl p-3 sm:p-6 relative overflow-y-auto max-h-[95vh] sm:max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700"
        >
          <XIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="mb-4 sm:mb-6 pr-6">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-800">
            Dashboard: {serviceName}
          </h2>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6 items-start sm:items-center bg-gray-50 p-2 sm:p-3 rounded-lg">
          {/* Fechas — ocultas en modo hora */}
          {!isHourly && (
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <div className="flex-1 sm:flex-none">
                <label className="text-[10px] sm:text-xs text-gray-500 block mb-1">
                  Inicio
                </label>
                <input
                  type="date"
                  value={formatDateForInput(dateRange.startDate)}
                  onChange={handleStartDateChange}
                  className="text-xs sm:text-sm p-1 sm:p-1.5 border border-gray-200 rounded w-full"
                />
              </div>
              <div className="flex-1 sm:flex-none">
                <label className="text-[10px] sm:text-xs text-gray-500 block mb-1">
                  Fin
                </label>
                <input
                  type="date"
                  value={formatDateForInput(dateRange.endDate)}
                  onChange={handleEndDateChange}
                  className="text-xs sm:text-sm p-1 sm:p-1.5 border border-gray-200 rounded w-full"
                />
              </div>
            </div>
          )}

          {/* Controles de hora */}
          {isHourly && (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigateDay(-1)}
                  className="p-1 rounded hover:bg-gray-200 text-gray-600 text-sm"
                >
                  ‹
                </button>
                <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                  {formatDayDisplay(selectedDay)}
                </span>
                <button
                  onClick={() => navigateDay(1)}
                  className="p-1 rounded hover:bg-gray-200 text-gray-600 text-sm"
                >
                  ›
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <label className="text-[10px] text-gray-500 block mb-0.5">
                    Desde
                  </label>
                  <select
                    value={startHour}
                    onChange={(e) => setStartHour(Number(e.target.value))}
                    className="text-xs p-1 border border-gray-200 rounded"
                  >
                    {hourOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-0.5">
                    Hasta
                  </label>
                  <select
                    value={endHour}
                    onChange={(e) => setEndHour(Number(e.target.value))}
                    className="text-xs p-1 border border-gray-200 rounded"
                  >
                    {hourOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                {crossesMidnight && (
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    +1 día
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Toggle de visualización */}
          <div className="flex bg-white rounded-md p-0.5 sm:p-1 sm:ml-auto shadow-sm w-full sm:w-auto justify-center">
            <button
              onClick={() => setViewType("hourly")}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md flex-1 sm:flex-none ${viewType === "hourly" ? "bg-purple-100 text-purple-700 font-medium" : "text-gray-600"}`}
            >
              Hora
            </button>
            <button
              onClick={() => setViewType("daily")}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md flex-1 sm:flex-none ${viewType === "daily" ? "bg-purple-100 text-purple-700 font-medium" : "text-gray-600"}`}
            >
              Diario
            </button>
            <button
              onClick={() => setViewType("weekly")}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md flex-1 sm:flex-none ${viewType === "weekly" ? "bg-purple-100 text-purple-700 font-medium" : "text-gray-600"}`}
            >
              Semanal
            </button>
            <button
              onClick={() => setViewType("monthly")}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md flex-1 sm:flex-none ${viewType === "monthly" ? "bg-purple-100 text-purple-700 font-medium" : "text-gray-600"}`}
            >
              Mensual
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48 sm:h-64">
            <LoadingSpinner message="Cargando datos..." />
          </div>
        ) : (
          <>
            {/* Indicadores clave */}
            {hasOrders ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-white rounded-lg p-2 sm:p-4 border border-gray-100 shadow-sm">
                  <h3 className="text-[10px] sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    GMV total
                  </h3>
                  <p className="text-base sm:text-2xl font-semibold">
                    {formatCurrency(serviceMetrics.gmv)}
                  </p>
                  <div
                    className={`text-[10px] sm:text-xs mt-1 ${serviceMetrics.gmvChange >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatChange(serviceMetrics.gmvChange)} vs. período
                    anterior
                  </div>
                </div>
                <div className="bg-white rounded-lg p-2 sm:p-4 border border-gray-100 shadow-sm">
                  <h3 className="text-[10px] sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Total de órdenes
                  </h3>
                  <p className="text-base sm:text-2xl font-semibold">
                    {formatNumber(serviceMetrics.orders)}
                  </p>
                  <div
                    className={`text-[10px] sm:text-xs mt-1 ${serviceMetrics.ordersChange >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatChange(serviceMetrics.ordersChange)} vs. período
                    anterior
                  </div>
                </div>
                <div className="bg-white rounded-lg p-2 sm:p-4 border border-gray-100 shadow-sm">
                  <h3 className="text-[10px] sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Total de transacciones
                  </h3>
                  <p className="text-base sm:text-2xl font-semibold">
                    {formatNumber(serviceMetrics.transactions)}
                  </p>
                  <div
                    className={`text-[10px] sm:text-xs mt-1 ${serviceMetrics.transactionsChange >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatChange(serviceMetrics.transactionsChange)} vs.
                    período anterior
                  </div>
                </div>
                <div className="bg-white rounded-lg p-2 sm:p-4 border border-gray-100 shadow-sm">
                  <h3 className="text-[10px] sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Ticket promedio por orden
                  </h3>
                  <p className="text-base sm:text-2xl font-semibold">
                    {formatCurrency(serviceMetrics.avgTicket)}
                  </p>
                  <div
                    className={`text-[10px] sm:text-xs mt-1 ${serviceMetrics.avgTicketChange >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatChange(serviceMetrics.avgTicketChange)} vs. período
                    anterior
                  </div>
                </div>
                <div className="bg-white rounded-lg p-2 sm:p-4 border border-gray-100 shadow-sm">
                  <h3 className="text-[10px] sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Ticket promedio por transacción
                  </h3>
                  <p className="text-base sm:text-2xl font-semibold">
                    {formatCurrency(serviceMetrics.avgTicketPerTransaction)}
                  </p>
                  <div
                    className={`text-[10px] sm:text-xs mt-1 ${serviceMetrics.avgTicketPerTransactionChange >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatChange(serviceMetrics.avgTicketPerTransactionChange)}{" "}
                    vs. período anterior
                  </div>
                </div>
                <div className="bg-white rounded-lg p-2 sm:p-4 border border-gray-100 shadow-sm">
                  <h3 className="text-[10px] sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Ingresos Even
                  </h3>
                  <p className="text-base sm:text-2xl font-semibold">
                    {formatCurrency(serviceMetrics.even)}
                  </p>
                  <div
                    className={`text-[10px] sm:text-xs mt-1 ${serviceMetrics.evenChange >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatChange(serviceMetrics.evenChange)} vs. período
                    anterior
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-white rounded-lg p-2 sm:p-4 border border-gray-100 shadow-sm">
                  <h3 className="text-[10px] sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    GMV total
                  </h3>
                  <p className="text-base sm:text-2xl font-semibold">
                    {formatCurrency(serviceMetrics.gmv)}
                  </p>
                  <div
                    className={`text-[10px] sm:text-xs mt-1 ${serviceMetrics.gmvChange >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatChange(serviceMetrics.gmvChange)} vs. período
                    anterior
                  </div>
                </div>
                <div className="bg-white rounded-lg p-2 sm:p-4 border border-gray-100 shadow-sm">
                  <h3 className="text-[10px] sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Total de transacciones
                  </h3>
                  <p className="text-base sm:text-2xl font-semibold">
                    {formatNumber(serviceMetrics.transactions)}
                  </p>
                  <div
                    className={`text-[10px] sm:text-xs mt-1 ${serviceMetrics.transactionsChange >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatChange(serviceMetrics.transactionsChange)} vs.
                    período anterior
                  </div>
                </div>
                <div className="bg-white rounded-lg p-2 sm:p-4 border border-gray-100 shadow-sm">
                  <h3 className="text-[10px] sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Ticket promedio por transacción
                  </h3>
                  <p className="text-base sm:text-2xl font-semibold">
                    {formatCurrency(serviceMetrics.avgTicketPerTransaction)}
                  </p>
                  <div
                    className={`text-[10px] sm:text-xs mt-1 ${serviceMetrics.avgTicketPerTransactionChange >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatChange(serviceMetrics.avgTicketPerTransactionChange)}{" "}
                    vs. período anterior
                  </div>
                </div>
                <div className="bg-white rounded-lg p-2 sm:p-4 border border-gray-100 shadow-sm">
                  <h3 className="text-[10px] sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Ingresos Even
                  </h3>
                  <p className="text-base sm:text-2xl font-semibold">
                    {formatCurrency(serviceMetrics.even)}
                  </p>
                  <div
                    className={`text-[10px] sm:text-xs mt-1 ${serviceMetrics.evenChange >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatChange(serviceMetrics.evenChange)} vs. período
                    anterior
                  </div>
                </div>
              </div>
            )}

            {/* Gráfica */}
            <div className="bg-white rounded-lg p-2 sm:p-4 border border-gray-100 shadow-sm mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
                <div className="relative metric-dropdown">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 mr-2">
                    Visualizar:
                  </label>
                  <button
                    className="flex items-center text-xs sm:text-sm bg-white border border-gray-200 rounded-md px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                    onClick={() =>
                      setIsMetricDropdownOpen(!isMetricDropdownOpen)
                    }
                  >
                    <span className="font-medium">{getMetricLabel()}</span>
                    <ChevronDownIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 sm:ml-1.5" />
                  </button>
                  {isMetricDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-md z-10 w-48 sm:w-60">
                      {metricOptions.map((option) => (
                        <button
                          key={option.value}
                          className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-gray-50 ${selectedMetric === option.value ? "bg-purple-50 text-purple-700 font-medium" : ""}`}
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
              <div className="h-56 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDateLabel}
                      tick={{ fontSize: 10 }}
                      tickMargin={8}
                      axisLine={{ stroke: "#E5E7EB" }}
                      tickLine={false}
                      angle={xAxisAngle}
                      textAnchor={xAxisAngle !== 0 ? "end" : "middle"}
                      height={xAxisAngle !== 0 ? 50 : 25}
                    />
                    <YAxis
                      tickFormatter={formatYAxisTick}
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={50}
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
                      dot={{ r: 2, fill: "#8884d8" }}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex justify-end mt-3 sm:mt-4">
              <button
                onClick={resetFilters}
                className="flex items-center text-xs sm:text-sm text-gray-600 hover:text-purple-600 bg-gray-100 hover:bg-gray-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded transition-colors"
              >
                <RefreshCwIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
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

import React, { useState, Component } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Label,
} from "recharts";
import { SearchIcon } from "lucide-react";
import { formatCurrency, formatNumber } from "../../utils/formatters";
import DetailedServiceChart from "./DetailedServiceChart";

// Colores por servicio
const SERVICE_COLORS: { [key: string]: string } = {
  "Flex Bill": "#82ca9d",
  "Tap Order & Pay": "#8884d8",
  "Pick & Go": "#fbbf24",
  "Room Service": "#d92926",
};

// Componente para el tooltip personalizado
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percent =
      data.total > 0 ? Math.round((data.value / data.total) * 100) : 0;
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm">{`${data.valueFormatted} (${percent}%)`}</p>
      </div>
    );
  }
  return null;
};

interface ServiceDistributionChartsProps {
  compact?: boolean;
  volumeByService?: Array<{ service: string; volume: number }>;
  ordersByService?: Array<{ service: string; count: number }>;
  transactionsByService?: Array<{ service: string; count: number }>;
  filters?: {
    restaurant_id?: number | number[];
    service?: string;
    start_date?: string;
    end_date?: string;
  };
}

const ServiceDistributionCharts: React.FC<ServiceDistributionChartsProps> = ({
  compact = false,
  volumeByService = [],
  ordersByService = [],
  transactionsByService = [],
  filters = {},
}) => {
  // Estados para controlar la visualización de las gráficas detalladas
  const [showVolumeDetail, setShowVolumeDetail] = useState(false);
  const [showOrdersDetail, setShowOrdersDetail] = useState(false);
  const [showTransactionsDetail, setShowTransactionsDetail] = useState(false);

  // Convertir datos del backend a formato para las gráficas
  const gmvData = volumeByService.map((item) => ({
    name: item.service,
    value: item.volume,
    color: SERVICE_COLORS[item.service] || "#8884d8",
  }));

  const ordersData = ordersByService.map((item) => ({
    name: item.service,
    value: item.count,
    color: SERVICE_COLORS[item.service] || "#8884d8",
  }));

  const transactionsData = transactionsByService.map((item) => ({
    name: item.service,
    value: item.count,
    color: SERVICE_COLORS[item.service] || "#8884d8",
  }));

  // Calcular totales
  const totalGMV = gmvData.reduce((sum, item) => sum + item.value, 0);
  const totalOrders = ordersData.reduce((sum, item) => sum + item.value, 0);
  const totalTransactions = transactionsData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  // Preparar los datos con valores formateados para el tooltip
  const gmvDataFormatted = gmvData.map((item) => ({
    ...item,
    total: totalGMV,
    valueFormatted: formatCurrency(item.value),
  }));
  const ordersDataFormatted = ordersData.map((item) => ({
    ...item,
    total: totalOrders,
    valueFormatted: formatNumber(item.value),
  }));
  const transactionsDataFormatted = transactionsData.map((item) => ({
    ...item,
    total: totalTransactions,
    valueFormatted: formatNumber(item.value),
  }));

  // Ajustar tamaños y configuración basados en modo compacto o normal
  const chartHeight = compact ? "40%" : "64";
  const titleClass = compact
    ? "text-base font-medium text-gray-800 mb-2"
    : "text-lg font-medium text-gray-800 mb-4";
  const containerClass = compact ? "space-y-3" : "space-y-6";
  const chartContainerClass = compact ? "p-3" : "p-6";
  const innerRadius = compact ? 40 : 60;
  const outerRadius = compact ? 60 : 80;

  return (
    <div className={containerClass}>
      <h2 className={titleClass}>Distribución por servicio</h2>
      {/* Gráfico 1 - Distribución del GMV por servicio */}
      <div
        className={`bg-white rounded-lg shadow-sm ${chartContainerClass} relative`}
      >
        <h3 className="text-sm font-medium text-gray-700 mb-1">
          Volumen x Servicio
        </h3>
        <div className="flex flex-col items-center">
          <div className="text-center mb-1">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-base font-semibold">
              {formatCurrency(totalGMV)}
            </p>
          </div>
          <div
            className="absolute top-3 right-3 cursor-pointer z-10"
            onClick={() => setShowVolumeDetail(true)}
          >
            <SearchIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </div>
          <div
            style={{
              height: compact ? "140px" : "180px",
              width: "100%",
            }}
            className="cursor-pointer"
            onClick={() => setShowVolumeDetail(true)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gmvDataFormatted}
                  cx="50%"
                  cy="50%"
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                >
                  {gmvDataFormatted.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  formatter={(value, entry: any) => {
                    const percent =
                      totalGMV > 0
                        ? Math.round((entry.payload.value / totalGMV) * 100)
                        : 0;
                    return (
                      <span className="text-xs">{`${value} (${percent}%)`}</span>
                    );
                  }}
                  iconSize={8}
                  wrapperStyle={{
                    fontSize: compact ? "10px" : "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gráfico 2 - Distribución de órdenes por servicio */}
      <div
        className={`bg-white rounded-lg shadow-sm ${chartContainerClass} relative`}
      >
        <h3 className="text-sm font-medium text-gray-700 mb-1">
          Órdenes x Servicio
        </h3>
        <div className="flex flex-col items-center">
          <div className="text-center mb-1">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-base font-semibold">
              {formatNumber(totalOrders)}
            </p>
          </div>
          <div
            className="absolute top-3 right-3 cursor-pointer z-10"
            onClick={() => setShowOrdersDetail(true)}
          >
            <SearchIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </div>
          <div
            style={{
              height: compact ? "140px" : "180px",
              width: "100%",
            }}
            className="cursor-pointer"
            onClick={() => setShowOrdersDetail(true)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ordersDataFormatted}
                  cx="50%"
                  cy="50%"
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                >
                  {ordersDataFormatted.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  formatter={(value, entry: any) => {
                    const percent =
                      totalOrders > 0
                        ? Math.round((entry.payload.value / totalOrders) * 100)
                        : 0;
                    return (
                      <span className="text-xs">{`${value} (${percent}%)`}</span>
                    );
                  }}
                  iconSize={8}
                  wrapperStyle={{
                    fontSize: compact ? "10px" : "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gráfico 3 - Distribución de transacciones por servicio */}
      <div
        className={`bg-white rounded-lg shadow-sm ${chartContainerClass} relative`}
      >
        <h3 className="text-sm font-medium text-gray-700 mb-1">
          Transacciones x Servicio
        </h3>
        <div className="flex flex-col items-center">
          <div className="text-center mb-1">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-base font-semibold">
              {formatNumber(totalTransactions)}
            </p>
          </div>
          <div
            className="absolute top-3 right-3 cursor-pointer z-10"
            onClick={() => setShowTransactionsDetail(true)}
          >
            <SearchIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </div>
          <div
            style={{
              height: compact ? "140px" : "180px",
              width: "100%",
            }}
            className="cursor-pointer"
            onClick={() => setShowTransactionsDetail(true)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={transactionsDataFormatted}
                  cx="50%"
                  cy="50%"
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                >
                  {transactionsDataFormatted.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  formatter={(value, entry: any) => {
                    const percent =
                      totalTransactions > 0
                        ? Math.round(
                            (entry.payload.value / totalTransactions) * 100
                          )
                        : 0;
                    return (
                      <span className="text-xs">{`${value} (${percent}%)`}</span>
                    );
                  }}
                  iconSize={8}
                  wrapperStyle={{
                    fontSize: compact ? "10px" : "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gráficas detalladas como modales */}
      {showVolumeDetail && (
        <DetailedServiceChart
          onClose={() => setShowVolumeDetail(false)}
          title="Volumen Transaccionado por Servicio"
          chartType="volume"
          serviceData={gmvData}
          filters={filters}
        />
      )}
      {showOrdersDetail && (
        <DetailedServiceChart
          onClose={() => setShowOrdersDetail(false)}
          title="Órdenes por Servicio por período"
          chartType="orders"
          serviceData={ordersData}
          filters={filters}
        />
      )}
      {showTransactionsDetail && (
        <DetailedServiceChart
          onClose={() => setShowTransactionsDetail(false)}
          title="Transacciones por Servicio por período"
          chartType="transactions"
          serviceData={transactionsData}
          filters={filters}
        />
      )}
    </div>
  );
};
export default ServiceDistributionCharts;

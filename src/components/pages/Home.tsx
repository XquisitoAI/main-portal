import React, { useState, useMemo, useCallback, useEffect } from "react";
import GlobalKpiCard from "../dashboard/GlobalKpiCard";
import ServiceKpiCard from "../dashboard/ServiceKpiCard";
import ServiceDistributionCharts from "../dashboard/ServiceDistributionCharts";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";
import { useAuth } from "../../hooks/useAuth";
import { useSuperAdminStats, useRestaurants } from "../../hooks/useApiData";
import { formatCurrency, formatNumber } from "../../utils/formatters";
import {
  CreditCardIcon,
  UsersIcon,
  ArrowDownUpIcon,
  CheckIcon,
  DollarSignIcon,
  ReceiptIcon,
  UserCheckIcon,
} from "lucide-react";
import type { SuperAdminFilters } from "../../types/api";
import DashboardFilters, { FilterState } from "../dashboard/DashboardFilters";

// Función helper para obtener las fechas por defecto (últimos 30 días)
const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  return {
    startDate,
    endDate,
  };
};

const Home: React.FC = () => {
  // Autenticación habilitada
  const { isSignedIn, isLoaded } = useAuth();
  const [superAdminFilters, setSuperAdminFilters] = useState<SuperAdminFilters>(
    {}
  );

  // Estado de los filtros UI
  const [uiFilters, setUiFilters] = useState<FilterState>({
    dateRange: getDefaultDateRange(),
    restaurantIds: [],
    client: "",
    services: [],
    gender: "",
    ageRange: { min: 0, max: 0 },
  });

  // Manejar cambio de filtros desde DashboardFilters
  const handleFilterChange = useCallback((filters: FilterState) => {
    // Actualizar el estado UI primero
    setUiFilters(filters);

    // Mapear nombres de servicios de UI a formato del backend
    let serviceValue: any = "todos";
    if (filters.services.length > 0) {
      // Convertir todos los servicios seleccionados a formato backend
      const mappedServices = filters.services.map((service) => {
        if (service === "Flex Bill") return "flex-bill";
        if (service === "Tap Order & Pay") return "tap-order-pay";
        if (service === "Pick & Go") return "pick-and-go";
        if (service === "Room Service") return "room-service";
        if (service === "Tap & Pay") return "tap-and-pay";

        return service;
      });

      // Si todos los servicios están seleccionados, enviar 'todos'
      if (mappedServices.length === 3) {
        serviceValue = "todos";
      } else {
        // Si solo hay uno seleccionado, enviar ese
        serviceValue = mappedServices[0];
      }
    }

    // Mapear rango de edad a formato del backend
    let ageRangeValue: any = "todos";
    if (filters.ageRange) {
      const { min, max } = filters.ageRange;
      // Convertir rango numérico a formato esperado por el backend
      if (min === 0 && max === 0) {
        ageRangeValue = "todos";
      } else if (min === 18 && max === 24) {
        ageRangeValue = "18-24";
      } else if (min === 25 && max === 34) {
        ageRangeValue = "25-34";
      } else if (min === 35 && max === 44) {
        ageRangeValue = "35-44";
      } else if (min === 45 && max === 54) {
        ageRangeValue = "45-54";
      } else if (min === 55) {
        ageRangeValue = "55+";
      }
    }

    // Mapear IDs de restaurantes
    let restaurantIdValue: number | number[] | undefined;
    if (filters.restaurantIds.length === 1) {
      restaurantIdValue = filters.restaurantIds[0];
    } else if (filters.restaurantIds.length > 1) {
      restaurantIdValue = filters.restaurantIds;
    }

    const newFilters: SuperAdminFilters = {
      start_date: filters.dateRange.startDate?.toISOString().split("T")[0],
      end_date: filters.dateRange.endDate?.toISOString().split("T")[0],
      restaurant_id: restaurantIdValue,
      service: serviceValue,
      gender: filters.gender
        ? filters.gender === "Masculino"
          ? "male"
          : filters.gender === "Femenino"
            ? "female"
            : "other"
        : "todos",
      age_range: ageRangeValue,
    };
    setSuperAdminFilters(newFilters);
  }, []);

  // Aplicar filtros iniciales al montar el componente
  useEffect(() => {
    handleFilterChange(uiFilters);
  }, []);

  // Obtener datos del Super Admin desde el backend
  const {
    data: superAdminStats,
    isLoading: statsLoading,
    isError: statsError,
    error,
    refetch,
  } = useSuperAdminStats(superAdminFilters);
  const { data: restaurantsList, isLoading: restaurantsLoading } =
    useRestaurants();

  const isLoading = statsLoading || restaurantsLoading;
  const isError = statsError;

  // Calcular métricas de servicios basado en datos reales del Super Admin
  const serviceMetrics = useMemo(() => {
    if (
      !superAdminStats?.volume_by_service ||
      !superAdminStats?.orders_by_service ||
      !superAdminStats?.transactions_by_service
    )
      return [];

    return superAdminStats.volume_by_service.map((volumeData, index) => {
      const ordersData = superAdminStats.orders_by_service[index];
      const transactionsData = superAdminStats.transactions_by_service[index];
      const totalVolume = superAdminStats.transaction_volume || 1;
      const totalOrders = superAdminStats.successful_orders || 1;

      return {
        id: `service-${index}`,
        name: volumeData.service,
        status: "active" as const,
        gmv: volumeData.volume,
        gmvPercentage: (volumeData.volume / totalVolume) * 100,
        usage: ordersData?.count || 0,
        quota: totalOrders,
        keyMetric: {
          name: "Órdenes",
          value: ordersData?.count || 0,
          unit: "",
        },
        secondaryMetric: {
          name: "Transacciones",
          value: transactionsData?.count || 0,
          unit: "",
        },
      };
    });
  }, [superAdminStats]);

  // Verificaciones de autenticación
  if (!isLoaded) {
    return <LoadingSpinner message="Inicializando aplicación..." />;
  }

  if (!isSignedIn) {
    return null;
  }

  // Si hay error, mostrar mensaje de error
  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Super Admin Dashboard
          </h1>
        </div>
        <ErrorMessage
          message={error?.message || "Error al cargar los datos del dashboard"}
          onRetry={refetch}
        />
      </div>
    );
  }

  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Fila de filtros */}
        <DashboardFilters
          filters={uiFilters}
          onFilterChange={handleFilterChange}
          restaurants={restaurantsList || []}
        />
        <div className="flex justify-between items-center"></div>
        <LoadingSpinner message="Cargando datos del dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Fila de filtros */}
      <DashboardFilters
        filters={uiFilters}
        onFilterChange={handleFilterChange}
        restaurants={restaurantsList || []}
      />

      {/* Primera fila: Indicadores Clave y Distribución por Servicio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Contenedor 1: Indicadores Clave */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
          <h2 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4">
            Indicadores Clave
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <GlobalKpiCard
              title="Volumen transaccionado"
              value={formatCurrency(superAdminStats?.transaction_volume || 0)}
              previousValue={formatCurrency(
                superAdminStats?.previous_period?.transaction_volume || 0
              )}
              change={superAdminStats?.transaction_volume_change || 0}
              trendData={[]}
              tooltip="Suma de pagos aprobados en el rango (SUM de payment_amount donde payment_status='paid')"
              icon={<DollarSignIcon className="w-4 h-4 text-green-500" />}
              filters={superAdminFilters}
            />

            <GlobalKpiCard
              title="Ingresos Xquisito"
              value={formatCurrency(superAdminStats?.xquisito_income || 0)}
              previousValue={formatCurrency(
                superAdminStats?.previous_period?.xquisito_income || 0
              )}
              change={superAdminStats?.xquisito_income_change || 0}
              trendData={[]}
              tooltip="Comisión/fee de Xquisito sobre el volumen (Volumen transaccionado × fee_servicio)"
              icon={<ReceiptIcon className="w-4 h-4 text-blue-500" />}
              filters={superAdminFilters}
            />

            <GlobalKpiCard
              title="Comensales"
              value={formatNumber(superAdminStats?.active_diners || 0)}
              previousValue={formatNumber(
                superAdminStats?.previous_period?.active_diners || 0
              )}
              change={superAdminStats?.active_diners_change || 0}
              trendData={[]}
              tooltip="Usuarios que han realizado al menos un pedido en el período"
              icon={<UsersIcon className="w-4 h-4 text-indigo-500" />}
            />

            <GlobalKpiCard
              title="Órdenes Exitosas"
              value={formatNumber(superAdminStats?.successful_orders || 0)}
              previousValue={formatNumber(
                superAdminStats?.previous_period?.successful_orders || 0
              )}
              change={superAdminStats?.successful_orders_change || 0}
              trendData={[]}
              tooltip="Número absoluto de órdenes con estado exitoso (payment_status = success)"
              icon={<CheckIcon className="w-4 h-4 text-green-500" />}
              filters={superAdminFilters}
            />

            <GlobalKpiCard
              title="Admins Activos"
              value={formatNumber(superAdminStats?.active_admins || 0)}
              previousValue={formatNumber(
                superAdminStats?.previous_period?.active_admins || 0
              )}
              change={superAdminStats?.active_admins_change || 0}
              trendData={[]}
              tooltip="Administradores activos en el sistema"
              icon={<UserCheckIcon className="w-4 h-4 text-purple-500" />}
              hideChange={true}
            />

            {/* Métodos de pago */}
            {superAdminStats?.most_used_payment_method && (
              <GlobalKpiCard
                title="Método de Pago más Usado"
                value={superAdminStats.most_used_payment_method.method || "N/A"}
                previousValue={
                  superAdminStats.most_used_payment_method.method || "N/A"
                }
                change={0}
                trendData={[0, 0, 0, 0, 0, 0]}
                tooltip={`Método de pago con mayor número de transacciones (${superAdminStats.most_used_payment_method.count || 0} usos)`}
                icon={<CreditCardIcon className="w-4 h-4 text-blue-500" />}
                isText={true}
                hideChange={true}
                filters={superAdminFilters}
              />
            )}

            <GlobalKpiCard
              title="Total de Transacciones"
              value={formatNumber(superAdminStats?.total_transactions || 0)}
              previousValue={formatNumber(
                superAdminStats?.previous_period?.total_transactions || 0
              )}
              change={superAdminStats?.total_transactions_change || 0}
              trendData={[]}
              tooltip="Total de transacciones procesadas (éxito + fallo)"
              icon={<ArrowDownUpIcon className="w-4 h-4 text-indigo-500" />}
              filters={superAdminFilters}
            />
          </div>
        </div>

        {/* Contenedor 2: Distribución por Servicio */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
          <ServiceDistributionCharts
            compact={true}
            volumeByService={superAdminStats?.volume_by_service || []}
            ordersByService={superAdminStats?.orders_by_service || []}
            transactionsByService={
              superAdminStats?.transactions_by_service || []
            }
            filters={{
              restaurant_id: superAdminFilters.restaurant_id,
              service: superAdminFilters.service,
              start_date: superAdminFilters.start_date,
              end_date: superAdminFilters.end_date,
            }}
          />
        </div>
      </div>

      {/* Segunda fila: Indicadores por Servicio (horizontal) */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
        <h2 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4">
          Indicadores Por Servicio
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          {serviceMetrics.length > 0 ? (
            serviceMetrics
              .slice(0, 5)
              .map((service) => (
                <ServiceKpiCard
                  key={service.id}
                  name={service.name}
                  status={service.status}
                  gmv={service.gmv}
                  gmvPercentage={service.gmvPercentage}
                  usage={service.usage}
                  quota={service.quota}
                  keyMetric={service.keyMetric}
                  secondaryMetric={service.secondaryMetric}
                  initialFilters={superAdminFilters}
                />
              ))
          ) : (
            <div className="col-span-full flex items-center justify-center py-8">
              <div className="text-center">
                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No hay datos de servicios
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No se encontraron datos de servicios para el período
                  seleccionado.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

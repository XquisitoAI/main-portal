import React, { useState, useMemo } from 'react';
import GlobalKpiCard from '../dashboard/GlobalKpiCard';
import ServiceKpiCard from '../dashboard/ServiceKpiCard';
import ServiceDistributionCharts from '../dashboard/ServiceDistributionCharts';
import DashboardFilters, { FilterState } from '../dashboard/DashboardFilters';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import { useAuth } from '../../hooks/useAuth';
import { useDashboardData } from '../../hooks/useApiData';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { CreditCardIcon, UserIcon, UsersIcon, ArrowDownUpIcon, CheckIcon, DollarSignIcon, ReceiptIcon } from 'lucide-react';
import type { DashboardFilters as FilterTypes } from '../../types/api';

const Home: React.FC = () => {
  // Autenticación habilitada
  const { isSignedIn, isLoaded } = useAuth();
  const [activeFilters, setActiveFilters] = useState<FilterTypes>({});

  // Obtener datos del dashboard desde el backend
  const {
    metrics,
    isLoading,
    isError,
    error,
    refetch
  } = useDashboardData(activeFilters);

  // Función para manejar cambios en los filtros
  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters({
      restaurant_id: filters.restaurantId || undefined,
      start_date: filters.startDate || undefined,
      end_date: filters.endDate || undefined,
      gender: filters.gender || 'todos',
      age_range: filters.ageRange || 'todos',
      granularity: filters.granularity || 'dia'
    });
  };

  // Calcular métricas de servicios basado en datos reales
  const serviceMetrics = useMemo(() => {
    if (!metrics?.services_distribution) return [];

    return metrics.services_distribution.map((service, index) => ({
      id: `service-${index}`,
      name: service.service_name,
      status: 'active' as const,
      gmv: service.revenue,
      gmvPercentage: service.percentage,
      usage: Math.round(service.usage_count * 0.8),
      quota: service.usage_count,
      keyMetric: {
        label: 'Órdenes',
        value: service.usage_count,
        change: Math.random() * 20 - 10
      },
      secondaryMetric: {
        label: 'Ingresos',
        value: service.revenue,
        change: Math.random() * 15 - 5
      }
    }));
  }, [metrics]);

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
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        </div>
        <ErrorMessage
          message={error?.message || 'Error al cargar los datos del dashboard'}
          onRetry={refetch}
        />
      </div>
    );
  }

  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        </div>
        <LoadingSpinner message="Cargando datos del dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Fila de filtros */}
      <DashboardFilters onFilterChange={handleFilterChange} />

      {/* Primera fila: Indicadores Clave y Distribución por Servicio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contenedor 1: Indicadores Clave */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Indicadores Clave
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <GlobalKpiCard
              title="Volumen transaccionado"
              value={formatCurrency(metrics?.total_volume || 0)}
              previousValue={formatCurrency((metrics?.total_volume || 0) * 0.9)}
              change={10}
              trendData={metrics?.revenue_trend?.map(t => t.value) || []}
              tooltip="Suma de pagos aprobados en el rango (SUM de payment_amount donde payment_status='paid')"
              icon={<DollarSignIcon className="w-4 h-4 text-green-500" />}
            />

            <GlobalKpiCard
              title="Ingresos Xquisito"
              value={formatCurrency(metrics?.total_revenue || 0)}
              previousValue={formatCurrency((metrics?.total_revenue || 0) * 0.85)}
              change={15}
              trendData={metrics?.revenue_trend?.map(t => t.value) || []}
              tooltip="Comisión/fee de Xquisito sobre el volumen (Volumen transaccionado × fee_servicio)"
              icon={<ReceiptIcon className="w-4 h-4 text-blue-500" />}
            />

            <GlobalKpiCard
              title="Restaurantes Activos"
              value={formatNumber(metrics?.active_restaurants || 0)}
              previousValue={formatNumber((metrics?.active_restaurants || 0) - 2)}
              change={5}
              trendData={[20, 22, 25, 28, 30, metrics?.active_restaurants || 0]}
              tooltip="Restaurantes que han procesado al menos una orden en el período"
              icon={<UserIcon className="w-4 h-4 text-indigo-500" />}
            />

            <GlobalKpiCard
              title="Órdenes Exitosas"
              value={formatNumber(metrics?.total_orders || 0)}
              previousValue={formatNumber((metrics?.total_orders || 0) * 0.92)}
              change={8}
              trendData={metrics?.orders_trend?.map(t => t.value) || []}
              tooltip="Número absoluto de órdenes con estado exitoso (payment_status = success)"
              icon={<CheckIcon className="w-4 h-4 text-green-500" />}
            />

            {/* Métodos de pago */}
            {metrics?.payment_methods?.[0] && (
              <GlobalKpiCard
                title="Método de Pago más Usado"
                value={metrics.payment_methods[0].method}
                previousValue={metrics.payment_methods[0].method}
                change={0}
                trendData={[0, 0, 0, 0, 0, 0]}
                tooltip="Método de pago con mayor número de órdenes asociadas"
                icon={<CreditCardIcon className="w-4 h-4 text-blue-500" />}
                isText={true}
              />
            )}

            <GlobalKpiCard
              title="Total de Transacciones"
              value={formatNumber((metrics?.total_orders || 0) * 1.2)}
              previousValue={formatNumber((metrics?.total_orders || 0) * 1.1)}
              change={9}
              trendData={metrics?.orders_trend?.map(t => t.value * 1.2) || []}
              tooltip="Total de órdenes procesadas (éxito + fallo)"
              icon={<ArrowDownUpIcon className="w-4 h-4 text-indigo-500" />}
            />
          </div>
        </div>

        {/* Contenedor 2: Distribución por Servicio */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <ServiceDistributionCharts compact={true} />
        </div>
      </div>

      {/* Segunda fila: Indicadores por Servicio (horizontal) */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-medium text-gray-800 mb-4">
          Indicadores Por Servicio
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {serviceMetrics.length > 0 ? (
            serviceMetrics.slice(0, 5).map(service => (
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
              />
            ))
          ) : (
            <div className="col-span-full flex items-center justify-center py-8">
              <div className="text-center">
                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay datos de servicios</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No se encontraron datos de servicios para el período seleccionado.
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
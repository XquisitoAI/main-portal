import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsService, restaurantService, authService } from '../services/api';
import type { DashboardFilters, SuperAdminFilters, SuperAdminStats } from '../types/api';
import { useAuthenticatedApi } from './useAuthenticatedApi';

// Query keys para React Query
export const queryKeys = {
  restaurants: ['restaurants'],
  restaurant: (id: number) => ['restaurant', id],
  dashboardMetrics: (filters: DashboardFilters) => ['dashboardMetrics', filters],
  orders: (restaurantId?: number, limit?: number, offset?: number, status?: string, dateFilter?: string) =>
    ['orders', restaurantId, limit, offset, status, dateFilter],
  dashboardSummary: (restaurantId: number) => ['dashboardSummary', restaurantId],
  topSellingItem: (filters: Record<string, unknown>) => ['topSellingItem', filters],
  currentUser: ['currentUser'],
  superAdminStats: (filters: SuperAdminFilters) => ['superAdminStats', filters]
};

// Hook para obtener todos los restaurantes
export const useRestaurants = () => {
  const authenticatedApi = useAuthenticatedApi();

  return useQuery({
    queryKey: queryKeys.restaurants,
    queryFn: async () => {
      console.log('🔍 Fetching restaurants from super-admin endpoint with authenticated API');
      const response = await authenticatedApi.get('/api/super-admin/restaurants');
      return response.data.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2
  });
};

// Hook para obtener un restaurante específico
export const useRestaurant = (id: number) => {
  return useQuery({
    queryKey: queryKeys.restaurant(id),
    queryFn: () => restaurantService.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 2
  });
};

// Hook para obtener métricas del dashboard
export const useDashboardMetrics = (filters: DashboardFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.dashboardMetrics(filters),
    queryFn: () => analyticsService.getDashboardMetrics(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos - métricas cambian más frecuentemente
    retry: 2,
    refetchInterval: 5 * 60 * 1000 // Refetch cada 5 minutos para datos frescos
  });
};

// Hook para obtener órdenes con paginación
export const useOrders = (
  restaurantId?: number,
  limit = 20,
  offset = 0,
  status = 'todos',
  dateFilter = 'hoy'
) => {
  return useQuery({
    queryKey: queryKeys.orders(restaurantId, limit, offset, status, dateFilter),
    queryFn: () => analyticsService.getOrders(restaurantId, limit, offset, status, dateFilter),
    staleTime: 1 * 60 * 1000, // 1 minuto - órdenes cambian frecuentemente
    retry: 2,
    placeholderData: (previousData) => previousData // Para paginación suave
  });
};

// Hook para obtener resumen del dashboard
export const useDashboardSummary = (restaurantId: number) => {
  return useQuery({
    queryKey: queryKeys.dashboardSummary(restaurantId),
    queryFn: () => analyticsService.getDashboardSummary(restaurantId),
    enabled: !!restaurantId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2
  });
};

// Hook para obtener item más vendido
export const useTopSellingItem = (filters: Record<string, unknown> = {}) => {
  return useQuery({
    queryKey: queryKeys.topSellingItem(filters),
    queryFn: () => analyticsService.getTopSellingItem(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2
  });
};

// Hook para obtener usuario actual
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: authService.getCurrentUser,
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 1
  });
};

// Hook para sincronizar usuario (mutation)
export const useSyncUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.syncUser,
    onSuccess: () => {
      // Invalidar la query del usuario actual para refrescar datos
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    }
  });
};

// Hook combinado para el dashboard principal
export const useDashboardData = (filters: DashboardFilters = {}) => {
  const metricsQuery = useDashboardMetrics(filters);
  const restaurantsQuery = useRestaurants();

  return {
    metrics: metricsQuery.data,
    restaurants: restaurantsQuery.data,
    isLoading: metricsQuery.isLoading || restaurantsQuery.isLoading,
    isError: metricsQuery.isError || restaurantsQuery.isError,
    error: metricsQuery.error || restaurantsQuery.error,
    refetch: () => {
      metricsQuery.refetch();
      restaurantsQuery.refetch();
    }
  };
};

// Hook para obtener estadísticas del super admin
export const useSuperAdminStats = (filters: SuperAdminFilters = {}) => {
  const authenticatedApi = useAuthenticatedApi();

  return useQuery<SuperAdminStats>({
    queryKey: queryKeys.superAdminStats(filters),
    queryFn: async () => {
      // Construir query params
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== 'todos') {
          // Si es un array, convertirlo a string separado por comas
          if (Array.isArray(value)) {
            if (value.length > 0) {
              params.append(key, value.join(','));
            }
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const queryString = params.toString();
      const url = `/api/super-admin/stats${queryString ? `?${queryString}` : ''}`;

      console.log('🔍 Fetching super admin stats with authenticated API:', url);

      const response = await authenticatedApi.get(url);
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2,
    refetchInterval: 5 * 60 * 1000 // Refetch cada 5 minutos para datos frescos
  });
};
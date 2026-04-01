import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  analyticsService,
  restaurantService,
  authService,
} from "../services/api";
import type {
  DashboardFilters,
  SuperAdminFilters,
  SuperAdminStats,
  TransactionHistoryFilters,
  TransactionHistoryResponse,
} from "../types/api";
import { useAuthenticatedApi } from "./useAuthenticatedApi";
import { useSocket } from "./useSocket";

// Query keys para React Query
export const queryKeys = {
  restaurants: ["restaurants"],
  restaurant: (id: number) => ["restaurant", id],
  dashboardMetrics: (filters: DashboardFilters) => [
    "dashboardMetrics",
    filters,
  ],
  orders: (
    restaurantId?: number,
    limit?: number,
    offset?: number,
    status?: string,
    dateFilter?: string,
  ) => ["orders", restaurantId, limit, offset, status, dateFilter],
  dashboardSummary: (restaurantId: number) => [
    "dashboardSummary",
    restaurantId,
  ],
  topSellingItem: (filters: Record<string, unknown>) => [
    "topSellingItem",
    filters,
  ],
  currentUser: ["currentUser"],
  superAdminStats: (filters: SuperAdminFilters) => ["superAdminStats", filters],
  volumeTimeline: (filters: SuperAdminFilters & { view_type?: string }) => [
    "volumeTimeline",
    filters,
  ],
  ordersTimeline: (filters: SuperAdminFilters & { view_type?: string }) => [
    "ordersTimeline",
    filters,
  ],
  transactionsTimeline: (
    filters: SuperAdminFilters & { view_type?: string },
  ) => ["transactionsTimeline", filters],
  paymentMethodsTimeline: (
    filters: SuperAdminFilters & { view_type?: string },
  ) => ["paymentMethodsTimeline", filters],
  transactionHistory: (filters: TransactionHistoryFilters) => [
    "transactionHistory",
    filters,
  ],
};

// Hook para obtener todos los restaurantes
export const useRestaurants = () => {
  const authenticatedApi = useAuthenticatedApi();

  return useQuery({
    queryKey: queryKeys.restaurants,
    queryFn: async () => {
      const response = await authenticatedApi.get(
        "/api/super-admin/restaurants",
      );
      return response.data.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
};

// Hook para obtener un restaurante específico
export const useRestaurant = (id: number) => {
  return useQuery({
    queryKey: queryKeys.restaurant(id),
    queryFn: () => restaurantService.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
  });
};

// Hook para obtener métricas del dashboard
export const useDashboardMetrics = (filters: DashboardFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.dashboardMetrics(filters),
    queryFn: () => analyticsService.getDashboardMetrics(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos - métricas cambian más frecuentemente
    retry: 2,
    refetchInterval: 5 * 60 * 1000, // Refetch cada 5 minutos para datos frescos
  });
};

// Hook para obtener órdenes con paginación
export const useOrders = (
  restaurantId?: number,
  limit = 20,
  offset = 0,
  status = "todos",
  dateFilter = "hoy",
) => {
  return useQuery({
    queryKey: queryKeys.orders(restaurantId, limit, offset, status, dateFilter),
    queryFn: () =>
      analyticsService.getOrders(
        restaurantId,
        limit,
        offset,
        status,
        dateFilter,
      ),
    staleTime: 1 * 60 * 1000, // 1 minuto - órdenes cambian frecuentemente
    retry: 2,
    placeholderData: (previousData) => previousData, // Para paginación suave
  });
};

// Hook para obtener resumen del dashboard
export const useDashboardSummary = (restaurantId: number) => {
  return useQuery({
    queryKey: queryKeys.dashboardSummary(restaurantId),
    queryFn: () => analyticsService.getDashboardSummary(restaurantId),
    enabled: !!restaurantId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2,
  });
};

// Hook para obtener item más vendido
export const useTopSellingItem = (filters: Record<string, unknown> = {}) => {
  return useQuery({
    queryKey: queryKeys.topSellingItem(filters),
    queryFn: () => analyticsService.getTopSellingItem(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
};

// Hook para obtener usuario actual
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: authService.getCurrentUser,
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 1,
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
    },
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
    },
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
        if (value !== undefined && value !== null && value !== "todos") {
          // Si es un array, convertirlo a string separado por comas
          if (Array.isArray(value)) {
            if (value.length > 0) {
              params.append(key, value.join(","));
            }
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const queryString = params.toString();
      const url = `/api/super-admin/stats${queryString ? `?${queryString}` : ""}`;

      const response = await authenticatedApi.get(url);
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2,
    refetchInterval: 5 * 60 * 1000, // Refetch cada 5 minutos para datos frescos
  });
};

// Hook genérico para obtener datos de timeline
const useTimeline = (
  endpoint: string,
  filters: SuperAdminFilters & { view_type?: string },
  queryKey: any[],
) => {
  const authenticatedApi = useAuthenticatedApi();

  return useQuery({
    queryKey,
    queryFn: async () => {
      // Construir query params
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "todos") {
          // Si es un array, convertirlo a string separado por comas
          if (Array.isArray(value)) {
            if (value.length > 0) {
              params.append(key, value.join(","));
            }
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const queryString = params.toString();
      const url = `/api/super-admin/${endpoint}${queryString ? `?${queryString}` : ""}`;

      const response = await authenticatedApi.get(url);
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2,
    enabled: !!filters.start_date && !!filters.end_date, // Solo ejecutar si hay fechas
  });
};

// Hook para obtener timeline de volumen
export const useVolumeTimeline = (
  filters: SuperAdminFilters & { view_type?: string } = {},
) => {
  return useTimeline(
    "timeline/volume",
    filters,
    queryKeys.volumeTimeline(filters),
  );
};

// Hook para obtener timeline de órdenes
export const useOrdersTimeline = (
  filters: SuperAdminFilters & { view_type?: string } = {},
) => {
  return useTimeline(
    "timeline/orders",
    filters,
    queryKeys.ordersTimeline(filters),
  );
};

// Hook para obtener timeline de transacciones
export const useTransactionsTimeline = (
  filters: SuperAdminFilters & { view_type?: string } = {},
) => {
  return useTimeline(
    "timeline/transactions",
    filters,
    queryKeys.transactionsTimeline(filters),
  );
};

export const usePaymentMethodsTimeline = (
  filters: SuperAdminFilters & { view_type?: string } = {},
) => {
  return useTimeline(
    "timeline/payment-methods",
    filters,
    queryKeys.paymentMethodsTimeline(filters),
  );
};

// Hook para obtener historial de transacciones paginado
export const useTransactionHistory = (
  filters: TransactionHistoryFilters = {},
) => {
  const authenticatedApi = useAuthenticatedApi();

  return useQuery<TransactionHistoryResponse>({
    queryKey: queryKeys.transactionHistory(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "todos") {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              params.append(key, value.join(","));
            }
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const queryString = params.toString();
      const url = `/api/super-admin/transactions${queryString ? `?${queryString}` : ""}`;

      const response = await authenticatedApi.get(url);
      return response.data;
    },
    staleTime: 1 * 60 * 1000,
    retry: 2,
    placeholderData: (previousData) => previousData,
    enabled: !!filters.start_date && !!filters.end_date,
  });
};

// Hook para obtener estadísticas en tiempo real usando WebSocket
export const useRealtimeStats = (filters: SuperAdminFilters = {}) => {
  const { socket, isConnected } = useSocket();
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log(
    "[useRealtimeStats] Current state - stats:",
    stats,
    "isLoading:",
    isLoading,
    "isConnected:",
    isConnected,
  );

  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }

    // Solicitar stats iniciales
    setIsLoading(true);
    socket.emit("request:stats", filters);

    // Escuchar actualizaciones de stats
    const handleStatsUpdated = (data: {
      success: boolean;
      data: SuperAdminStats;
      timestamp: string;
    }) => {
      console.log("[Stats] Updated:", data);
      console.log("[Stats] Setting stats to:", data.data);
      setStats(data.data);
      console.log("[Stats] Stats set complete");
      setIsLoading(false);
      setError(null);
    };

    const handleStatsError = (data: {
      success: boolean;
      error: string;
      timestamp: string;
    }) => {
      console.error("[Stats] Error:", data);
      setError(data.error);
      setIsLoading(false);
    };

    // Escuchar notificaciones de nuevos pagos
    const handleNewPayment = (data?: {
      restaurantId: number;
      timestamp: string;
    }) => {
      console.log("[Stats] New payment detected, requesting update");

      // Mostrar toast de notificación
      toast.success("💰 Nueva transacción recibida", {
        duration: 3000,
        position: "top-right",
        style: {
          background: "#10B981",
          color: "#fff",
          fontWeight: "500",
        },
        icon: "🔔",
      });

      socket.emit("request:stats", filters);
    };

    socket.on("stats:updated", handleStatsUpdated);
    socket.on("stats:error", handleStatsError);
    socket.on("payment:new", handleNewPayment);

    // Cleanup
    return () => {
      socket.off("stats:updated", handleStatsUpdated);
      socket.off("stats:error", handleStatsError);
      socket.off("payment:new", handleNewPayment);
    };
  }, [socket, isConnected, filters]);

  // Función para refetch manual
  const refetch = () => {
    if (socket && isConnected) {
      setIsLoading(true);
      socket.emit("request:stats", filters);
    }
  };

  const returnValue = {
    data: stats,
    isLoading,
    error,
    refetch,
    isConnected,
  };

  console.log("[useRealtimeStats] Returning:", returnValue);

  return returnValue;
};

import { apiClient } from '../config/api';
import type {
  Restaurant,
  DashboardMetrics,
  Order,
  ApiResponse,
  PaginatedResponse,
  DashboardFilters,
  SuperAdminStats,
  SuperAdminFilters
} from '../types/api';

// Servicio para obtener todos los restaurantes (super admin view)
export const restaurantService = {
  // Obtener todos los restaurantes
  async getAll(): Promise<Restaurant[]> {
    const response = await apiClient.get<ApiResponse<Restaurant[]>>('/api/analytics/restaurants');
    return response.data.data || [];
  },

  // Obtener restaurante por ID
  async getById(id: number): Promise<Restaurant> {
    const response = await apiClient.get<ApiResponse<Restaurant>>(`/api/admin-portal/restaurant/${id}`);
    if (!response.data.data) {
      throw new Error('No restaurant data received from server');
    }
    return response.data.data;
  }
};

// Servicio para métricas del dashboard
export const analyticsService = {
  // Obtener métricas completas del dashboard
  async getDashboardMetrics(filters: DashboardFilters = {}): Promise<DashboardMetrics> {
    const params = new URLSearchParams();

    // Convertir filtros a query parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get<ApiResponse<DashboardMetrics>>(
      `/api/analytics/dashboard/complete?${params.toString()}`
    );

    if (!response.data.data) {
      throw new Error('No metrics data received from server');
    }
    return response.data.data;
  },

  // Obtener órdenes con paginación
  async getOrders(
    restaurantId?: number,
    limit = 20,
    offset = 0,
    status = 'todos',
    dateFilter = 'hoy'
  ): Promise<PaginatedResponse<Order>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      status,
      dateFilter
    });

    if (restaurantId) {
      params.append('restaurant_id', restaurantId.toString());
    }

    const endpoint = restaurantId
      ? `/api/analytics/dashboard/orders/${restaurantId}?${params.toString()}`
      : `/api/analytics/dashboard/orders?${params.toString()}`;

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Order>>>(endpoint);
    if (!response.data.data) {
      throw new Error('No orders data received from server');
    }
    return response.data.data;
  },

  // Obtener resumen del dashboard para un restaurante específico
  async getDashboardSummary(restaurantId: number) {
    const response = await apiClient.get(`/api/analytics/dashboard/summary/${restaurantId}`);
    return response.data;
  },

  // Obtener item más vendido
  async getTopSellingItem(filters: Pick<DashboardFilters, 'restaurant_id' | 'start_date' | 'end_date'> = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/api/analytics/dashboard/top-selling-item?${params.toString()}`);
    return response.data;
  }
};

// Servicio para autenticación y usuario
export const authService = {
  // Sincronizar usuario con el backend
  async syncUser() {
    const response = await apiClient.post('/api/admin-portal/auth/sync');
    return response.data;
  },

  // Obtener información del usuario actual
  async getCurrentUser() {
    const response = await apiClient.get('/api/admin-portal/auth/me');
    return response.data;
  }
};

// Servicio para estadísticas del super admin
export const superAdminService = {
  // Obtener todas las estadísticas del super admin
  async getStats(filters: SuperAdminFilters = {}): Promise<SuperAdminStats> {
    const params = new URLSearchParams();

    // Convertir filtros a query parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get<ApiResponse<SuperAdminStats>>(
      `/api/super-admin/stats?${params.toString()}`
    );

    if (!response.data.data) {
      throw new Error('No super admin stats data received from server');
    }
    return response.data.data;
  }
};

// Función helper para manejo de errores
export const handleApiError = (error: any) => {
  if (error.response) {
    // El servidor respondió con un código de error
    const message = error.response.data?.message || error.response.data?.error || 'Error del servidor';
    throw new Error(message);
  } else if (error.request) {
    // La petición fue hecha pero no se recibió respuesta
    throw new Error('No se pudo conectar con el servidor');
  } else {
    // Algo más sucedió
    throw new Error(error.message || 'Error desconocido');
  }
};
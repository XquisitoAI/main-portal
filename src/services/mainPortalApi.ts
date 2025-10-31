import { apiClient } from '../config/api';
import type {
  Client,
  Branch,
  ClientFormData,
  BranchFormData,
  ApiResponse
} from '../types';

// ===============================================
// SERVICIOS PARA CLIENTES
// ===============================================

// Función para convertir datos del backend a formato frontend
const convertClientFromBackend = (backendClient: any): Client => ({
  id: backendClient.id,
  name: backendClient.name,
  ownerName: backendClient.owner_name,
  phone: backendClient.phone,
  email: backendClient.email,
  services: backendClient.services,
  active: backendClient.active,
  createdAt: backendClient.created_at,
  updatedAt: backendClient.updated_at
});

// Función para convertir datos del frontend a formato backend
const convertClientToBackend = (frontendClient: ClientFormData | Partial<ClientFormData>) => ({
  name: frontendClient.name,
  owner_name: frontendClient.ownerName,
  phone: frontendClient.phone,
  email: frontendClient.email,
  services: frontendClient.services,
  active: frontendClient.active
});

// Función para convertir sucursales del backend a formato frontend
const convertBranchFromBackend = (backendBranch: any): Branch => ({
  id: backendBranch.id,
  clientId: backendBranch.client_id,
  name: backendBranch.name,
  address: backendBranch.address,
  tables: backendBranch.tables,
  active: backendBranch.active,
  createdAt: backendBranch.created_at,
  updatedAt: backendBranch.updated_at
});

// Función para convertir sucursales del frontend a formato backend
const convertBranchToBackend = (frontendBranch: BranchFormData | Partial<BranchFormData>) => ({
  client_id: frontendBranch.clientId,
  name: frontendBranch.name,
  address: frontendBranch.address,
  tables: frontendBranch.tables,
  active: frontendBranch.active
});

export const clientService = {
  // Obtener todos los clientes
  async getAll(): Promise<Client[]> {
    const response = await apiClient.get<ApiResponse<any[]>>('/api/main-portal/clients');
    const backendClients = response.data.data || [];
    return backendClients.map(convertClientFromBackend);
  },

  // Obtener cliente por ID
  async getById(id: string): Promise<Client> {
    const response = await apiClient.get<ApiResponse<any>>(`/api/main-portal/clients/${id}`);
    if (!response.data.data) {
      throw new Error('Cliente no encontrado');
    }
    return convertClientFromBackend(response.data.data);
  },

  // Crear nuevo cliente
  async create(clientData: ClientFormData): Promise<Client> {
    const backendData = convertClientToBackend(clientData);
    console.log(backendData)
    const response = await apiClient.post<ApiResponse<any>>('/api/main-portal/clients', backendData);
    console.log(response);
    
    if (!response.data.data) {
      throw new Error('Error al crear el cliente');
    }
    return convertClientFromBackend(response.data.data);
  },

  // Actualizar cliente
  async update(id: string, clientData: Partial<ClientFormData>): Promise<Client> {
    const backendData = convertClientToBackend(clientData);
    const response = await apiClient.put<ApiResponse<any>>(`/api/main-portal/clients/${id}`, backendData);
    if (!response.data.data) {
      throw new Error('Error al actualizar el cliente');
    }
    return convertClientFromBackend(response.data.data);
  },

  // Eliminar cliente
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/main-portal/clients/${id}`);
  }
};

// ===============================================
// SERVICIOS PARA SUCURSALES
// ===============================================

export const branchService = {
  // Obtener todas las sucursales
  async getAll(): Promise<Branch[]> {
    const response = await apiClient.get<ApiResponse<any[]>>('/api/main-portal/branches');
    const backendBranches = response.data.data || [];
    return backendBranches.map(convertBranchFromBackend);
  },

  // Obtener sucursales por cliente
  async getByClient(clientId: string): Promise<Branch[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(`/api/main-portal/branches?client_id=${clientId}`);
    const backendBranches = response.data.data || [];
    return backendBranches.map(convertBranchFromBackend);
  },

  // Obtener sucursal por ID
  async getById(id: string): Promise<Branch> {
    const response = await apiClient.get<ApiResponse<any>>(`/api/main-portal/branches/${id}`);
    if (!response.data.data) {
      throw new Error('Sucursal no encontrada');
    }
    return convertBranchFromBackend(response.data.data);
  },

  // Crear nueva sucursal
  async create(branchData: BranchFormData): Promise<Branch> {
    const backendData = convertBranchToBackend(branchData);
    const response = await apiClient.post<ApiResponse<any>>('/api/main-portal/branches', backendData);
    if (!response.data.data) {
      throw new Error('Error al crear la sucursal');
    }
    return convertBranchFromBackend(response.data.data);
  },

  // Actualizar sucursal
  async update(id: string, branchData: Partial<BranchFormData>): Promise<Branch> {
    const backendData = convertBranchToBackend(branchData);
    const response = await apiClient.put<ApiResponse<any>>(`/api/main-portal/branches/${id}`, backendData);
    if (!response.data.data) {
      throw new Error('Error al actualizar la sucursal');
    }
    return convertBranchFromBackend(response.data.data);
  },

  // Eliminar sucursal
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/main-portal/branches/${id}`);
  }
};

// ===============================================
// SERVICIOS DE ESTADÍSTICAS
// ===============================================

export interface MainPortalStats {
  clients: {
    total: number;
    active: number;
    inactive: number;
  };
  branches: {
    total: number;
    active: number;
    inactive: number;
  };
  tables: {
    total: number;
  };
}

export const statsService = {
  // Obtener estadísticas generales
  async getMainPortalStats(): Promise<MainPortalStats> {
    const response = await apiClient.get<ApiResponse<MainPortalStats>>('/api/main-portal/stats');
    if (!response.data.data) {
      throw new Error('Error al obtener estadísticas');
    }
    return response.data.data;
  }
};

// ===============================================
// FUNCIÓN HELPER PARA MANEJO DE ERRORES
// ===============================================

export const handleMainPortalApiError = (error: any) => {
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

// ===============================================
// EXPORTACIÓN POR DEFECTO
// ===============================================

const mainPortalApi = {
  clients: clientService,
  branches: branchService,
  stats: statsService,
  handleError: handleMainPortalApiError
};

export default mainPortalApi;
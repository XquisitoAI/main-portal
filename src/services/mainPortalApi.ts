import { useAuth } from '@clerk/nextjs';
import type {
  Client,
  Branch,
  ClientFormData,
  ClientFormDataWithInvitation,
  BranchFormData,
  ApiResponse
} from '../types';

// ===============================================
// CONFIGURACIÓN DE LA API
// ===============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
const MAIN_PORTAL_BASE = `${API_BASE_URL}/api/main-portal`;

// ===============================================
// FUNCIONES DE CONVERSIÓN DE DATOS
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
const convertClientToBackend = (frontendClient: ClientFormDataWithInvitation | ClientFormData | Partial<ClientFormData>) => ({
  name: frontendClient.name,
  owner_name: frontendClient.ownerName,
  phone: frontendClient.phone,
  email: frontendClient.email,
  services: frontendClient.services,
  active: frontendClient.active,
  // Solo incluir sendInvitation si está presente
  ...(('sendInvitation' in frontendClient) && { sendInvitation: frontendClient.sendInvitation })
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

// ===============================================
// ESTADÍSTICAS
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

// ===============================================
// CLASE PRINCIPAL DEL SERVICIO API
// ===============================================

class MainPortalApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<T> {
    try {
      const url = `${MAIN_PORTAL_BASE}${endpoint}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }

      return data.data;
    } catch (error) {
      console.error(`Main Portal API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // ===============================================
  // MÉTODOS DE CLIENTES
  // ===============================================

  async getAllClients(token: string): Promise<Client[]> {
    const backendClients = await this.makeRequest<any[]>('/clients', {
      method: 'GET',
    }, token);
    return (backendClients || []).map(convertClientFromBackend);
  }

  async getClientById(id: string, token: string): Promise<Client> {
    const backendClient = await this.makeRequest<any>(`/clients/${id}`, {
      method: 'GET',
    }, token);
    return convertClientFromBackend(backendClient);
  }

  async createClient(clientData: ClientFormDataWithInvitation, token: string): Promise<Client> {
    const backendData = convertClientToBackend(clientData);
    const backendClient = await this.makeRequest<any>('/clients', {
      method: 'POST',
      body: JSON.stringify(backendData),
    }, token);
    return convertClientFromBackend(backendClient);
  }

  async updateClient(id: string, clientData: Partial<ClientFormData>, token: string): Promise<Client> {
    const backendData = convertClientToBackend(clientData);
    const backendClient = await this.makeRequest<any>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    }, token);
    return convertClientFromBackend(backendClient);
  }

  async deleteClient(id: string, token: string): Promise<void> {
    await this.makeRequest<void>(`/clients/${id}`, {
      method: 'DELETE',
    }, token);
  }

  // ===============================================
  // MÉTODOS DE SUCURSALES
  // ===============================================

  async getAllBranches(token: string): Promise<Branch[]> {
    const backendBranches = await this.makeRequest<any[]>('/branches', {
      method: 'GET',
    }, token);
    return (backendBranches || []).map(convertBranchFromBackend);
  }

  async getBranchesByClient(clientId: string, token: string): Promise<Branch[]> {
    const backendBranches = await this.makeRequest<any[]>(`/branches?client_id=${clientId}`, {
      method: 'GET',
    }, token);
    return (backendBranches || []).map(convertBranchFromBackend);
  }

  async getBranchById(id: string, token: string): Promise<Branch> {
    const backendBranch = await this.makeRequest<any>(`/branches/${id}`, {
      method: 'GET',
    }, token);
    return convertBranchFromBackend(backendBranch);
  }

  async createBranch(branchData: BranchFormData, token: string): Promise<Branch> {
    const backendData = convertBranchToBackend(branchData);
    const backendBranch = await this.makeRequest<any>('/branches', {
      method: 'POST',
      body: JSON.stringify(backendData),
    }, token);
    return convertBranchFromBackend(backendBranch);
  }

  async updateBranch(id: string, branchData: Partial<BranchFormData>, token: string): Promise<Branch> {
    const backendData = convertBranchToBackend(branchData);
    const backendBranch = await this.makeRequest<any>(`/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    }, token);
    return convertBranchFromBackend(backendBranch);
  }

  async deleteBranch(id: string, token: string): Promise<void> {
    await this.makeRequest<void>(`/branches/${id}`, {
      method: 'DELETE',
    }, token);
  }

  // ===============================================
  // MÉTODOS DE ESTADÍSTICAS
  // ===============================================

  async getMainPortalStats(token: string): Promise<MainPortalStats> {
    return this.makeRequest<MainPortalStats>('/stats', {
      method: 'GET',
    }, token);
  }

  async getInvitationStatuses(token: string): Promise<Record<string, any>> {
    return this.makeRequest<Record<string, any>>('/invitations/status', {
      method: 'GET',
    }, token);
  }
}

// ===============================================
// HOOK PERSONALIZADO PARA USAR LA API
// ===============================================

export function useMainPortalApi() {
  const { getToken } = useAuth();

  const makeAuthenticatedRequest = async <T>(
    requestFn: (token: string) => Promise<T>
  ): Promise<T> => {
    try {
      const token = await getToken();

      if (!token) {
        throw new Error('User not authenticated');
      }

      return await requestFn(token);
    } catch (error) {
      console.error('Authenticated request failed:', error);
      throw error;
    }
  };

  return {
    // Métodos de clientes
    getAllClients: () => makeAuthenticatedRequest(
      (token) => mainPortalApiService.getAllClients(token)
    ),
    getClientById: (id: string) => makeAuthenticatedRequest(
      (token) => mainPortalApiService.getClientById(id, token)
    ),
    createClient: (data: ClientFormDataWithInvitation) => makeAuthenticatedRequest(
      (token) => mainPortalApiService.createClient(data, token)
    ),
    updateClient: (id: string, data: Partial<ClientFormData>) => makeAuthenticatedRequest(
      (token) => mainPortalApiService.updateClient(id, data, token)
    ),
    deleteClient: (id: string) => makeAuthenticatedRequest(
      (token) => mainPortalApiService.deleteClient(id, token)
    ),

    // Métodos de sucursales
    getAllBranches: () => makeAuthenticatedRequest(
      (token) => mainPortalApiService.getAllBranches(token)
    ),
    getBranchesByClient: (clientId: string) => makeAuthenticatedRequest(
      (token) => mainPortalApiService.getBranchesByClient(clientId, token)
    ),
    getBranchById: (id: string) => makeAuthenticatedRequest(
      (token) => mainPortalApiService.getBranchById(id, token)
    ),
    createBranch: (data: BranchFormData) => makeAuthenticatedRequest(
      (token) => mainPortalApiService.createBranch(data, token)
    ),
    updateBranch: (id: string, data: Partial<BranchFormData>) => makeAuthenticatedRequest(
      (token) => mainPortalApiService.updateBranch(id, data, token)
    ),
    deleteBranch: (id: string) => makeAuthenticatedRequest(
      (token) => mainPortalApiService.deleteBranch(id, token)
    ),

    getMainPortalStats: () => makeAuthenticatedRequest(
      (token) => mainPortalApiService.getMainPortalStats(token)
    ),
    getInvitationStatuses: () => makeAuthenticatedRequest(
      (token) => mainPortalApiService.getInvitationStatuses(token)
    )
  };
}

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
// INSTANCIA EXPORTADA DEL SERVICIO
// ===============================================

export const mainPortalApiService = new MainPortalApiService();

// ===============================================
// EXPORTACIÓN LEGACY PARA COMPATIBILIDAD
// ===============================================

const mainPortalApi = {
  clients: {
    getAll: () => { throw new Error('Use useMainPortalApi hook instead'); },
    getById: () => { throw new Error('Use useMainPortalApi hook instead'); },
    create: () => { throw new Error('Use useMainPortalApi hook instead'); },
    update: () => { throw new Error('Use useMainPortalApi hook instead'); },
    delete: () => { throw new Error('Use useMainPortalApi hook instead'); }
  },
  branches: {
    getAll: () => { throw new Error('Use useMainPortalApi hook instead'); },
    getByClient: () => { throw new Error('Use useMainPortalApi hook instead'); },
    getById: () => { throw new Error('Use useMainPortalApi hook instead'); },
    create: () => { throw new Error('Use useMainPortalApi hook instead'); },
    update: () => { throw new Error('Use useMainPortalApi hook instead'); },
    delete: () => { throw new Error('Use useMainPortalApi hook instead'); }
  },
  stats: {
    getMainPortalStats: () => { throw new Error('Use useMainPortalApi hook instead'); }
  },
  handleError: handleMainPortalApiError
};

export default mainPortalApi;
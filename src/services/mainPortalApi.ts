import { useAuth } from "@clerk/nextjs";
import type {
  Client,
  Branch,
  QrCode,
  ClientFormData,
  ClientFormDataWithInvitation,
  BranchFormData,
  QrCodeFormData,
  QrCodeBatchFormData,
  QrCodeUpdateData,
} from "../types";

// ===============================================
// CONFIGURACIÓN DE LA API
// ===============================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
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
  tableCount: backendClient.table_count || 0,
  roomCount: backendClient.room_count || 0,
  active: backendClient.active,
  createdAt: backendClient.created_at,
  updatedAt: backendClient.updated_at,
});

// Función para convertir datos del frontend a formato backend
const convertClientToBackend = (
  frontendClient:
    | ClientFormDataWithInvitation
    | ClientFormData
    | Partial<ClientFormData>
) => ({
  name: frontendClient.name,
  owner_name: frontendClient.ownerName,
  phone: frontendClient.phone,
  email: frontendClient.email,
  services: frontendClient.services,
  table_count: frontendClient.tableCount || 0,
  room_count: frontendClient.roomCount || 0,
  active: frontendClient.active,
  // Solo incluir sendInvitation si está presente
  ...("sendInvitation" in frontendClient && {
    sendInvitation: frontendClient.sendInvitation,
  }),
});

// Función para convertir sucursales del backend a formato frontend
const convertBranchFromBackend = (backendBranch: any): Branch => ({
  id: backendBranch.id,
  clientId: backendBranch.client_id,
  restaurantId: backendBranch.restaurant_id,
  name: backendBranch.name,
  address: backendBranch.address,
  tables: backendBranch.tables,
  rooms: backendBranch.rooms,
  roomRanges: backendBranch.room_ranges,
  branchNumber: backendBranch.branch_number,
  active: backendBranch.active,
  createdAt: backendBranch.created_at,
  updatedAt: backendBranch.updated_at,
});

// Función para convertir sucursales del frontend a formato backend
const convertBranchToBackend = (
  frontendBranch: BranchFormData | Partial<BranchFormData>
) => ({
  client_id: frontendBranch.clientId,
  name: frontendBranch.name,
  address: frontendBranch.address,
  tables: frontendBranch.tables,
  rooms: frontendBranch.rooms,
  room_ranges: frontendBranch.roomRanges,
  active: frontendBranch.active,
});

// Función para convertir QR codes del backend a formato frontend
const convertQrCodeFromBackend = (backendQrCode: any): QrCode => ({
  id: backendQrCode.id,
  code: backendQrCode.code,
  clientId: backendQrCode.client_id,
  restaurantId: backendQrCode.restaurant_id,
  branchId: backendQrCode.branch_id,
  branchNumber: backendQrCode.branch_number,
  service: backendQrCode.service,
  qrType: backendQrCode.qr_type,
  tableNumber: backendQrCode.table_number,
  roomNumber: backendQrCode.room_number,
  isActive: backendQrCode.is_active,
  createdAt: backendQrCode.created_at,
  updatedAt: backendQrCode.updated_at,
  clients: backendQrCode.clients,
  restaurants: backendQrCode.restaurants,
  branches: backendQrCode.branches,
});

// Función para convertir QR codes del frontend a formato backend
const convertQrCodeToBackend = (
  frontendQrCode: QrCodeFormData | QrCodeBatchFormData | QrCodeUpdateData
) => {
  const backendData: any = {};

  if ('clientId' in frontendQrCode && frontendQrCode.clientId !== undefined)
    backendData.client_id = frontendQrCode.clientId;
  if ('restaurantId' in frontendQrCode && frontendQrCode.restaurantId !== undefined)
    backendData.restaurant_id = frontendQrCode.restaurantId;
  if ('branchId' in frontendQrCode && frontendQrCode.branchId !== undefined)
    backendData.branch_id = frontendQrCode.branchId;
  if ('branchNumber' in frontendQrCode && frontendQrCode.branchNumber !== undefined)
    backendData.branch_number = frontendQrCode.branchNumber;
  if ('service' in frontendQrCode && frontendQrCode.service !== undefined)
    backendData.service = frontendQrCode.service;
  if ('qrType' in frontendQrCode && frontendQrCode.qrType !== undefined)
    backendData.qr_type = frontendQrCode.qrType;
  if ('tableNumber' in frontendQrCode && frontendQrCode.tableNumber !== undefined)
    backendData.table_number = frontendQrCode.tableNumber;
  if ('roomNumber' in frontendQrCode && frontendQrCode.roomNumber !== undefined)
    backendData.room_number = frontendQrCode.roomNumber;
  if ('count' in frontendQrCode && frontendQrCode.count !== undefined)
    backendData.count = frontendQrCode.count;
  if ('startNumber' in frontendQrCode && frontendQrCode.startNumber !== undefined)
    backendData.start_number = frontendQrCode.startNumber;
  if ('isActive' in frontendQrCode && frontendQrCode.isActive !== undefined)
    backendData.is_active = frontendQrCode.isActive;

  return backendData;
};

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
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) || {}),
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "API request failed");
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
    const backendClients = await this.makeRequest<any[]>(
      "/clients",
      {
        method: "GET",
      },
      token
    );
    return (backendClients || []).map(convertClientFromBackend);
  }

  async getClientById(id: string, token: string): Promise<Client> {
    const backendClient = await this.makeRequest<any>(
      `/clients/${id}`,
      {
        method: "GET",
      },
      token
    );
    return convertClientFromBackend(backendClient);
  }

  async createClient(
    clientData: ClientFormDataWithInvitation,
    token: string
  ): Promise<Client> {
    const backendData = convertClientToBackend(clientData);
    const backendClient = await this.makeRequest<any>(
      "/clients",
      {
        method: "POST",
        body: JSON.stringify(backendData),
      },
      token
    );
    return convertClientFromBackend(backendClient);
  }

  async updateClient(
    id: string,
    clientData: Partial<ClientFormData>,
    token: string
  ): Promise<Client> {
    const backendData = convertClientToBackend(clientData);
    const backendClient = await this.makeRequest<any>(
      `/clients/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(backendData),
      },
      token
    );
    return convertClientFromBackend(backendClient);
  }

  async deleteClient(id: string, token: string): Promise<void> {
    await this.makeRequest<void>(
      `/clients/${id}`,
      {
        method: "DELETE",
      },
      token
    );
  }

  async checkClientAdminPortalStatus(email: string, token: string): Promise<{
    hasAdminPortalAccount: boolean;
    clerkUserId?: string;
    adminUserEmail?: string;
    adminUserName?: string;
  }> {
    return await this.makeRequest(
      `/clients/${encodeURIComponent(email)}/admin-portal-status`,
      {
        method: "GET",
      },
      token
    );
  }

  // ===============================================
  // MÉTODOS DE SUCURSALES
  // ===============================================

  async getAllBranches(token: string): Promise<Branch[]> {
    const backendBranches = await this.makeRequest<any[]>(
      "/branches",
      {
        method: "GET",
      },
      token
    );
    return (backendBranches || []).map(convertBranchFromBackend);
  }

  async getBranchesByClient(
    clientId: string,
    token: string
  ): Promise<Branch[]> {
    const backendBranches = await this.makeRequest<any[]>(
      `/branches?client_id=${clientId}`,
      {
        method: "GET",
      },
      token
    );
    return (backendBranches || []).map(convertBranchFromBackend);
  }

  async getBranchById(id: string, token: string): Promise<Branch> {
    const backendBranch = await this.makeRequest<any>(
      `/branches/${id}`,
      {
        method: "GET",
      },
      token
    );
    return convertBranchFromBackend(backendBranch);
  }

  async createBranch(
    branchData: BranchFormData,
    token: string
  ): Promise<Branch> {
    const backendData = convertBranchToBackend(branchData);
    const backendBranch = await this.makeRequest<any>(
      "/branches",
      {
        method: "POST",
        body: JSON.stringify(backendData),
      },
      token
    );
    return convertBranchFromBackend(backendBranch);
  }

  async updateBranch(
    id: string,
    branchData: Partial<BranchFormData>,
    token: string
  ): Promise<Branch> {
    const backendData = convertBranchToBackend(branchData);
    const backendBranch = await this.makeRequest<any>(
      `/branches/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(backendData),
      },
      token
    );
    return convertBranchFromBackend(backendBranch);
  }

  async deleteBranch(id: string, token: string): Promise<void> {
    await this.makeRequest<void>(
      `/branches/${id}`,
      {
        method: "DELETE",
      },
      token
    );
  }

  // ===============================================
  // MÉTODOS DE ESTADÍSTICAS
  // ===============================================

  async getMainPortalStats(token: string): Promise<MainPortalStats> {
    return this.makeRequest<MainPortalStats>(
      "/stats",
      {
        method: "GET",
      },
      token
    );
  }

  async getInvitationStatuses(token: string): Promise<Record<string, any>> {
    return this.makeRequest<Record<string, any>>(
      "/invitations/status",
      {
        method: "GET",
      },
      token
    );
  }

  // ===============================================
  // MÉTODOS DE QR CODES
  // ===============================================

  async getAllQRCodes(
    token: string,
    filters?: {
      clientId?: string;
      restaurantId?: number;
      branchId?: string;
      service?: string;
      isActive?: boolean;
    }
  ): Promise<QrCode[]> {
    let endpoint = "/qr-codes";

    if (filters) {
      const params = new URLSearchParams();
      if (filters.clientId) params.append("client_id", filters.clientId);
      if (filters.restaurantId) params.append("restaurant_id", filters.restaurantId.toString());
      if (filters.branchId) params.append("branch_id", filters.branchId);
      if (filters.service) params.append("service", filters.service);
      if (filters.isActive !== undefined) params.append("is_active", filters.isActive.toString());

      const queryString = params.toString();
      if (queryString) endpoint += `?${queryString}`;
    }

    const backendQrCodes = await this.makeRequest<any[]>(
      endpoint,
      {
        method: "GET",
      },
      token
    );
    return (backendQrCodes || []).map(convertQrCodeFromBackend);
  }

  async getQRCodeById(id: string, token: string): Promise<QrCode> {
    const backendQrCode = await this.makeRequest<any>(
      `/qr-codes/${id}`,
      {
        method: "GET",
      },
      token
    );
    return convertQrCodeFromBackend(backendQrCode);
  }

  async createQRCode(
    qrCodeData: QrCodeFormData,
    token: string
  ): Promise<QrCode> {
    const backendData = convertQrCodeToBackend(qrCodeData);
    const backendQrCode = await this.makeRequest<any>(
      "/qr-codes",
      {
        method: "POST",
        body: JSON.stringify(backendData),
      },
      token
    );
    return convertQrCodeFromBackend(backendQrCode);
  }

  async createBatchQRCodes(
    batchData: QrCodeBatchFormData,
    token: string
  ): Promise<QrCode[]> {
    const backendData = convertQrCodeToBackend(batchData);
    const backendQrCodes = await this.makeRequest<any[]>(
      "/qr-codes/batch",
      {
        method: "POST",
        body: JSON.stringify(backendData),
      },
      token
    );
    return (backendQrCodes || []).map(convertQrCodeFromBackend);
  }

  async updateQRCode(
    id: string,
    updateData: QrCodeUpdateData,
    token: string
  ): Promise<QrCode> {
    const backendData = convertQrCodeToBackend(updateData);
    const backendQrCode = await this.makeRequest<any>(
      `/qr-codes/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(backendData),
      },
      token
    );
    return convertQrCodeFromBackend(backendQrCode);
  }

  async toggleQRCodeStatus(id: string, token: string): Promise<QrCode> {
    const backendQrCode = await this.makeRequest<any>(
      `/qr-codes/${id}/toggle`,
      {
        method: "PATCH",
      },
      token
    );
    return convertQrCodeFromBackend(backendQrCode);
  }

  async deleteQRCode(id: string, token: string): Promise<void> {
    await this.makeRequest<void>(
      `/qr-codes/${id}`,
      {
        method: "DELETE",
      },
      token
    );
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
      // Obtener token fresco, forzando refresh si es necesario
      const token = await getToken({ skipCache: true });

      if (!token) {
        throw new Error("User not authenticated");
      }

      return await requestFn(token);
    } catch (error: any) {
      // Si el error es por token expirado, intentar una vez más con token fresco
      if (
        error?.message?.includes("expired") ||
        error?.message?.includes("401")
      ) {
        console.log("Token expired, refreshing and retrying...");
        try {
          const freshToken = await getToken({ skipCache: true });
          if (!freshToken) {
            throw new Error("User not authenticated");
          }
          return await requestFn(freshToken);
        } catch (retryError) {
          console.error("Retry after token refresh failed:", retryError);
          throw retryError;
        }
      }

      console.error("Authenticated request failed:", error);
      throw error;
    }
  };

  return {
    // Métodos de clientes
    getAllClients: () =>
      makeAuthenticatedRequest((token) =>
        mainPortalApiService.getAllClients(token)
      ),
    getClientById: (id: string) =>
      makeAuthenticatedRequest((token) =>
        mainPortalApiService.getClientById(id, token)
      ),
    createClient: (data: ClientFormDataWithInvitation) =>
      makeAuthenticatedRequest((token) =>
        mainPortalApiService.createClient(data, token)
      ),
    updateClient: (id: string, data: Partial<ClientFormData>) =>
      makeAuthenticatedRequest((token) =>
        mainPortalApiService.updateClient(id, data, token)
      ),
    deleteClient: (id: string) =>
      makeAuthenticatedRequest((token) =>
        mainPortalApiService.deleteClient(id, token)
      ),
    checkClientAdminPortalStatus: (email: string) =>
      makeAuthenticatedRequest((token) =>
        mainPortalApiService.checkClientAdminPortalStatus(email, token)
      ),

    // Métodos de sucursales
    getAllBranches: () =>
      makeAuthenticatedRequest((token) =>
        mainPortalApiService.getAllBranches(token)
      ),
    getBranchesByClient: (clientId: string) =>
      makeAuthenticatedRequest((token) =>
        mainPortalApiService.getBranchesByClient(clientId, token)
      ),
    getBranchById: (id: string) =>
      makeAuthenticatedRequest((token) =>
        mainPortalApiService.getBranchById(id, token)
      ),
    createBranch: (data: BranchFormData) =>
      makeAuthenticatedRequest((token) =>
        mainPortalApiService.createBranch(data, token)
      ),
    updateBranch: (id: string, data: Partial<BranchFormData>) =>
      makeAuthenticatedRequest((token) =>
        mainPortalApiService.updateBranch(id, data, token)
      ),
    deleteBranch: (id: string) =>
      makeAuthenticatedRequest((token) =>
        mainPortalApiService.deleteBranch(id, token)
      ),

    // Métodos de estadísticas
    getMainPortalStats: () =>
      makeAuthenticatedRequest((token) =>
        mainPortalApiService.getMainPortalStats(token)
      ),
    getInvitationStatuses: () =>
      makeAuthenticatedRequest((token) =>
        mainPortalApiService.getInvitationStatuses(token)
      ),

    // Métodos de QR Codes
    getAllQRCodes: (filters?: {
      clientId?: string;
      restaurantId?: number;
      branchId?: string;
      service?: string;
      isActive?: boolean;
    }) =>
      makeAuthenticatedRequest((token) =>
        mainPortalApiService.getAllQRCodes(token, filters)
      ),
    getQRCodeById: (id: string) =>
      makeAuthenticatedRequest((token) =>
        mainPortalApiService.getQRCodeById(id, token)
      ),
    createQRCode: (data: QrCodeFormData) =>
      makeAuthenticatedRequest((token) =>
        mainPortalApiService.createQRCode(data, token)
      ),
    createBatchQRCodes: (data: QrCodeBatchFormData) =>
      makeAuthenticatedRequest((token) =>
        mainPortalApiService.createBatchQRCodes(data, token)
      ),
    updateQRCode: (id: string, data: QrCodeUpdateData) =>
      makeAuthenticatedRequest((token) =>
        mainPortalApiService.updateQRCode(id, data, token)
      ),
    toggleQRCodeStatus: (id: string) =>
      makeAuthenticatedRequest((token) =>
        mainPortalApiService.toggleQRCodeStatus(id, token)
      ),
    deleteQRCode: (id: string) =>
      makeAuthenticatedRequest((token) =>
        mainPortalApiService.deleteQRCode(id, token)
      ),
  };
}

// ===============================================
// FUNCIÓN HELPER PARA MANEJO DE ERRORES
// ===============================================

export const handleMainPortalApiError = (error: any) => {
  if (error.response) {
    // El servidor respondió con un código de error
    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      "Error del servidor";
    throw new Error(message);
  } else if (error.request) {
    // La petición fue hecha pero no se recibió respuesta
    throw new Error("No se pudo conectar con el servidor");
  } else {
    // Algo más sucedió
    throw new Error(error.message || "Error desconocido");
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
    getAll: () => {
      throw new Error("Use useMainPortalApi hook instead");
    },
    getById: () => {
      throw new Error("Use useMainPortalApi hook instead");
    },
    create: () => {
      throw new Error("Use useMainPortalApi hook instead");
    },
    update: () => {
      throw new Error("Use useMainPortalApi hook instead");
    },
    delete: () => {
      throw new Error("Use useMainPortalApi hook instead");
    },
  },
  branches: {
    getAll: () => {
      throw new Error("Use useMainPortalApi hook instead");
    },
    getByClient: () => {
      throw new Error("Use useMainPortalApi hook instead");
    },
    getById: () => {
      throw new Error("Use useMainPortalApi hook instead");
    },
    create: () => {
      throw new Error("Use useMainPortalApi hook instead");
    },
    update: () => {
      throw new Error("Use useMainPortalApi hook instead");
    },
    delete: () => {
      throw new Error("Use useMainPortalApi hook instead");
    },
  },
  stats: {
    getMainPortalStats: () => {
      throw new Error("Use useMainPortalApi hook instead");
    },
  },
  handleError: handleMainPortalApiError,
};

export default mainPortalApi;

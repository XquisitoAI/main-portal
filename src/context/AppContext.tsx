import React, { useState, createContext, useContext, useEffect } from "react";
import {
  Client,
  Branch,
  QrCode,
  ClientFormData,
  ClientFormDataWithInvitation,
  BranchFormData,
  LoadingState,
  QrCodeBatchFormData,
  QrCodeUpdateData,
} from "../types";
import { useMainPortalApi } from "../services/mainPortalApi";
import { useAuth } from "@clerk/nextjs";
interface AppContextType {
  selectedClient: string | null;
  selectedBranch: string | null;
  clients: Client[];
  branches: Branch[];
  qrCodes: QrCode[];
  loading: LoadingState;
  error: string | null;
  setSelectedClient: (id: string | null) => void;
  setSelectedBranch: (id: string | null) => void;
  loadClients: () => Promise<void>;
  loadBranches: () => Promise<void>;
  loadQrCodes: (filters?: {
    clientId?: string;
    branchId?: string;
  }) => Promise<void>;
  addClient: (client: ClientFormDataWithInvitation) => Promise<void>;
  updateClient: (id: string, client: Partial<ClientFormData>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addBranch: (branch: BranchFormData) => Promise<void>;
  updateBranch: (id: string, branch: Partial<BranchFormData>) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;
  createBatchQrCodes: (data: QrCodeBatchFormData) => Promise<void>;
  updateQrCode: (id: string, data: QrCodeUpdateData) => Promise<void>;
  deleteQrCode: (id: string) => Promise<void>;
  toggleQrCodeStatus: (id: string) => Promise<void>;
  clearError: () => void;
}
const AppContext = createContext<AppContextType | undefined>(undefined);
export const AppContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    isSaving: false,
    isDeleting: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Use the new authenticated API hook
  const mainPortalApi = useMainPortalApi();
  const { isSignedIn, isLoaded } = useAuth();

  // Función utilitaria para manejar errores
  const handleError = (error: any) => {
    console.error("API Error:", error);
    setError(error.message || "Ha ocurrido un error inesperado");
  };

  // Limpiar errores
  const clearError = () => {
    setError(null);
  };

  // Cargar clientes desde la API
  const loadClients = async () => {
    try {
      setLoading((prev) => ({ ...prev, isLoading: true }));
      clearError();
      const data = await mainPortalApi.getAllClients();
      setClients(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Cargar sucursales desde la API
  const loadBranches = async () => {
    try {
      setLoading((prev) => ({ ...prev, isLoading: true }));
      clearError();
      const data = await mainPortalApi.getAllBranches();
      setBranches(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Efecto para cargar datos iniciales - esperar a que Clerk esté listo y autenticado
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadClients();
      loadBranches();
    }
  }, [isLoaded, isSignedIn]);

  const addClient = async (client: ClientFormDataWithInvitation) => {
    try {
      setLoading((prev) => ({ ...prev, isSaving: true }));
      clearError();
      const newClient = await mainPortalApi.createClient(client);
      setClients((prev) => [...prev, newClient]);
    } catch (error) {
      handleError(error);
      throw error; // Re-throw para que el componente pueda manejar el error
    } finally {
      setLoading((prev) => ({ ...prev, isSaving: false }));
    }
  };

  const updateClient = async (
    id: string,
    clientData: Partial<ClientFormData>
  ) => {
    try {
      setLoading((prev) => ({ ...prev, isSaving: true }));
      clearError();
      const updatedClient = await mainPortalApi.updateClient(id, clientData);
      setClients((prev) =>
        prev.map((client) => (client.id === id ? updatedClient : client))
      );
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading((prev) => ({ ...prev, isSaving: false }));
    }
  };

  const deleteClient = async (id: string) => {
    try {
      setLoading((prev) => ({ ...prev, isDeleting: true }));
      clearError();
      await mainPortalApi.deleteClient(id);
      setClients((prev) => prev.filter((client) => client.id !== id));
      setBranches((prev) => prev.filter((branch) => branch.clientId !== id));
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const addBranch = async (branch: BranchFormData) => {
    try {
      setLoading((prev) => ({ ...prev, isSaving: true }));
      clearError();
      const newBranch = await mainPortalApi.createBranch(branch);
      setBranches((prev) => [...prev, newBranch]);
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading((prev) => ({ ...prev, isSaving: false }));
    }
  };

  const updateBranch = async (
    id: string,
    branchData: Partial<BranchFormData>
  ) => {
    try {
      setLoading((prev) => ({ ...prev, isSaving: true }));
      clearError();
      const updatedBranch = await mainPortalApi.updateBranch(id, branchData);
      setBranches((prev) =>
        prev.map((branch) => (branch.id === id ? updatedBranch : branch))
      );
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading((prev) => ({ ...prev, isSaving: false }));
    }
  };

  const deleteBranch = async (id: string) => {
    try {
      setLoading((prev) => ({ ...prev, isDeleting: true }));
      clearError();
      await mainPortalApi.deleteBranch(id);
      setBranches((prev) => prev.filter((branch) => branch.id !== id));
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // Cargar códigos QR desde la API
  const loadQrCodes = async (filters?: {
    clientId?: string;
    branchId?: string;
  }) => {
    try {
      setLoading((prev) => ({ ...prev, isLoading: true }));
      clearError();
      const data = await mainPortalApi.getAllQRCodes(filters);
      setQrCodes(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Crear múltiples códigos QR en lote
  const createBatchQrCodes = async (data: QrCodeBatchFormData) => {
    try {
      setLoading((prev) => ({ ...prev, isSaving: true }));
      clearError();
      const newQrCodes = await mainPortalApi.createBatchQRCodes(data);
      setQrCodes((prev) => [...prev, ...newQrCodes]);
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading((prev) => ({ ...prev, isSaving: false }));
    }
  };

  // Actualizar código QR
  const updateQrCode = async (id: string, data: QrCodeUpdateData) => {
    try {
      setLoading((prev) => ({ ...prev, isSaving: true }));
      clearError();
      const updatedQrCode = await mainPortalApi.updateQRCode(id, data);
      setQrCodes((prev) =>
        prev.map((qr) => (qr.id === id ? updatedQrCode : qr))
      );
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading((prev) => ({ ...prev, isSaving: false }));
    }
  };

  // Eliminar código QR
  const deleteQrCode = async (id: string) => {
    try {
      setLoading((prev) => ({ ...prev, isDeleting: true }));
      clearError();
      await mainPortalApi.deleteQRCode(id);
      setQrCodes((prev) => prev.filter((qr) => qr.id !== id));
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // Cambiar estado activo/inactivo de un código QR
  const toggleQrCodeStatus = async (id: string) => {
    try {
      setLoading((prev) => ({ ...prev, isSaving: true }));
      clearError();
      const updatedQrCode = await mainPortalApi.toggleQRCodeStatus(id);
      setQrCodes((prev) =>
        prev.map((qr) => (qr.id === id ? updatedQrCode : qr))
      );
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading((prev) => ({ ...prev, isSaving: false }));
    }
  };
  return (
    <AppContext.Provider
      value={{
        selectedClient,
        selectedBranch,
        clients,
        branches,
        qrCodes,
        loading,
        error,
        setSelectedClient,
        setSelectedBranch,
        loadClients,
        loadBranches,
        loadQrCodes,
        addClient,
        updateClient,
        deleteClient,
        addBranch,
        updateBranch,
        deleteBranch,
        createBatchQrCodes,
        updateQrCode,
        deleteQrCode,
        toggleQrCodeStatus,
        clearError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};

import React, { useState, createContext, useContext } from 'react';
import { mockClients, mockBranches } from '../utils/mockData';
interface Client {
  id: string;
  name: string;
  active: boolean;
  services: string[];
  createdAt: string;
}
interface Branch {
  id: string;
  clientId: string;
  name: string;
  address: string;
  tables: number;
  active: boolean;
}
interface QrCode {
  id: string;
  branchId: string;
  tableNumber: number;
  url: string;
  createdAt: string;
}
interface AppContextType {
  selectedClient: string | null;
  selectedBranch: string | null;
  clients: Client[];
  branches: Branch[];
  qrCodes: QrCode[];
  setSelectedClient: (id: string | null) => void;
  setSelectedBranch: (id: string | null) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  addBranch: (branch: Omit<Branch, 'id'>) => void;
  generateQrCode: (branchId: string, tableNumber: number) => void;
}
const AppContext = createContext<AppContextType | undefined>(undefined);
export const AppContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [branches, setBranches] = useState<Branch[]>(mockBranches);
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const addClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient = {
      ...client,
      id: `client-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setClients([...clients, newClient]);
  };
  const addBranch = (branch: Omit<Branch, 'id'>) => {
    const newBranch = {
      ...branch,
      id: `branch-${Date.now()}`
    };
    setBranches([...branches, newBranch]);
  };
  const generateQrCode = (branchId: string, tableNumber: number) => {
    const newQrCode = {
      id: `qr-${Date.now()}`,
      branchId,
      tableNumber,
      url: `https://xquisito.com/qr/${branchId}/${tableNumber}`,
      createdAt: new Date().toISOString()
    };
    setQrCodes([...qrCodes, newQrCode]);
  };
  return <AppContext.Provider value={{
    selectedClient,
    selectedBranch,
    clients,
    branches,
    qrCodes,
    setSelectedClient,
    setSelectedBranch,
    addClient,
    addBranch,
    generateQrCode
  }}>
      {children}
    </AppContext.Provider>;
};
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
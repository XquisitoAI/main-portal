import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { PlusIcon, TrashIcon, PencilIcon, SearchIcon } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { Client, Branch, ClientFormDataWithInvitation, AVAILABLE_SERVICES } from '../../types';
import ClientModal from '../modals/ClientModal';
import BranchModal from '../modals/BranchModal';
import ConfirmDeleteModal from '../modals/ConfirmDeleteModal';
import InvitationStatus from '../ui/InvitationStatus';
const AdminManager: React.FC = () => {
  const {
    clients,
    branches,
    addClient,
    updateClient,
    deleteClient,
    addBranch,
    updateBranch,
    deleteBranch
  } = useAppContext();
  const [activeTab, setActiveTab] = useState('clients');
  const [searchTerm, setSearchTerm] = useState('');
  const [branchSearchTerm, setBranchSearchTerm] = useState('');

  // Estados para modales
  const [clientModal, setClientModal] = useState({
    isOpen: false,
    client: null as Client | null
  });
  const [branchModal, setBranchModal] = useState({
    isOpen: false,
    branch: null as Branch | null
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: '' as 'client' | 'branch',
    item: null as Client | Branch | null
  });

  // Estados de carga
  const [isLoading, setIsLoading] = useState({
    saving: false,
    deleting: false
  });
  // Funciones para manejar modales de clientes
  const openClientModal = (client?: Client) => {
    setClientModal({ isOpen: true, client: client || null });
  };

  const closeClientModal = () => {
    setClientModal({ isOpen: false, client: null });
  };

  // Funciones para manejar modales de sucursales
  const openBranchModal = (branch?: Branch) => {
    setBranchModal({ isOpen: true, branch: branch || null });
  };

  const closeBranchModal = () => {
    setBranchModal({ isOpen: false, branch: null });
  };

  // Funciones para manejar modal de confirmación
  const openDeleteModal = (type: 'client' | 'branch', item: Client | Branch) => {
    setDeleteModal({ isOpen: true, type, item });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, type: '' as 'client' | 'branch', item: null });
  };
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    const normalizedSearchTerm = searchTerm.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return clients.filter(client => {
      const normalizedName = client.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return normalizedName.includes(normalizedSearchTerm);
    });
  }, [clients, searchTerm]);

  const filteredBranches = useMemo(() => {
    if (!branchSearchTerm.trim()) return branches;
    const normalizedSearchTerm = branchSearchTerm.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return branches.filter(branch => {
      const normalizedName = branch.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return normalizedName.includes(normalizedSearchTerm);
    });
  }, [branches, branchSearchTerm]);
  // Manejar guardado de clientes
  const handleSaveClient = async (clientData: ClientFormDataWithInvitation) => {
    setIsLoading(prev => ({ ...prev, saving: true }));

    try {
      if (clientModal.client) {
        // Editar cliente existente - no se envía invitación
        const { sendInvitation, ...clientDataForUpdate } = clientData;
        updateClient(clientModal.client.id, clientDataForUpdate);
      } else {
        // Crear nuevo cliente - enviar invitación si está marcado
        const { sendInvitation, ...clientDataForCreation } = clientData;

        if (sendInvitation) {
          console.log('🆕 Creando cliente con invitación por email habilitada');
        } else {
          console.log('🆕 Creando cliente sin enviar invitación por email');
        }

        addClient(clientDataForCreation);
      }
      closeClientModal();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, saving: false }));
    }
  };

  // Manejar guardado de sucursales
  const handleSaveBranch = async (branchData: any) => {
    setIsLoading(prev => ({ ...prev, saving: true }));

    try {
      if (branchModal.branch) {
        // Editar sucursal existente
        updateBranch(branchModal.branch.id, branchData);
      } else {
        // Crear nueva sucursal
        addBranch(branchData);
      }
      closeBranchModal();
    } catch (error) {
      console.error('Error al guardar sucursal:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, saving: false }));
    }
  };

  // Manejar eliminación
  const handleDelete = async () => {
    if (!deleteModal.item) return;

    setIsLoading(prev => ({ ...prev, deleting: true }));

    try {
      if (deleteModal.type === 'client') {
        deleteClient(deleteModal.item.id);
      } else {
        deleteBranch(deleteModal.item.id);
      }
      closeDeleteModal();
    } catch (error) {
      console.error('Error al eliminar:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, deleting: false }));
    }
  };
  // Función para obtener la etiqueta de un servicio a partir de su ID
  const getServiceLabel = (serviceId: string) => {
    const service = AVAILABLE_SERVICES.find(s => s.id === serviceId);
    return service ? service.label : serviceId;
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Admin Manager</h1>
        <div className="flex space-x-2">
          <button className={`px-4 py-2 rounded-lg ${activeTab === 'clients' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setActiveTab('clients')}>
            Clientes
          </button>
          <button className={`px-4 py-2 rounded-lg ${activeTab === 'branches' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setActiveTab('branches')}>
            Sucursales
          </button>
        </div>
      </div>
      {activeTab === 'clients' && <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">
              Gestión de Clientes
            </h2>
            <div className="flex items-center">
              <div className="relative mr-3">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <SearchIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-[240px]" 
                  placeholder="Buscar por nombre..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={() => openClientModal()}>
                <PlusIcon className="h-5 w-5 mr-2" />
                Nuevo Cliente
              </button>
            </div>
          </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dueño
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Servicios
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registro Admin
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map(client => <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {client.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Creado: {formatDate(client.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {client.ownerName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {client.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {client.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {client.services.map(service => <span key={service} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {getServiceLabel(service)}
                          </span>)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${client.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {client.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <InvitationStatus
                        clientId={client.id}
                        clientEmail={client.email}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        onClick={() => openClientModal(client)}
                        title="Editar cliente"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => openDeleteModal('client', client)}
                        title="Eliminar cliente"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>
      }
      {activeTab === 'branches' && <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">
              Gestión de Sucursales
            </h2>
            <div className="flex items-center">
              <div className="relative mr-3">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <SearchIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input type="text" className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-[220px]" placeholder="Buscar por sucursal..." value={branchSearchTerm} onChange={e => setBranchSearchTerm(e.target.value)} />
              </div>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={() => openBranchModal()}>
                <PlusIcon className="h-5 w-5 mr-2" />
                Nueva Sucursal
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sucursal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dirección
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mesas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBranches.map(branch => {
              const client = clients.find(c => c.id === branch.clientId);
              return <tr key={branch.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {client?.name || 'Desconocido'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{branch.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {branch.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {branch.tables}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${branch.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {branch.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          onClick={() => openBranchModal(branch)}
                          title="Editar sucursal"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => openDeleteModal('branch', branch)}
                          title="Eliminar sucursal"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>;
            })}
              </tbody>
            </table>
          </div>
        </div>
      }

      {/* Modales */}
      <ClientModal
        isOpen={clientModal.isOpen}
        onClose={closeClientModal}
        onSave={handleSaveClient}
        client={clientModal.client}
        isLoading={isLoading.saving}
      />

      <BranchModal
        isOpen={branchModal.isOpen}
        onClose={closeBranchModal}
        onSave={handleSaveBranch}
        branch={branchModal.branch}
        clients={clients}
        isLoading={isLoading.saving}
      />

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title={`Eliminar ${deleteModal.type === 'client' ? 'Cliente' : 'Sucursal'}`}
        itemName={deleteModal.item?.name || ''}
        itemType={deleteModal.type === 'client' ? 'cliente' : 'sucursal'}
        additionalInfo={
          deleteModal.type === 'client'
            ? `También se eliminarán ${branches.filter(b => b.clientId === deleteModal.item?.id).length} sucursal(es) asociada(s).`
            : undefined
        }
        isLoading={isLoading.deleting}
      />
    </div>;
};
export default AdminManager;
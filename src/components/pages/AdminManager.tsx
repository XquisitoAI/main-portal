import React, { useMemo, useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  SearchIcon,
} from "lucide-react";
import { formatDate } from "../../utils/formatters";
import {
  Client,
  Branch,
  ClientFormDataWithInvitation,
  AVAILABLE_SERVICES,
  RoomRange,
} from "../../types";
import ClientModal from "../modals/ClientModal";
import BranchModal from "../modals/BranchModal";
import ConfirmDeleteModal from "../modals/ConfirmDeleteModal";
import InvitationStatus from "../ui/InvitationStatus";
import { useMainPortalApi } from "../../services/mainPortalApi";

interface AdminManagerProps {
  defaultTab?: "clientes" | "sucursales";
  showTabs?: ("clientes" | "sucursales")[];
}

const AdminManager: React.FC<AdminManagerProps> = ({
  defaultTab = "clientes",
  showTabs = ["clientes", "sucursales"],
}) => {
  const {
    clients,
    branches,
    addClient,
    updateClient,
    deleteClient,
    addBranch,
    updateBranch,
    deleteBranch,
    loading,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchSearchTerm, setBranchSearchTerm] = useState("");

  // Estado para almacenar los estados de invitación
  const [invitationStatuses, setInvitationStatuses] = useState<Record<string, any>>({});
  const [invitationStatusesLoading, setInvitationStatusesLoading] = useState(true);

  // Hook para la API
  const mainPortalApi = useMainPortalApi();

  // Cargar estados de invitación una sola vez
  useEffect(() => {
    const fetchInvitationStatuses = async () => {
      try {
        setInvitationStatusesLoading(true);
        const statuses = await mainPortalApi.getInvitationStatuses();
        setInvitationStatuses(statuses);
      } catch (error) {
        console.error('Error fetching invitation statuses:', error);
        setInvitationStatuses({});
      } finally {
        setInvitationStatusesLoading(false);
      }
    };

    fetchInvitationStatuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo cargar una vez al montar el componente

  // Estados para modales
  const [clientModal, setClientModal] = useState({
    isOpen: false,
    client: null as Client | null,
  });
  const [branchModal, setBranchModal] = useState({
    isOpen: false,
    branch: null as Branch | null,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "" as "client" | "branch",
    item: null as Client | Branch | null,
  });

  // Estados de carga
  const [isLoading, setIsLoading] = useState({
    saving: false,
    deleting: false,
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
  const openDeleteModal = (
    type: "client" | "branch",
    item: Client | Branch
  ) => {
    setDeleteModal({ isOpen: true, type, item });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      type: "" as "client" | "branch",
      item: null,
    });
  };

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    const normalizedSearchTerm = searchTerm
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return clients.filter((client) => {
      const normalizedName = client.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return normalizedName.includes(normalizedSearchTerm);
    });
  }, [clients, searchTerm]);

  const filteredBranches = useMemo(() => {
    if (!branchSearchTerm.trim()) return branches;
    const normalizedSearchTerm = branchSearchTerm
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return branches.filter((branch) => {
      const normalizedName = branch.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return normalizedName.includes(normalizedSearchTerm);
    });
  }, [branches, branchSearchTerm]);

  // Función para refrescar estados de invitación
  const refreshInvitationStatuses = async () => {
    try {
      const statuses = await mainPortalApi.getInvitationStatuses();
      setInvitationStatuses(statuses);
    } catch (error) {
      console.error('Error refreshing invitation statuses:', error);
    }
  };

  // Manejar guardado de clientes
  const handleSaveClient = async (clientData: ClientFormDataWithInvitation) => {
    setIsLoading((prev) => ({ ...prev, saving: true }));

    try {
      if (clientModal.client) {
        // Editar cliente existente - no se envía invitación
        const { sendInvitation, ...clientDataForUpdate } = clientData;
        await updateClient(clientModal.client.id, clientDataForUpdate);
      } else {
        // Crear nuevo cliente - enviar invitación si está marcado
        const { sendInvitation, ...clientDataForCreation } = clientData;

        if (sendInvitation) {
          console.log("🆕 Creando cliente con invitación por email habilitada");
        } else {
          console.log("🆕 Creando cliente sin enviar invitación por email");
        }

        await addClient(clientDataForCreation);
      }

      // Refrescar estados de invitación después de crear/actualizar
      await refreshInvitationStatuses();

      // Pequeño delay para mostrar el feedback de "Guardado"
      await new Promise(resolve => setTimeout(resolve, 500));

      closeClientModal();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, saving: false }));
    }
  };

  // Manejar guardado de sucursales
  const handleSaveBranch = async (branchData: any) => {
    console.log('📤 Datos de sucursal a guardar:', branchData);
    console.log('📤 room_ranges:', branchData.roomRanges);
    setIsLoading((prev) => ({ ...prev, saving: true }));

    try {
      if (branchModal.branch) {
        // Editar sucursal existente
        await updateBranch(branchModal.branch.id, branchData);
      } else {
        // Crear nueva sucursal
        await addBranch(branchData);
      }

      // Pequeño delay para mostrar el feedback de "Guardado"
      await new Promise(resolve => setTimeout(resolve, 500));

      closeBranchModal();
    } catch (error) {
      console.error("Error al guardar sucursal:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, saving: false }));
    }
  };

  // Manejar eliminación
  const handleDelete = async () => {
    if (!deleteModal.item) return;

    setIsLoading((prev) => ({ ...prev, deleting: true }));

    try {
      if (deleteModal.type === "client") {
        await deleteClient(deleteModal.item.id);
      } else {
        await deleteBranch(deleteModal.item.id);
      }

      // Pequeño delay para mostrar el feedback de "Eliminado"
      await new Promise(resolve => setTimeout(resolve, 500));

      closeDeleteModal();
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, deleting: false }));
    }
  };

  // Función para obtener la etiqueta de un servicio a partir de su ID
  const getServiceLabel = (serviceId: string) => {
    const service = AVAILABLE_SERVICES.find((s) => s.id === serviceId);
    return service ? service.label : serviceId;
  };

  // Formatear número con comas
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
    }).format(value);
  };

  // Colores para los gráficos
  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  // Calcular total de habitaciones desde los rangos
  const calculateTotalRoomsFromRanges = (ranges: RoomRange[]): number => {
    return ranges.reduce((total, range) => {
      return total + (range.end - range.start + 1);
    }, 0);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Admin Manager</h1>
        <div className="flex space-x-2">
          {showTabs.includes("clientes") && (
            <button
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg ${activeTab === "clientes" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
              onClick={() => setActiveTab("clientes")}
            >
              Clientes
            </button>
          )}
          {showTabs.includes("sucursales") && (
            <button
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg ${activeTab === "sucursales" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
              onClick={() => setActiveTab("sucursales")}
            >
              Sucursales
            </button>
          )}
        </div>
      </div>

      {activeTab === "clientes" && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-3 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            <h2 className="text-base sm:text-lg font-medium text-gray-800">
              Gestión de Clientes
            </h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0">
              <div className="relative sm:mr-3">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <SearchIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-[240px] text-sm sm:text-base"
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                className="flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                onClick={() => openClientModal()}
              >
                <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                Nuevo Cliente
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading.isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando clientes...</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Establecimiento
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dueño
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Servicios
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mesas
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Habitaciones
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registro Admin
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 text-xs sm:text-sm">
                        {client.name}
                      </div>
                      <div className="text-[10px] sm:text-sm text-gray-500">
                        Creado: {formatDate(client.createdAt)}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900">
                        {client.ownerName}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900">
                        {client.email}
                      </div>
                      <div className="text-[10px] sm:text-sm text-gray-500">
                        {client.phone}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {client.services.map((service) => (
                          <span
                            key={service}
                            className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full bg-blue-100 text-blue-800"
                          >
                            {getServiceLabel(service)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-center">
                      {client.services.includes("flex-bill") ||
                      client.services.includes("tap-order-pay") ? (
                        <div className="inline-flex items-center">
                          <span className="text-sm sm:text-lg font-semibold text-gray-900">
                            {client.tableCount || 0}
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-500 ml-1">
                            mesa{(client.tableCount || 0) !== 1 ? "s" : ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs sm:text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-center">
                      {client.services.includes("room-service") ? (
                        <div className="inline-flex items-center">
                          <span className="text-sm sm:text-lg font-semibold text-blue-900">
                            {client.roomCount || 0}
                          </span>
                          <span className="text-[10px] sm:text-xs text-blue-600 ml-1">
                            hab{(client.roomCount || 0) !== 1 ? "s" : ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs sm:text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <span
                        className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full ${client.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {client.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <InvitationStatus
                        clientId={client.id}
                        clientEmail={client.email}
                        invitationInfo={invitationStatuses[client.id]}
                        isLoading={invitationStatusesLoading}
                      />
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-indigo-600 hover:text-indigo-900 mr-2 sm:mr-3"
                        onClick={() => openClientModal(client)}
                        title="Editar cliente"
                      >
                        <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => openDeleteModal("client", client)}
                        title="Eliminar cliente"
                      >
                        <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}
      {activeTab === "sucursales" && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-3 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            <h2 className="text-base sm:text-lg font-medium text-gray-800">
              Gestión de Sucursales
            </h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0">
              <div className="relative sm:mr-3">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <SearchIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-[220px] text-sm sm:text-base"
                  placeholder="Buscar por sucursal..."
                  value={branchSearchTerm}
                  onChange={(e) => setBranchSearchTerm(e.target.value)}
                />
              </div>
              <button
                className="flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                onClick={() => openBranchModal()}
              >
                <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                Nueva Sucursal
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading.isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando sucursales...</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sucursal
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dirección
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mesas
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Habitaciones
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBranches.map((branch) => {
                  const client = clients.find((c) => c.id === branch.clientId);
                  return (
                    <tr key={branch.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 text-xs sm:text-sm">
                          {client?.name || "Desconocido"}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <div className="text-gray-900 text-xs sm:text-sm">{branch.name}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {branch.address}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {branch.tables}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {(() => {
                          const client = clients.find((c) => c.id === branch.clientId);
                          if (!client || !client.services.includes('room-service')) {
                            return '—';
                          }

                          // Priorizar roomRanges si existen
                          if (branch.roomRanges && branch.roomRanges.length > 0) {
                            const total = calculateTotalRoomsFromRanges(branch.roomRanges);
                            return total;
                          }

                          // Fallback a rooms legacy
                          return branch.rooms || '—';
                        })()}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <span
                          className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full ${branch.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {branch.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-indigo-600 hover:text-indigo-900 mr-2 sm:mr-3"
                          onClick={() => openBranchModal(branch)}
                          title="Editar sucursal"
                        >
                          <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => openDeleteModal("branch", branch)}
                          title="Eliminar sucursal"
                        >
                          <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}

      {/* Modales */}
      <ClientModal
        isOpen={clientModal.isOpen}
        onClose={closeClientModal}
        onSave={handleSaveClient}
        client={clientModal.client}
        isLoading={loading.isSaving || isLoading.saving}
      />

      <BranchModal
        isOpen={branchModal.isOpen}
        onClose={closeBranchModal}
        onSave={handleSaveBranch}
        branch={branchModal.branch}
        clients={clients}
        branches={branches}
        isLoading={loading.isSaving || isLoading.saving}
      />

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title={`Eliminar ${deleteModal.type === "client" ? "Cliente" : "Sucursal"}`}
        itemName={deleteModal.item?.name || ""}
        itemType={deleteModal.type === "client" ? "cliente" : "sucursal"}
        additionalInfo={
          deleteModal.type === "client"
            ? `También se eliminarán ${branches.filter((b) => b.clientId === deleteModal.item?.id).length} sucursal(es) asociada(s).`
            : undefined
        }
        isLoading={loading.isDeleting || isLoading.deleting}
      />
    </div>
  );
};
export default AdminManager;

import React, { useMemo, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  SearchIcon,
  TrendingUpIcon,
  DollarSignIcon,
  UsersIcon,
  ShoppingCartIcon,
  UserCheckIcon,
  CreditCardIcon,
} from "lucide-react";
import { formatDate } from "../../utils/formatters";
import {
  Client,
  Branch,
  ClientFormDataWithInvitation,
  AVAILABLE_SERVICES,
} from "../../types";
import ClientModal from "../modals/ClientModal";
import BranchModal from "../modals/BranchModal";
import ConfirmDeleteModal from "../modals/ConfirmDeleteModal";
import InvitationStatus from "../ui/InvitationStatus";
import { useSuperAdminStats, useRestaurants } from "../../hooks/useApiData";
import type { SuperAdminFilters } from "../../types/api";
import SuperAdminFiltersComponent from "../dashboard/SuperAdminFilters";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface AdminManagerProps {
  defaultTab?: "clientes" | "sucursales" | "super-admin";
  showTabs?: ("clientes" | "sucursales" | "super-admin")[];
}

const AdminManager: React.FC<AdminManagerProps> = ({
  defaultTab = "super-admin",
  showTabs = ["clientes", "sucursales", "super-admin"],
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
  } = useAppContext();

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [superAdminFilters, setSuperAdminFilters] = useState<SuperAdminFilters>(
    {}
  );

  // Fetch super admin stats y restaurantes
  const {
    data: superAdminStats,
    isLoading: statsLoading,
    isError: statsError,
  } = useSuperAdminStats(superAdminFilters);
  const { data: restaurantsList, isLoading: restaurantsLoading } =
    useRestaurants();

  const [searchTerm, setSearchTerm] = useState("");
  const [branchSearchTerm, setBranchSearchTerm] = useState("");

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

  // Manejar guardado de clientes
  const handleSaveClient = async (clientData: ClientFormDataWithInvitation) => {
    setIsLoading((prev) => ({ ...prev, saving: true }));

    try {
      if (clientModal.client) {
        // Editar cliente existente - no se envía invitación
        const { sendInvitation, ...clientDataForUpdate } = clientData;
        updateClient(clientModal.client.id, clientDataForUpdate);
      } else {
        // Crear nuevo cliente - enviar invitación si está marcado
        const { sendInvitation, ...clientDataForCreation } = clientData;

        if (sendInvitation) {
          console.log("🆕 Creando cliente con invitación por email habilitada");
        } else {
          console.log("🆕 Creando cliente sin enviar invitación por email");
        }

        addClient(clientDataForCreation);
      }
      closeClientModal();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, saving: false }));
    }
  };

  // Manejar guardado de sucursales
  const handleSaveBranch = async (branchData: any) => {
    setIsLoading((prev) => ({ ...prev, saving: true }));

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
        deleteClient(deleteModal.item.id);
      } else {
        deleteBranch(deleteModal.item.id);
      }
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Admin Manager</h1>
        <div className="flex space-x-2">
          {showTabs.includes("super-admin") && (
            <button
              className={`px-4 py-2 rounded-lg ${activeTab === "super-admin" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
              onClick={() => setActiveTab("super-admin")}
            >
              Super Admin
            </button>
          )}
          {showTabs.includes("clientes") && (
            <button
              className={`px-4 py-2 rounded-lg ${activeTab === "clientes" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
              onClick={() => setActiveTab("clientes")}
            >
              Clientes
            </button>
          )}
          {showTabs.includes("sucursales") && (
            <button
              className={`px-4 py-2 rounded-lg ${activeTab === "sucursales" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
              onClick={() => setActiveTab("sucursales")}
            >
              Sucursales
            </button>
          )}
        </div>
      </div>

      {/* SUPER ADMIN TAB */}
      {activeTab === "super-admin" && (
        <div className="space-y-6">
          {/* Filtros */}
          <SuperAdminFiltersComponent
            restaurants={(restaurantsList || []).map((r: any) => ({
              id: r.id,
              name: r.name,
            }))}
            onFilterChange={setSuperAdminFilters}
          />

          {/* Loading y Error States */}
          {statsLoading && restaurantsLoading && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
            </div>
          )}

          {statsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                Error al cargar las estadísticas. Por favor, intenta de nuevo.
              </p>
            </div>
          )}

          {/* Stats Cards */}
          {!statsLoading && !statsError && superAdminStats && (
            <>
              {/* Métricas principales - Grid de 4 columnas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Volumen Transaccionado */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">
                      Volumen Transaccionado
                    </h3>
                    <TrendingUpIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(superAdminStats.transaction_volume)}
                  </p>
                </div>

                {/* Ingresos Xquisito */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">
                      Ingresos Xquisito
                    </h3>
                    <DollarSignIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(superAdminStats.xquisito_income)}
                  </p>
                </div>

                {/* Diners Activos */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">
                      Diners Activos
                    </h3>
                    <UsersIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {superAdminStats.active_diners.toLocaleString()}
                  </p>
                </div>

                {/* Órdenes Exitosas */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">
                      Órdenes Exitosas
                    </h3>
                    <ShoppingCartIcon className="h-5 w-5 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {superAdminStats.successful_orders.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Segunda fila de métricas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Administradores Activos */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">
                      Administradores Activos
                    </h3>
                    <UserCheckIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {superAdminStats.active_admins.toLocaleString()}
                  </p>
                </div>

                {/* Método de Pago Más Usado */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">
                      Método de Pago Más Usado
                    </h3>
                    <CreditCardIcon className="h-5 w-5 text-pink-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {superAdminStats.most_used_payment_method.method}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {superAdminStats.most_used_payment_method.count.toLocaleString()}{" "}
                    transacciones
                  </p>
                </div>

                {/* Total de Transacciones */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">
                      Total de Transacciones
                    </h3>
                    <CreditCardIcon className="h-5 w-5 text-teal-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {superAdminStats.total_transactions.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Gráficos por Servicio */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Volumen por Servicio */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Volumen por Servicio
                  </h3>
                  {superAdminStats.volume_by_service.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={superAdminStats.volume_by_service.map(
                            (item: any) => ({
                              name: item.service,
                              value: item.volume,
                            })
                          )}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry: any) =>
                            `${entry.name}: ${formatCurrency(entry.value)}`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {superAdminStats.volume_by_service.map(
                            (_: any, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No hay datos disponibles
                    </p>
                  )}
                </div>

                {/* Órdenes por Servicio */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Órdenes por Servicio
                  </h3>
                  {superAdminStats.orders_by_service.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={superAdminStats.orders_by_service.map(
                            (item: any) => ({
                              name: item.service,
                              value: item.count,
                            })
                          )}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry: any) =>
                            `${entry.name}: ${entry.value}`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {superAdminStats.orders_by_service.map(
                            (_: any, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No hay datos disponibles
                    </p>
                  )}
                </div>

                {/* Transacciones por Servicio */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Transacciones por Servicio
                  </h3>
                  {superAdminStats.transactions_by_service.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={superAdminStats.transactions_by_service.map(
                            (item: any) => ({
                              name: item.service,
                              value: item.count,
                            })
                          )}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry: any) =>
                            `${entry.name}: ${entry.value}`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {superAdminStats.transactions_by_service.map(
                            (_: any, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No hay datos disponibles
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "clientes" && (
        <div className="bg-white rounded-lg shadow-sm">
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => openClientModal()}
              >
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
                    Establecimiento
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
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mesas
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Habitaciones
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
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
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
                        {client.services.map((service) => (
                          <span
                            key={service}
                            className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                          >
                            {getServiceLabel(service)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {client.services.includes("flex-bill") ||
                      client.services.includes("tap-order-pay") ? (
                        <div className="inline-flex items-center">
                          <span className="text-lg font-semibold text-gray-900">
                            {client.tableCount || 0}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            mesa{(client.tableCount || 0) !== 1 ? "s" : ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {client.services.includes("room-service") ? (
                        <div className="inline-flex items-center">
                          <span className="text-lg font-semibold text-blue-900">
                            {client.roomCount || 0}
                          </span>
                          <span className="text-xs text-blue-600 ml-1">
                            hab{(client.roomCount || 0) !== 1 ? "s" : ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${client.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {client.active ? "Activo" : "Inactivo"}
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
                        onClick={() => openDeleteModal("client", client)}
                        title="Eliminar cliente"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === "sucursales" && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">
              Gestión de Sucursales
            </h2>
            <div className="flex items-center">
              <div className="relative mr-3">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <SearchIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-[220px]"
                  placeholder="Buscar por sucursal..."
                  value={branchSearchTerm}
                  onChange={(e) => setBranchSearchTerm(e.target.value)}
                />
              </div>
              <button
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => openBranchModal()}
              >
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
                {filteredBranches.map((branch) => {
                  const client = clients.find((c) => c.id === branch.clientId);
                  return (
                    <tr key={branch.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {client?.name || "Desconocido"}
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
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${branch.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {branch.active ? "Activo" : "Inactivo"}
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
                          onClick={() => openDeleteModal("branch", branch)}
                          title="Eliminar sucursal"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
        branches={branches}
        isLoading={isLoading.saving}
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
        isLoading={isLoading.deleting}
      />
    </div>
  );
};
export default AdminManager;

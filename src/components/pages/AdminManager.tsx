import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon, XIcon, SearchIcon } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
const AdminManager: React.FC = () => {
  const {
    clients,
    branches,
    addClient,
    addBranch
  } = useAppContext();
  const [activeTab, setActiveTab] = useState('clients');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [showNewBranchForm, setShowNewBranchForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchSearchTerm, setBranchSearchTerm] = useState('');
  const [newClient, setNewClient] = useState({
    name: '',
    services: [] as string[]
  });
  const [newBranch, setNewBranch] = useState({
    clientId: '',
    name: '',
    address: '',
    tables: 1,
    active: true
  });
  // Lista actualizada de servicios XQUISITO
  const servicesList = [{
    id: 'tap-order-pay',
    label: 'Tap Order & Pay'
  }, {
    id: 'flex-bill',
    label: 'Flex Bill'
  }, {
    id: 'food-hall',
    label: 'Food Hall'
  }, {
    id: 'tap-pay',
    label: 'Tap & Pay'
  }, {
    id: 'pick-n-go',
    label: 'Pick N Go'
  }];
  // Filtrar clientes basados en el término de búsqueda
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    const normalizedSearchTerm = searchTerm.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return clients.filter(client => {
      const normalizedName = client.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return normalizedName.includes(normalizedSearchTerm);
    });
  }, [clients, searchTerm]);
  // Filtrar sucursales basadas en el término de búsqueda
  const filteredBranches = useMemo(() => {
    if (!branchSearchTerm.trim()) return branches;
    const normalizedSearchTerm = branchSearchTerm.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return branches.filter(branch => {
      const normalizedName = branch.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return normalizedName.includes(normalizedSearchTerm);
    });
  }, [branches, branchSearchTerm]);
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    addClient({
      name: newClient.name,
      services: newClient.services,
      active: true
    });
    setNewClient({
      name: '',
      services: []
    });
    setShowNewClientForm(false);
  };
  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    addBranch(newBranch);
    setNewBranch({
      clientId: '',
      name: '',
      address: '',
      tables: 1,
      active: true
    });
    setShowNewBranchForm(false);
  };
  const handleServiceToggle = (service: string) => {
    if (newClient.services.includes(service)) {
      setNewClient({
        ...newClient,
        services: newClient.services.filter(s => s !== service)
      });
    } else {
      setNewClient({
        ...newClient,
        services: [...newClient.services, service]
      });
    }
  };
  // Función para obtener la etiqueta de un servicio a partir de su ID
  const getServiceLabel = (serviceId: string) => {
    const service = servicesList.find(s => s.id === serviceId);
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
                <input type="text" className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-[240px]" placeholder="Buscar por nombre..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={() => setShowNewClientForm(true)}>
                <PlusIcon className="h-5 w-5 mr-2" />
                Nuevo Cliente
              </button>
            </div>
          </div>
          {showNewClientForm && <div className="p-6 border-b border-gray-100 bg-gray-50">
              <form onSubmit={handleAddClient}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Restaurante
                    </label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newClient.name} onChange={e => setNewClient({
                ...newClient,
                name: e.target.value
              })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Servicios Activos
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {servicesList.map(service => <label key={service.id} className="inline-flex items-center">
                          <input type="checkbox" className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" checked={newClient.services.includes(service.id)} onChange={() => handleServiceToggle(service.id)} />
                          <span className="ml-2 text-gray-700">
                            {service.label}
                          </span>
                        </label>)}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button type="button" className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50" onClick={() => setShowNewClientForm(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Guardar Cliente
                  </button>
                </div>
              </form>
            </div>}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Servicios
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Alta
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
                {filteredClients.map(client => <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {client.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {client.services.map(service => <span key={service} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {getServiceLabel(service)}
                          </span>)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(client.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${client.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {client.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>}
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
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={() => setShowNewBranchForm(true)}>
                <PlusIcon className="h-5 w-5 mr-2" />
                Nueva Sucursal
              </button>
            </div>
          </div>
          {showNewBranchForm && <div className="p-6 border-b border-gray-100 bg-gray-50">
              <form onSubmit={handleAddBranch}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cliente
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newBranch.clientId} onChange={e => setNewBranch({
                ...newBranch,
                clientId: e.target.value
              })} required>
                      <option value="">Seleccionar Cliente</option>
                      {clients.map(client => <option key={client.id} value={client.id}>
                          {client.name}
                        </option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la Sucursal
                    </label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newBranch.name} onChange={e => setNewBranch({
                ...newBranch,
                name: e.target.value
              })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newBranch.address} onChange={e => setNewBranch({
                ...newBranch,
                address: e.target.value
              })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Mesas
                    </label>
                    <input type="number" min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newBranch.tables} onChange={e => setNewBranch({
                ...newBranch,
                tables: parseInt(e.target.value)
              })} required />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button type="button" className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50" onClick={() => setShowNewBranchForm(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Guardar Sucursal
                  </button>
                </div>
              </form>
            </div>}
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
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>;
            })}
              </tbody>
            </table>
          </div>
        </div>}
    </div>;
};
export default AdminManager;
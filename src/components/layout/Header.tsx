import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { MapPinIcon, ChevronDownIcon } from 'lucide-react';
const Header: React.FC = () => {
  const {
    clients,
    branches,
    selectedClient,
    selectedBranch,
    setSelectedClient,
    setSelectedBranch
  } = useAppContext();
  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value || null;
    setSelectedClient(clientId);
    setSelectedBranch(null);
  };
  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBranch(e.target.value || null);
  };
  const filteredBranches = selectedClient ? branches.filter(branch => branch.clientId === selectedClient) : branches;
  const currentBranch = selectedBranch ? branches.find(branch => branch.id === selectedBranch) : null;
  const currentClient = selectedClient ? clients.find(client => client.id === selectedClient) : null;
  return <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Xquisito Administrador
          </h1>
          <p className="text-sm text-gray-500">
            Bienvenido al panel de administración
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <label htmlFor="client-selector" className="sr-only">
              Seleccionar Cliente
            </label>
            <select id="client-selector" className="bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedClient || ''} onChange={handleClientChange}>
              <option value="">Todos los clientes</option>
              {clients.map(client => <option key={client.id} value={client.id}>
                  {client.name}
                </option>)}
            </select>
          </div>
          <div className="relative inline-block">
            <div className="flex items-center bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700">
              <MapPinIcon className="h-5 w-5 text-gray-500 mr-2" />
              <span className="mr-1 font-medium">Sucursal actual:</span>
              <span className="mr-2">
                {currentBranch?.name || (currentClient ? 'Todas las sucursales' : 'Todas')}
              </span>
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            </div>
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-10 hidden">
              <div className="p-2">
                <select className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedBranch || ''} onChange={handleBranchChange}>
                  <option value="">Todas las sucursales</option>
                  {filteredBranches.map(branch => <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>;
};
export default Header;
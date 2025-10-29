import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { QrCodeIcon, DownloadIcon, PrinterIcon, PlusIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
const QrManager: React.FC = () => {
  const {
    branches,
    clients,
    qrCodes,
    generateQrCode
  } = useAppContext();
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [tableCount, setTableCount] = useState(1);
  const [showQrForm, setShowQrForm] = useState(false);
  const filteredBranches = selectedClientId ? branches.filter(branch => branch.clientId === selectedClientId) : branches;
  const selectedBranch = branches.find(branch => branch.id === selectedBranchId);
  const clientName = selectedBranch ? clients.find(client => client.id === selectedBranch.clientId)?.name : '';
  const handleGenerateQrCodes = () => {
    if (!selectedBranchId) return;
    // Genera QR codes para cada mesa
    for (let i = 1; i <= tableCount; i++) {
      generateQrCode(selectedBranchId, i);
    }
    setShowQrForm(false);
  };
  // Filtra los códigos QR por sucursal seleccionada
  const filteredQrCodes = selectedBranchId ? qrCodes.filter(qr => qr.branchId === selectedBranchId) : qrCodes;
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">QR Manager</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={() => setShowQrForm(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Generar Nuevos QR
        </button>
      </div>
      {showQrForm && <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Generar Códigos QR
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedClientId} onChange={e => {
            setSelectedClientId(e.target.value);
            setSelectedBranchId('');
          }}>
                <option value="">Seleccionar Cliente</option>
                {clients.map(client => <option key={client.id} value={client.id}>
                    {client.name}
                  </option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sucursal
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedBranchId} onChange={e => setSelectedBranchId(e.target.value)} disabled={!selectedClientId}>
                <option value="">Seleccionar Sucursal</option>
                {filteredBranches.map(branch => <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Mesas
              </label>
              <input type="number" min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={tableCount} onChange={e => setTableCount(parseInt(e.target.value))} disabled={!selectedBranchId} />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50" onClick={() => setShowQrForm(false)}>
              Cancelar
            </button>
            <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300" onClick={handleGenerateQrCodes} disabled={!selectedBranchId}>
              Generar QR
            </button>
          </div>
        </div>}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800">
            Códigos QR Generados
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {selectedBranchId ? `Mostrando códigos QR para ${clientName} - ${selectedBranch?.name}` : 'Selecciona un cliente y sucursal para ver los códigos QR'}
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedClientId} onChange={e => {
              setSelectedClientId(e.target.value);
              setSelectedBranchId('');
            }}>
                <option value="">Todos los Clientes</option>
                {clients.map(client => <option key={client.id} value={client.id}>
                    {client.name}
                  </option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sucursal
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedBranchId} onChange={e => setSelectedBranchId(e.target.value)} disabled={!selectedClientId}>
                <option value="">Todas las Sucursales</option>
                {filteredBranches.map(branch => <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>)}
              </select>
            </div>
          </div>
        </div>
        {filteredQrCodes.length > 0 ? <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredQrCodes.map(qrCode => {
          const branch = branches.find(b => b.id === qrCode.branchId);
          const client = branch ? clients.find(c => c.id === branch.clientId) : null;
          return <div key={qrCode.id} className="border border-gray-200 rounded-lg p-4 flex flex-col items-center">
                  <div className="mb-3 text-center">
                    <h3 className="font-medium">
                      {client?.name} - {branch?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Mesa #{qrCode.tableNumber}
                    </p>
                  </div>
                  <div className="bg-white p-2 border border-gray-200 rounded-lg mb-3">
                    <QRCodeSVG value={qrCode.url} size={120} level="H" includeMargin={true} />
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <button className="flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                      <DownloadIcon className="h-3 w-3 mr-1" />
                      Descargar
                    </button>
                    <button className="flex items-center px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                      <PrinterIcon className="h-3 w-3 mr-1" />
                      Imprimir
                    </button>
                  </div>
                </div>;
        })}
          </div> : <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center p-6 bg-gray-100 rounded-full mb-4">
              <QrCodeIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">
              No hay códigos QR generados
            </h3>
            <p className="text-gray-500 mb-4">
              Selecciona una sucursal y genera códigos QR para sus mesas
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={() => setShowQrForm(true)}>
              Generar QR
            </button>
          </div>}
      </div>
    </div>;
};
export default QrManager;
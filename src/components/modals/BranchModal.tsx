import React, { useState, useEffect } from 'react';
import { Branch, BranchFormData, Client } from '../../types';
import Modal from '../ui/Modal';

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BranchFormData) => void;
  branch?: Branch | null;
  clients: Client[];
  branches: Branch[];
  isLoading?: boolean;
}

const BranchModal: React.FC<BranchModalProps> = ({
  isOpen,
  onClose,
  onSave,
  branch,
  clients,
  branches,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<BranchFormData>({
    clientId: '',
    name: '',
    address: '',
    tables: 1,
    active: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Resetear formulario cuando cambia la sucursal o se abre/cierra
  useEffect(() => {
    if (isOpen) {
      if (branch) {
        // Modo edición
        setFormData({
          clientId: branch.clientId,
          name: branch.name,
          address: branch.address,
          tables: branch.tables,
          active: branch.active
        });
      } else {
        // Modo creación
        setFormData({
          clientId: '',
          name: '',
          address: '',
          tables: 1,
          active: true
        });
      }
      setErrors({});
    }
  }, [isOpen, branch]);

  // Validaciones
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Debe seleccionar un cliente';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la sucursal es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'La dirección debe tener al menos 10 caracteres';
    }

    if (formData.tables < 1) {
      newErrors.tables = 'Debe tener al menos 1 mesa';
    } else if (formData.tables > 1000) {
      newErrors.tables = 'El número de mesas no puede ser mayor a 1000';
    }

    // Validación estricta: verificar que no exceda las mesas contratadas
    if (formData.clientId && formData.tables > 0) {
      const availableTables = calculateAvailableTables(formData.clientId);
      if (formData.tables > availableTables) {
        const clientInfo = getClientTableInfo(formData.clientId);
        newErrors.tables = `Solo hay ${availableTables} mesas disponibles. El cliente tiene ${clientInfo?.totalContracted || 0} mesas contratadas y ${clientInfo?.totalUsed || 0} ya están en uso.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
    }
  };

  // Obtener nombre del cliente
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente no encontrado';
  };

  // Calcular mesas disponibles para un cliente
  const calculateAvailableTables = (clientId: string) => {
    if (!clientId) return 0;

    const client = clients.find(c => c.id === clientId);
    if (!client || !client.tableCount) return 0;

    // Sumar mesas de todas las sucursales existentes de este cliente
    // Excluir la sucursal actual si estamos editando
    const usedTables = branches
      .filter(b => b.clientId === clientId && b.id !== branch?.id)
      .reduce((sum, b) => sum + (b.tables || 0), 0);

    return Math.max(0, client.tableCount - usedTables);
  };

  // Obtener información detallada del cliente seleccionado
  const getClientTableInfo = (clientId: string) => {
    if (!clientId) return null;

    const client = clients.find(c => c.id === clientId);
    if (!client) return null;

    const clientBranches = branches.filter(b => b.clientId === clientId && b.id !== branch?.id);
    const usedTables = clientBranches.reduce((sum, b) => sum + (b.tables || 0), 0);
    const availableTables = Math.max(0, (client.tableCount || 0) - usedTables);

    return {
      totalContracted: client.tableCount || 0,
      totalUsed: usedTables,
      totalAvailable: availableTables,
      branches: clientBranches
    };
  };

  const title = branch ? 'Editar Sucursal' : 'Nueva Sucursal';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente *
            </label>
            <select
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.clientId ? 'border-red-300' : 'border-gray-300'
              }`}
              value={formData.clientId}
              onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
            >
              <option value="">Seleccionar Cliente</option>
              {clients
                .filter(client => client.active) // Solo mostrar clientes activos
                .map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))
              }
            </select>
            {errors.clientId && (
              <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>
            )}
          </div>

          {/* Nombre de la Sucursal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Sucursal *
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Sucursal Centro"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dirección *
          </label>
          <textarea
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.address ? 'border-red-300' : 'border-gray-300'
            }`}
            rows={3}
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Ej: Av. Reforma 123, Centro, Ciudad de México, CP 06600"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Número de Mesas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Mesas *
              {formData.clientId && (() => {
                const availableTables = calculateAvailableTables(formData.clientId);
                return (
                  <span className="ml-2 text-xs text-gray-500">
                    (Disponibles: {availableTables})
                  </span>
                );
              })()}
            </label>
            <input
              type="number"
              min="1"
              max={formData.clientId ? calculateAvailableTables(formData.clientId) : 1000}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.tables ? 'border-red-300' : 'border-gray-300'
              }`}
              value={formData.tables}
              onChange={(e) => setFormData(prev => ({ ...prev, tables: parseInt(e.target.value) || 1 }))}
            />
            {errors.tables && (
              <p className="mt-1 text-sm text-red-600">{errors.tables}</p>
            )}
          </div>

          {/* Estado */}
          <div className="flex items-center pt-7">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                checked={formData.active}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              />
              <span className="ml-2 text-sm text-gray-700">Sucursal activa</span>
            </label>
          </div>
        </div>

        {/* Información del cliente seleccionado */}
        {formData.clientId && (
          <div className="space-y-4">
            {/* Información básica del cliente */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Información del Cliente
              </h4>
              <div className="text-sm text-blue-700">
                <p><strong>Restaurante:</strong> {getClientName(formData.clientId)}</p>
                {(() => {
                  const client = clients.find(c => c.id === formData.clientId);
                  return client ? (
                    <>
                      <p><strong>Dueño:</strong> {client.ownerName}</p>
                      <p><strong>Email:</strong> {client.email}</p>
                      <p><strong>Teléfono:</strong> {client.phone}</p>
                    </>
                  ) : null;
                })()}
              </div>
            </div>

            {/* Información de mesas */}
            {(() => {
              const clientInfo = getClientTableInfo(formData.clientId);
              if (!clientInfo) return null;

              return (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-yellow-900 mb-3">
                    Control de Mesas
                  </h4>

                  {/* Resumen de mesas */}
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{clientInfo.totalContracted}</div>
                      <div className="text-xs text-gray-600">Contratadas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">{clientInfo.totalUsed}</div>
                      <div className="text-xs text-gray-600">En Uso</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{clientInfo.totalAvailable}</div>
                      <div className="text-xs text-gray-600">Disponibles</div>
                    </div>
                  </div>

                  {/* Desglose por sucursales existentes */}
                  {clientInfo.branches.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-yellow-800 mb-2">
                        Sucursales Existentes:
                      </h5>
                      <div className="space-y-1">
                        {clientInfo.branches.map(branch => (
                          <div key={branch.id} className="flex justify-between text-xs text-yellow-700">
                            <span>{branch.name}</span>
                            <span>{branch.tables} mesas</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Advertencia si no hay mesas disponibles */}
                  {clientInfo.totalAvailable === 0 && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                      <strong>⚠️ Sin mesas disponibles:</strong> Este cliente ya ha utilizado todas sus mesas contratadas.
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : (branch ? 'Actualizar' : 'Crear Sucursal')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BranchModal;
import React, { useState, useEffect } from 'react';
import { Client, ClientFormData, AVAILABLE_SERVICES } from '../../types';
import Modal from '../ui/Modal';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ClientFormData) => void;
  client?: Client | null;
  isLoading?: boolean;
}

const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  client,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    ownerName: '',
    phone: '',
    email: '',
    services: [],
    active: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Resetear formulario cuando cambia el cliente o se abre/cierra
  useEffect(() => {
    if (isOpen) {
      if (client) {
        // Modo edición
        setFormData({
          name: client.name,
          ownerName: client.ownerName,
          phone: client.phone,
          email: client.email,
          services: client.services,
          active: client.active
        });
      } else {
        // Modo creación
        setFormData({
          name: '',
          ownerName: '',
          phone: '',
          email: '',
          services: [],
          active: true
        });
      }
      setErrors({});
    }
  }, [isOpen, client]);

  // Validaciones
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del restaurante es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'El nombre del dueño es requerido';
    } else if (formData.ownerName.trim().length < 2) {
      newErrors.ownerName = 'El nombre del dueño debe tener al menos 2 caracteres';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El número de teléfono es requerido';
    } else if (!/^[\+]?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Formato de teléfono no válido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email no válido';
    }

    if (formData.services.length === 0) {
      newErrors.services = 'Debe seleccionar al menos un servicio';
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

  // Manejar cambios en servicios
  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const title = client ? 'Editar Cliente' : 'Nuevo Cliente';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Restaurante *
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Restaurante El Dorado"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Nombre del Dueño */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Dueño *
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.ownerName ? 'border-red-300' : 'border-gray-300'
              }`}
              value={formData.ownerName}
              onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
              placeholder="Ej: Carlos Mendoza"
            />
            {errors.ownerName && (
              <p className="mt-1 text-sm text-red-600">{errors.ownerName}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Teléfono *
            </label>
            <input
              type="tel"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Ej: +52 55 1234 5678"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Ej: cliente@ejemplo.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Servicios Activos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Servicios Activos *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {AVAILABLE_SERVICES.map(service => (
              <label key={service.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mt-0.5"
                  checked={formData.services.includes(service.id)}
                  onChange={() => handleServiceToggle(service.id)}
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {service.label}
                  </div>
                  {service.description && (
                    <div className="text-xs text-gray-500">
                      {service.description}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
          {errors.services && (
            <p className="mt-1 text-sm text-red-600">{errors.services}</p>
          )}
        </div>

        {/* Estado */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
            />
            <span className="ml-2 text-sm text-gray-700">Cliente activo</span>
          </label>
        </div>

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
            {isLoading ? 'Guardando...' : (client ? 'Actualizar' : 'Crear Cliente')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ClientModal;
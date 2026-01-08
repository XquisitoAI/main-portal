import React, { useState, useEffect } from 'react';
import { Client, ClientFormData, ClientFormDataWithInvitation, AVAILABLE_SERVICES } from '../../types';
import Modal from '../ui/Modal';
import { Loader2 } from 'lucide-react';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ClientFormDataWithInvitation) => void;
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
    tableCount: 0,
    roomCount: 0,
    active: true
  });

  // Estado para el checkbox de invitación
  const [sendInvitation, setSendInvitation] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Resetear formulario cuando cambia el cliente o se abre/cierra
  useEffect(() => {
    if (isOpen) {
      if (client) {
        // Modo edición - no mostrar checkbox de invitación
        setFormData({
          name: client.name,
          ownerName: client.ownerName,
          phone: client.phone,
          email: client.email,
          services: client.services,
          tableCount: client.tableCount || 0,
          roomCount: client.roomCount || 0,
          active: client.active
        });
        setSendInvitation(false); // No enviar invitación en modo edición
      } else {
        // Modo creación - mostrar checkbox de invitación
        setFormData({
          name: '',
          ownerName: '',
          phone: '',
          email: '',
          services: [],
          tableCount: 0,
          roomCount: 0,
          active: true
        });
        setSendInvitation(true); // Por defecto enviar invitación
      }
      setErrors({});
    }
  }, [isOpen, client]);

  // Función para validar teléfono
  const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) {
      return 'El número de teléfono es requerido';
    }

    // Validar que solo contenga números
    if (!/^\d+$/.test(phone)) {
      return 'El teléfono solo puede contener números';
    }

    // Validar longitud mínima
    if (phone.length < 10) {
      return 'El teléfono debe tener al menos 10 números';
    }

    return null; // Válido
  };

  // Manejar cambio de teléfono - solo números
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Solo permitir números - filtrar cualquier otro caracter
    const numbersOnly = value.replace(/[^\d]/g, '');

    // Actualizar el valor solo con números
    setFormData(prev => ({ ...prev, phone: numbersOnly }));

    // Limpiar error de teléfono si existe
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

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

    // Validación mejorada de teléfono
    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      newErrors.phone = phoneError;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email no válido';
    }

    if (formData.services.length === 0) {
      newErrors.services = 'Debe seleccionar al menos un servicio';
    }

    // Validar tableCount solo si se han seleccionado servicios que requieren mesas
    const requiresTableCount = formData.services.includes('flex-bill') || formData.services.includes('tap-order-pay');
    if (requiresTableCount) {
      if (!formData.tableCount || formData.tableCount < 1) {
        newErrors.tableCount = 'El número de mesas es requerido para los servicios seleccionados';
      } else if (formData.tableCount > 100) {
        newErrors.tableCount = 'El número máximo de mesas es 100';
      }
    }

    // Validar roomCount solo si se ha seleccionado room-service
    const requiresRoomCount = formData.services.includes('room-service');
    if (requiresRoomCount) {
      if (!formData.roomCount || formData.roomCount < 1) {
        newErrors.roomCount = 'El número de habitaciones es requerido para Room Service';
      } else if (formData.roomCount > 500) {
        newErrors.roomCount = 'El número máximo de habitaciones es 500';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Pasar datos del formulario junto con la opción de enviar invitación
      onSave({ ...formData, sendInvitation });
    }
  };

  // Manejar cambios en servicios
  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => {
      const newServices = prev.services.includes(serviceId)
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId];

      // Si se deseleccionan todos los servicios que requieren mesas, limpiar tableCount
      const requiresTableCount = newServices.includes('flex-bill') || newServices.includes('tap-order-pay');
      // Si se deselecciona room-service, limpiar roomCount
      const requiresRoomCount = newServices.includes('room-service');

      return {
        ...prev,
        services: newServices,
        tableCount: requiresTableCount ? prev.tableCount : 0,
        roomCount: requiresRoomCount ? prev.roomCount : 0
      };
    });

    // Limpiar errores si se deseleccionan servicios que los requieren
    if (errors.tableCount) {
      setErrors(prev => ({ ...prev, tableCount: '' }));
    }
    if (errors.roomCount) {
      setErrors(prev => ({ ...prev, roomCount: '' }));
    }
  };

  const title = client ? 'Editar Cliente' : 'Nuevo Cliente';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6 relative">
        {/* Overlay de carga */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 z-10 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 font-medium">Guardando...</p>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Establecimiento *
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Restaurante El Dorado / Hotel Plaza"
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
              onChange={handlePhoneChange}
              placeholder="Ej: 5551234567"
              maxLength={15}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
            {!errors.phone && (
              <p className="mt-1 text-xs text-gray-500">
                Solo números. Mínimo 10 dígitos.
              </p>
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

        {/* Número de mesas - Solo visible si se han seleccionado servicios que requieren mesas */}
        {(formData.services.includes('flex-bill') || formData.services.includes('tap-order-pay')) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de mesas *
            </label>
            <input
              type="number"
              min="1"
              max="500"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.tableCount ? 'border-red-300' : 'border-gray-300'
              }`}
              value={formData.tableCount || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                tableCount: e.target.value ? parseInt(e.target.value) : 0
              }))}
              placeholder="Ingresa número de mesas (1-100)"
            />
            {errors.tableCount && (
              <p className="mt-1 text-sm text-red-600">{errors.tableCount}</p>
            )}
            <p className="mt-1 text-xs text-yellow-700">
              <strong>Requerido para Flex Bill y Tap Order & Pay</strong>
            </p>
          </div>
        )}

        {/* Número de habitaciones - Solo visible si se ha seleccionado room-service */}
        {formData.services.includes('room-service') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de habitaciones *
            </label>
            <input
              type="number"
              min="1"
              max="500"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.roomCount ? 'border-red-300' : 'border-gray-300'
              }`}
              value={formData.roomCount || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                roomCount: e.target.value ? parseInt(e.target.value) : 0
              }))}
              placeholder="Ingresa número de habitaciones (1-500)"
            />
            {errors.roomCount && (
              <p className="mt-1 text-sm text-red-600">{errors.roomCount}</p>
            )}
            <p className="mt-1 text-xs text-yellow-700">
              <strong>Requerido para Room Service - Servicio a la habitación</strong>
            </p>
          </div>
        )}

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
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
            />
            <span className="ml-2 text-sm text-gray-700">Cliente activo</span>
          </label>

          {/* Información de invitación - solo mostrar en modo creación */}
          {!client && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-blue-600 rounded border-gray-300 mt-0.5"
                  checked={sendInvitation}
                  readOnly
                  disabled
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-blue-900">
                    📧 Invitación automática por email
                  </span>
                  <p className="text-xs text-blue-700 mt-1">
                    Se enviará automáticamente un email de invitación al cliente
                    para que pueda registrarse en el Admin Portal.
                  </p>
                </div>
              </div>
            </div>
          )}
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isLoading ? 'Guardando...' : (client ? 'Actualizar' : 'Crear Cliente')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ClientModal;
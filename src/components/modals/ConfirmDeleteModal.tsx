import React from 'react';
import { TrashIcon, AlertTriangleIcon } from 'lucide-react';
import Modal from '../ui/Modal';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  itemType: 'cliente' | 'sucursal';
  additionalInfo?: string;
  isLoading?: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType,
  additionalInfo,
  isLoading = false
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <div className="space-y-4">
        {/* Ícono de advertencia */}
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
          <AlertTriangleIcon className="w-8 h-8 text-red-600" />
        </div>

        {/* Mensaje principal */}
        <div className="text-center">
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            ¿Estás seguro?
          </h4>
          <p className="text-sm text-gray-600">
            Esta acción eliminará permanentemente {itemType === 'cliente' ? 'el cliente' : 'la sucursal'}:
          </p>
          <p className="text-base font-medium text-gray-900 mt-2">
            "{itemName}"
          </p>
        </div>

        {/* Información adicional */}
        {additionalInfo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start">
              <AlertTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Advertencia:</p>
                <p>{additionalInfo}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de confirmación */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start">
            <TrashIcon className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-medium">Esta acción no se puede deshacer</p>
              <p>
                {itemType === 'cliente'
                  ? 'Se eliminarán todos los datos del cliente y sus sucursales asociadas.'
                  : 'Se eliminarán todos los datos de la sucursal.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Eliminando...
              </>
            ) : (
              <>
                <TrashIcon className="w-4 h-4 mr-2" />
                Eliminar {itemType}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;
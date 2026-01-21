import React, { useEffect } from 'react';
import { XIcon } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  // Cerrar modal con Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="flex items-center justify-center min-h-screen p-2 sm:p-4 text-center"
      >
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Panel del modal */}
        <div
          className={`relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full mx-2 sm:mx-auto my-4 sm:my-8 max-h-[95vh] sm:max-h-[90vh] flex flex-col ${sizeClasses[size]}`}
        >
          {/* Header */}
          <div className="bg-white px-3 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3
                className="text-base sm:text-lg leading-6 font-medium text-gray-900"
                id="modal-title"
              >
                {title}
              </h3>
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 p-1"
                onClick={onClose}
              >
                <span className="sr-only">Cerrar</span>
                <XIcon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-3 sm:px-6 pb-4 sm:pb-6 overflow-y-auto flex-grow">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
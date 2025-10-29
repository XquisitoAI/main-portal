import React from 'react';
import { AlertCircleIcon, RefreshCwIcon } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  showRetry = true
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-lg border border-red-200">
      <div className="flex items-center mb-3">
        <AlertCircleIcon className="w-6 h-6 text-red-500 mr-2" />
        <h3 className="text-lg font-medium text-red-800">Error</h3>
      </div>

      <p className="text-red-700 text-center mb-4 max-w-md">
        {message}
      </p>

      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <RefreshCwIcon className="w-4 h-4 mr-2" />
          Reintentar
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
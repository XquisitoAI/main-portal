import React from 'react';

interface InvitationStatusProps {
  clientId: string;
  clientEmail: string;
  invitationInfo?: {
    status: string;
    email: string;
    invitedAt?: string;
    usedAt?: string;
  };
  isLoading?: boolean;
}

const InvitationStatus: React.FC<InvitationStatusProps> = ({
  clientId,
  clientEmail,
  invitationInfo,
  isLoading = false
}) => {
  const getStatus = (): 'loading' | 'pending' | 'registered' | 'no-invitation' => {
    if (isLoading) return 'loading';

    if (invitationInfo) {
      return invitationInfo.status === 'registered' ? 'registered' : 'pending';
    }

    return 'no-invitation';
  };

  const status = getStatus();

  const getStatusDisplay = () => {
    switch (status) {
      case 'loading':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
            Verificando...
          </span>
        );
      case 'registered':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            ✅ Registrado
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
            ⏳ Pendiente
          </span>
        );
      case 'no-invitation':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
            ❌ Sin invitación
          </span>
        );
      default:
        return null;
    }
  };

  return getStatusDisplay();
};

export default InvitationStatus;
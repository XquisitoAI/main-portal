import React, { useState, useEffect } from 'react';
import { useMainPortalApi } from '../../services/mainPortalApi';

interface InvitationStatusProps {
  clientId: string;
  clientEmail: string;
}

const InvitationStatus: React.FC<InvitationStatusProps> = ({ clientId, clientEmail }) => {
  const [status, setStatus] = useState<'loading' | 'pending' | 'registered' | 'no-invitation'>('loading');
  const mainPortalApi = useMainPortalApi();

  useEffect(() => {
    const fetchInvitationStatus = async () => {
      try {
        const response = await mainPortalApi.getInvitationStatuses();
        const invitationInfo = response[clientId];

        if (invitationInfo) {
          setStatus(invitationInfo.status === 'registered' ? 'registered' : 'pending');
        } else {
          setStatus('no-invitation');
        }
      } catch (error) {
        console.error('Error fetching invitation status:', error);
        setStatus('no-invitation');
      }
    };

    fetchInvitationStatus();
  }, [clientId, mainPortalApi]);

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
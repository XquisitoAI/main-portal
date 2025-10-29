import { useAuth as useClerkAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { apiClient } from '../config/api';

export const useAuth = () => {
  const { isLoaded, isSignedIn, getToken, userId } = useClerkAuth();

  // Configurar el interceptor de axios para incluir el token en cada request
  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(
      async (config) => {
        if (isSignedIn) {
          try {
            const token = await getToken();
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.error('Error getting auth token:', error);
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Cleanup function para remover el interceptor
    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
    };
  }, [isSignedIn, getToken]);

  return {
    isLoaded,
    isSignedIn,
    userId,
    getToken,
  };
};
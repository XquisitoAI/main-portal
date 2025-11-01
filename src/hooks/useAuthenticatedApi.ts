import { useAuth } from '@clerk/nextjs';
import axios, { AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Cliente HTTP básico sin interceptors
const baseApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const useAuthenticatedApi = () => {
  const { getToken } = useAuth();

  const makeAuthenticatedRequest = async (config: AxiosRequestConfig) => {
    try {
      // Obtener token fresco de Clerk
      const token = await getToken();

      if (token) {
        console.log('🔑 Using authenticated token for request');
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      } else {
        console.log('⚠️ No token available - request will be unauthenticated');
      }

      return await baseApiClient.request(config);
    } catch (error) {
      console.error('❌ Authenticated request failed:', error);
      throw error;
    }
  };

  return {
    get: (url: string, config?: AxiosRequestConfig) =>
      makeAuthenticatedRequest({ ...config, method: 'GET', url }),

    post: (url: string, data?: any, config?: AxiosRequestConfig) =>
      makeAuthenticatedRequest({ ...config, method: 'POST', url, data }),

    put: (url: string, data?: any, config?: AxiosRequestConfig) =>
      makeAuthenticatedRequest({ ...config, method: 'PUT', url, data }),

    delete: (url: string, config?: AxiosRequestConfig) =>
      makeAuthenticatedRequest({ ...config, method: 'DELETE', url }),
  };
};
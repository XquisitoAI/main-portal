import axios from 'axios';

// Configuración base del cliente HTTP
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Cliente HTTP configurado
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Note: Authentication is now handled by the useMainPortalApi hook using Clerk's useAuth
// This axios client is kept for backward compatibility but should not be used for authenticated requests

// Interceptor para manejo de respuestas
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejo centralizado de errores
    if (error.response?.status === 401) {
      // Token expirado o inválido
      console.error('Authentication error - redirecting to login');
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
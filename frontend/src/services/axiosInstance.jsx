import axios from 'axios';
import { getStoredToken, getStoredUserId, getStoredPatientId, clearSession } from '../utils/tokenUtils';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({ baseURL: BASE_URL, timeout: 30000 });

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Auto-inject custom headers for technician endpoints
  if (config.url?.includes('/reports/') && (config.method === 'put' || config.url?.includes('/verify'))) {
    const uid = getStoredUserId();
    if (uid) config.headers['X-User-Id'] = uid;
  }
  // Auto-inject patient id for portal
  if (config.url?.includes('/portal/reports/me')) {
    const pid = getStoredPatientId();
    if (pid) config.headers['X-Patient-Id'] = pid;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect on auth endpoints
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/auth/') || url.includes('/portal/r/');
      if (!isAuthEndpoint) {
        clearSession();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

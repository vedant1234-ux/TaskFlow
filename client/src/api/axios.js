/**
 * Axios Instance Configuration
 * Pre-configured with base URL and JWT interceptors
 */

import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || '';
const baseURL = apiUrl ? (apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`) : '/api';

// Create axios instance
const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ────────────────────────────
// Automatically attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ── Response Interceptor ───────────────────────────
// Handle 401 globally — auto logout on invalid token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response?.status === 401) {
      // Token is invalid or expired — clear storage and redirect
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');

      // Only redirect if not already on auth pages
      const publicPaths = ['/login', '/register'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

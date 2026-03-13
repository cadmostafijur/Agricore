import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

/** Shared Axios instance — always sends the HttpOnly cookie */
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor: optionally redirect to /login on 401 (client-side only)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const requestPath = error.config?.url;

      // Skip hard redirect for passive auth checks (e.g. /auth/me on initial load)
      // so that public pages like the home page don't get forced to /login.
      if (requestPath !== '/auth/me') {
        // Avoid redirect loop on the login page itself
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

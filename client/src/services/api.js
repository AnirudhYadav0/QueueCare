import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('queuecare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    
    // Auto logout on 401 invalid token
    if (error.response?.status === 401) {
      const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthRoute && localStorage.getItem('queuecare_token')) {
        localStorage.removeItem('queuecare_token');
        localStorage.removeItem('queuecare_user');
        window.location.href = '/login?expired=true';
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;

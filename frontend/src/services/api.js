import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 45000, // Generous timeout for multimodal Gemini processing
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sahayak_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid
      localStorage.removeItem('sahayak_token');
      localStorage.removeItem('sahayak_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const consultAPI = {
  submit: (formData) => api.post('/consult', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const scamAPI = {
  check: (formData) => api.post('/scam-shield/check', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAlerts: () => api.get('/scam-shield/alerts'),
};

export const grievanceAPI = {
  generate: (data) => api.post('/grievance/generate', data),
  submit: (grievanceId) => api.post('/grievance/submit', { grievance_id: grievanceId, confirmation: true }),
  list: () => api.get('/grievance'),
};

export const historyAPI = {
  get: () => api.get('/history'),
};

export default api;


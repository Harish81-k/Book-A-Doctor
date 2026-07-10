import axios from 'axios';

let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Automatically fix the URL if you forgot to add /api at the end in Render dashboard
if (!apiUrl.endsWith('/api')) {
  apiUrl = apiUrl.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

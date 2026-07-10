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

// Response interceptor to dynamically fix old database records that have hardcoded localhost URLs
api.interceptors.response.use(
  (response) => {
    if (response.data) {
      const backendBaseUrl = apiUrl.replace(/\/api$/, '');
      const fixUrls = (obj) => {
        if (typeof obj === 'string') {
          return obj.replace('http://localhost:5000', backendBaseUrl);
        }
        if (Array.isArray(obj)) {
          return obj.map(fixUrls);
        }
        if (obj !== null && typeof obj === 'object') {
          Object.keys(obj).forEach((key) => {
            obj[key] = fixUrls(obj[key]);
          });
        }
        return obj;
      };
      response.data = fixUrls(response.data);
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: `https://jobintel-app.runasp.net/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Attach Accept-Language so the backend can localize errors/data
  const lang = localStorage.getItem('i18nextLng') || 'en';
  config.headers['Accept-Language'] = lang.startsWith('ar') ? 'ar' : 'en';
  return config;
});

// Automatically handle expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and user on unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login (assuming window location, but better handled via Context/Routing)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

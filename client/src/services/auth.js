import axios from 'axios';

const baseURL = import.meta.env.PROD 
  ? 'https://your-deployed-backend.com/api'
  : 'http://localhost:5000/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('auth-storage');
};

export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

import axios from 'axios';

const baseURL = import.meta.env.PROD 
  ? 'https://magicbricks-phi.vercel.app/api'
  : 'http://localhost:5000/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getProperties = (filters = {}) => api.get('/properties', { params: filters });
export const getProperty = (id) => api.get(`/properties/${id}`);
export const createProperty = (data) => api.post('/properties', data);
export const updateProperty = (id, data) => api.put(`/properties/${id}`, data);
export const deleteProperty = (id) => api.delete(`/properties/${id}`);

export const addVirtualTour = (propertyId, tourData) => 
  api.post(`/properties/${propertyId}/virtual-tour`, tourData);

export const addPropertyRating = (propertyId, ratingData) => 
  api.post(`/properties/${propertyId}/ratings`, ratingData);

export const searchNearbyPlaces = (propertyId, params) => 
  api.get(`/properties/${propertyId}/nearby`, { params });

export const toggleFavorite = (propertyId) => 
  api.post(`/properties/${propertyId}/favorite`);

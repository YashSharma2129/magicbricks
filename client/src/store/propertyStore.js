import { create } from 'zustand';
import { getProperties, getProperty, createProperty, updateProperty, deleteProperty } from '../services/api';

export const usePropertyStore = create((set, get) => ({
  properties: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    furnished: '',
    sortBy: ''
  },

  fetchProperties: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getProperties(get().filters);
      // Ensure we're setting an array of properties
      set({ 
        properties: response.data.properties || [], 
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.message || 'Failed to fetch properties', 
        loading: false,
        properties: [] 
      });
      throw error;
    }
  },

  addProperty: async (propertyData) => {
    set({ loading: true, error: null });
    try {
      const response = await createProperty(propertyData);
      set(state => ({
        properties: [...state.properties, response.data],
        loading: false
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateProperty: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await updateProperty(id, data);
      set(state => ({
        properties: state.properties.map(p => 
          p._id === id ? response.data : p
        ),
        loading: false
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteProperty: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteProperty(id);
      set(state => ({
        properties: state.properties.filter(p => p._id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));

export default usePropertyStore;

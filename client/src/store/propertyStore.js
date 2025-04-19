import { create } from 'zustand';
import { getProperties, getProperty, createProperty, updateProperty, deleteProperty } from '../services/api';

export const usePropertyStore = create((set, get) => ({
  properties: [],
  filters: {
    search: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    furnished: '',
    sortBy: ''
  },
  loading: false,
  error: null,

  setFilters: (filters) => set({ filters }),

  fetchProperties: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getProperties(get().filters);
      set({ 
        properties: response.data.properties,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.message, 
        loading: false,
        properties: []
      });
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

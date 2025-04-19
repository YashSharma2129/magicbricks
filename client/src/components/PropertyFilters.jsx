import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FaFilter, FaSearch, FaRupeeSign, FaBed, FaHome } from 'react-icons/fa';
import usePropertyStore from '../store/propertyStore';
import { useSearchParams } from 'react-router-dom';

const PropertyFilters = () => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const { filters, setFilters, fetchProperties } = usePropertyStore();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Initialize filters from URL params
    const initialFilters = {};
    for (const [key, value] of searchParams.entries()) {
      initialFilters[key] = value;
    }
    setFilters(initialFilters);
    fetchProperties();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    
    // Update URL params
    if (value) {
      searchParams.set(name, value);
    } else {
      searchParams.delete(name);
    }
    setSearchParams(searchParams);

    // Update store and fetch properties
    setFilters(newFilters);
    fetchProperties();
  };

  const propertyTypes = ['Any Type', 'House', 'Apartment', 'Villa', 'Plot', 'Commercial'];
  const bedroomOptions = ['Any', '1', '2', '3', '4', '5+'];
  const furnishingOptions = ['Any', 'Furnished', 'Semi-Furnished', 'Unfurnished'];
  
  return (
    <div className="bg-white rounded-xl shadow-soft p-4 mb-8">
      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          name="search"
          value={filters.search || ''}
          onChange={handleFilterChange}
          placeholder="Search properties by location, name..."
          className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filters Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
        className="flex items-center gap-2 mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
      >
        <FaFilter />
        <span>{isFiltersOpen ? 'Hide Filters' : 'Show Filters'}</span>
      </motion.button>

      <AnimatePresence>
        {isFiltersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {/* Property Type Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <FaHome className="inline mr-2" />
                  Property Type
                </label>
                <select
                  name="propertyType"
                  value={filters.propertyType}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border-gray-200 focus:ring-blue-500"
                >
                  {propertyTypes.map(type => (
                    <option key={type} value={type === 'Any Type' ? '' : type.toLowerCase()}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filters */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <FaRupeeSign className="inline mr-2" />
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    className="w-1/2 rounded-lg border-gray-200 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    className="w-1/2 rounded-lg border-gray-200 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Bedrooms Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <FaBed className="inline mr-2" />
                  Bedrooms
                </label>
                <select
                  name="bedrooms"
                  value={filters.bedrooms}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border-gray-200 focus:ring-blue-500"
                >
                  {bedroomOptions.map(option => (
                    <option key={option} value={option === 'Any' ? '' : option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Furnishing Status */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Furnishing Status
                </label>
                <select
                  name="furnished"
                  value={filters.furnished}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border-gray-200 focus:ring-blue-500"
                >
                  {furnishingOptions.map(option => (
                    <option key={option} value={option === 'Any' ? '' : option.toLowerCase()}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            <div className="flex flex-wrap gap-2 mt-4">
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null;
                return (
                  <motion.span
                    key={key}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm"
                  >
                    {key}: {value}
                    <button
                      onClick={() => handleFilterChange({ target: { name: key, value: '' } })}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </motion.span>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyFilters;

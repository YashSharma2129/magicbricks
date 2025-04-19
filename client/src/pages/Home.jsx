import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import PropertyFilters from '../components/PropertyFilters';
import PropertyCard from '../components/PropertyCard';
import usePropertyStore from '../store/propertyStore';
import LoadingSpinner from '../components/LoadingSpinner';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

const Home = () => {
  const { properties, fetchProperties, error } = usePropertyStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true);
      try {
        await fetchProperties();
      } catch (err) {
        console.error('Error fetching properties:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [fetchProperties]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="container mx-auto px-4"
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Find Your Perfect Property</h1>
      
      <PropertyFilters />

      {Array.isArray(properties) && properties.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
          variants={pageVariants}
        >
          {properties.map(property => (
            <PropertyCard 
              key={property._id} 
              property={property} 
            />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-600">No properties found.</p>
        </div>
      )}
    </motion.div>
  );
};

export default Home;

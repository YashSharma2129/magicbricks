import { motion } from 'framer-motion';
import { useState } from 'react';
import { fadeInUp } from '../utils/animations';

const VirtualTour = ({ coordinates }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const isValidCoordinates = coordinates && 
    typeof coordinates.lat === 'number' && 
    typeof coordinates.lng === 'number';

  return (
    <motion.div
      {...fadeInUp}
      className="virtual-tour w-full rounded-lg overflow-hidden shadow-lg"
    >
      {isValidCoordinates ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ 
            opacity: mapLoaded ? 1 : 0,
            scale: mapLoaded ? 1 : 0.95
          }}
          transition={{ duration: 0.5 }}
          className="h-[400px] w-full"
        >
          <iframe
            title="Property Location"
            width="100%"
            height="100%"
            loading="lazy"
            onLoad={() => setMapLoaded(true)}
            src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${coordinates.lat},${coordinates.lng}`}
            className="border-0"
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center h-[400px] bg-gray-100"
        >
          <p className="text-gray-500">Location information not available</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default VirtualTour;

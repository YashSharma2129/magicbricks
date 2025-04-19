import { Link } from 'react-router-dom';
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaHeart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { noImageBase64 } from '../assets/no-image.js';
import { fadeInUp, scaleOnHover } from '../utils/animations';

const formatPrice = (price) => {
  if (!price && price !== 0) return 'Price on request';
  return `₹${price.toLocaleString('en-IN')}`;
};

const PropertyCard = ({ property }) => {
  const {
    _id,
    title = 'Untitled Property',
    price,
    location = 'Location not specified',
    propertyType = 'Not specified',
    furnished = 'Not specified',
    bedrooms,
    bathrooms,
    size,
    images = [],
    featured = false,
    coordinates,
    favoritesCount = 0
  } = property || {};

  const hasValidCoordinates = coordinates && 
    typeof coordinates.latitude === 'number' && 
    typeof coordinates.longitude === 'number';

  return (
    <motion.div
      {...fadeInUp}
      {...scaleOnHover}
      className="bg-white rounded-xl shadow-soft overflow-hidden hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
    >
      <Link to={`/property/${_id}`} className="block">
        <div className="relative">
          {/* Image container with gradient overlay */}
          <motion.div className="relative h-64 overflow-hidden group">
            <motion.img
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              src={images[0] || noImageBase64}
              alt={title}
              className="w-full h-full object-cover brightness-95 hover:brightness-100"
              onError={(e) => { e.target.src = noImageBase64; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Featured badge */}
            {featured && (
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg"
              >
                Featured
              </motion.span>
            )}

            {/* Favorites count */}
            <div className="absolute top-4 left-4 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full text-xs font-medium text-gray-700">
              <FaHeart className="text-red-500" />
              <span>{favoritesCount}</span>
            </div>

            {/* Price tag */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-white text-shadow">
                  {formatPrice(price)}
                </span>
                <span className="bg-white/90 px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                  {propertyType}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Content section */}
          <div className="p-5">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">{title}</h3>
              
              <div className="flex items-center gap-1 text-gray-600">
                <FaMapMarkerAlt className="text-blue-500 flex-shrink-0" />
                <p className="text-sm truncate">{location}</p>
              </div>

              {/* Property details */}
              <div className="flex items-center gap-6 text-gray-700 pt-2">
                {bedrooms && (
                  <div className="flex items-center gap-2">
                    <FaBed className="text-blue-500 text-lg" />
                    <span className="text-sm">{bedrooms} Beds</span>
                  </div>
                )}
                {bathrooms && (
                  <div className="flex items-center gap-2">
                    <FaBath className="text-blue-500 text-lg" />
                    <span className="text-sm">{bathrooms} Baths</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FaRulerCombined className="text-blue-500 text-lg" />
                  <span className="text-sm">{size} sq.ft</span>
                </div>
              </div>

              {/* Additional info badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  {furnished}
                </span>
                {hasValidCoordinates && (
                  <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                    Map Available
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PropertyCard;

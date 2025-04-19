import { useState, useEffect, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { FaBed, FaBath, FaRulerCombined, FaCheckCircle, FaHeart, FaMapMarkerAlt } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { getProperty, toggleFavorite } from '../services/api';
import { useLoading } from '../hooks/useLoading.ts';
import { noImageBase64 } from '../assets/no-image';
import PropertyRatings from '../components/PropertyRatings';
import VirtualTour from '../components/VirtualTour';
import NearbyPlaces from '../components/NearbyPlaces';
import useAuthStore from '../store/authStore';
import { pageVariants, fadeInUp } from '../utils/animations';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { setLoading } = useLoading();
  const { isAuthenticated } = useAuthStore();
  const [isFavorited, setIsFavorited] = useState(false);
  const [coordinates, setCoordinates] = useState(null);

  const refreshProperty = useCallback(async () => {
    setLoading(true, 'Loading property details...');
    try {
      const response = await getProperty(id);
      setProperty(response.data);
      setIsFavorited(response.data.favoritedBy?.includes(response.data.currentUserId));
      
      if (response.data.location) {
        const [lat, lng] = response.data.location.split(',').map(coord => parseFloat(coord.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          setCoordinates([lat, lng]);
        }
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  }, [id, setLoading]);

  useEffect(() => {
    refreshProperty();
  }, [refreshProperty]);

  const handleFavoriteClick = async () => {
    if (!isAuthenticated()) return;
    setLoading(true, 'Updating favorites...');
    try {
      const response = await toggleFavorite(id);
      setIsFavorited(response.data.isFavorited);
      setProperty(prev => ({
        ...prev,
        favoritesCount: response.data.favoritesCount
      }));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!property) return null;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-7xl mx-auto px-4 py-8 space-y-8"
    >
      <Helmet>
        <title>{property.title} | MagicBricks</title>
        <meta name="description" content={property.description?.slice(0, 160)} />
        {coordinates && (
          <>
            <meta property="og:latitude" content={coordinates[0]} />
            <meta property="og:longitude" content={coordinates[1]} />
          </>
        )}
      </Helmet>

      {/* Image Gallery */}
      <motion.section variants={fadeInUp} className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {property.images?.map((image, index) => (
            <motion.div
              key={index}
              className={`relative aspect-video rounded-xl overflow-hidden ${
                index === activeImageIndex ? 'md:col-span-2 md:row-span-2' : ''
              }`}
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveImageIndex(index)}
            >
              <img
                src={image || noImageBase64}
                alt={`Property view ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = noImageBase64 }}
              />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Property Header */}
      <motion.section variants={fadeInUp} className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleFavoriteClick}
            className={`p-3 rounded-full ${
              isFavorited ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500'
            }`}
          >
            <FaHeart className="text-xl" />
          </motion.button>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <FaMapMarkerAlt />
          <p>{property.location}</p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-3xl font-bold text-blue-600">
            ₹{property.price?.toLocaleString('en-IN')}
          </p>
          <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-medium">
            {property.propertyType}
          </span>
        </div>
      </motion.section>

      {/* Property Details */}
      <motion.section variants={fadeInUp} className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {property.bedrooms && (
              <div className="p-4 bg-white rounded-xl shadow-soft">
                <FaBed className="text-blue-500 text-xl mb-2" />
                <p className="text-gray-600">{property.bedrooms} Beds</p>
              </div>
            )}
            {property.bathrooms && (
              <div className="p-4 bg-white rounded-xl shadow-soft">
                <FaBath className="text-blue-500 text-xl mb-2" />
                <p className="text-gray-600">{property.bathrooms} Baths</p>
              </div>
            )}
            <div className="p-4 bg-white rounded-xl shadow-soft">
              <FaRulerCombined className="text-blue-500 text-xl mb-2" />
              <p className="text-gray-600">{property.size} sq.ft</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-soft">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-600 whitespace-pre-line">{property.description}</p>
          </div>

          {property.amenities?.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-soft">
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 gap-4">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Virtual Tour */}
          {isAuthenticated() && (
            <VirtualTour
              propertyId={id}
              existingTour={property.virtualTour}
              onTourAdded={refreshProperty}
            />
          )}

          {/* Map */}
          {coordinates && (
            <div className="bg-white p-6 rounded-xl shadow-soft">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <div className="h-[400px] rounded-lg overflow-hidden">
                <MapContainer
                  center={coordinates}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <Marker position={coordinates}>
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold">{property.title}</h3>
                        <p className="text-sm text-gray-600">{property.propertyType}</p>
                        <p className="text-sm font-bold text-blue-600">
                          ₹{property.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}

          {/* Nearby Places */}
          <NearbyPlaces propertyId={id} />
        </div>
      </motion.section>

      {/* Ratings and Reviews */}
      <motion.section variants={fadeInUp} className="bg-white p-6 rounded-xl shadow-soft">
        <h2 className="text-2xl font-semibold mb-6">Ratings & Reviews</h2>
        <PropertyRatings propertyId={id} onRatingAdded={refreshProperty} />
      </motion.section>
    </motion.div>
  );
};

export default PropertyDetail;

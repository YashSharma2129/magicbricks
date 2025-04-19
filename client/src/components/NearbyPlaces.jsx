import { useState, useEffect } from 'react';
import { FaSchool, FaHospital, FaShoppingCart, FaSubway, FaTree, FaUtensils } from 'react-icons/fa';
import { searchNearbyPlaces } from '../services/api';
import { useLoading } from '../hooks/useLoading.ts';

const placeTypeIcons = {
  'School': FaSchool,
  'Hospital': FaHospital,
  'Mall': FaShoppingCart,
  'Metro': FaSubway,
  'Park': FaTree,
  'Restaurant': FaUtensils
};

const NearbyPlaces = ({ propertyId }) => {
  const [places, setPlaces] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const { setLoading } = useLoading();

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const response = await searchNearbyPlaces(propertyId, {
          type: selectedType,
          radius: 2 // 2km radius
        });
        setPlaces(response.data);
      } catch (error) {
        console.error('Error fetching nearby places:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [propertyId, selectedType, setLoading]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Nearby Places</h3>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {Object.keys(placeTypeIcons).map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {places.map((place, index) => {
          const Icon = placeTypeIcons[place.type] || FaUtensils;
          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Icon className="text-blue-600 text-xl" />
                <span className="font-medium">{place.name}</span>
              </div>
              <span className="text-gray-600">{place.distance} km</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NearbyPlaces;

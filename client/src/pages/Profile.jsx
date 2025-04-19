import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { getProfile } from '../services/auth';
import { useLoading } from '../hooks/useLoading';

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const { setLoading } = useLoading();
  const [favoriteProperties, setFavoriteProperties] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await getProfile();
        setUser(data);
        setFavoriteProperties(data.favoriteProperties || []);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <div className="mt-1 text-gray-900">{user?.name}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 text-gray-900">{user?.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <div className="mt-1 text-gray-900 capitalize">{user?.role}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Favorite Properties</h2>
        {favoriteProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favoriteProperties.map(property => (
              <div key={property._id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{property.title}</h3>
                <p className="text-gray-600">{property.location}</p>
                <p className="text-blue-600 font-bold">₹{property.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No favorite properties yet.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;

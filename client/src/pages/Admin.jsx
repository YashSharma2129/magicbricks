import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePropertyStore } from '../store/propertyStore';
import { useLoading } from '../hooks/useLoading';

const Admin = () => {
  const navigate = useNavigate();
  const { addProperty } = usePropertyStore();
  const { setLoading } = useLoading();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    description: '',
    propertyType: '',
    size: '',
    bedrooms: '',
    bathrooms: '',
    furnished: '',
    amenities: [],
    images: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenitiesChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const compressImage = async (imageBase64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate new dimensions (max 1200px width/height)
        let width = img.width;
        let height = img.height;
        if (width > height && width > 1200) {
          height = Math.round((height * 1200) / width);
          width = 1200;
        } else if (height > 1200) {
          width = Math.round((width * 1200) / height);
          height = 1200;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // 70% quality JPEG
      };
      img.src = imageBase64;
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    try {
      const imageResults = await Promise.all(readers);
      const compressedImages = await Promise.all(
        imageResults.map(img => compressImage(img))
      );
      setFormData(prev => ({ 
        ...prev, 
        images: [...prev.images, ...compressedImages]
      }));
    } catch (error) {
      console.error('Error processing images:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Form validation
    if (!formData.location?.trim()) {
      setError('Location is required');
      setLoading(false);
      return;
    }

    if (!formData.description?.trim()) {
      setError('Description is required');
      setLoading(false);
      return;
    }

    try {
      const propertyData = {
        ...formData,
        price: Number(formData.price) || 0,
        size: Number(formData.size) || 0,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
        // Ensure trimmed values for text fields
        title: formData.title.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        propertyType: formData.propertyType || undefined,
        furnished: formData.furnished || undefined,
        amenities: formData.amenities.length > 0 ? formData.amenities : undefined,
        images: formData.images.length > 0 ? formData.images : undefined
      };

      Object.keys(propertyData).forEach(key => 
        propertyData[key] === undefined && delete propertyData[key]
      );

      await addProperty(propertyData);
      navigate('/');
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message;
      setError(errorMessage);
      console.error('Error adding property:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Add New Property</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter location (e.g., '12.9716,77.5946' for coordinates)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter location in the format "latitude,longitude" (e.g., "12.9716,77.5946")
            </p>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="Provide a detailed description of the property..."
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Type</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Villa">Villa</option>
              <option value="Plot">Plot</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">Amenities</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['Parking', 'Garden', 'Security', 'Gym', 'Pool', 'Elevator'].map((amenity) => (
                <label key={amenity} className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenitiesChange(amenity)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="btn-primary cursor-pointer"
              >
                Upload Images
              </label>
              <span className="text-sm text-gray-500">
                {formData.images.length} images selected
              </span>
            </div>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {formData.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          className="btn-primary w-full"
        >
          Add Property
        </button>
      </form>
    </div>
  );
};

export default Admin;
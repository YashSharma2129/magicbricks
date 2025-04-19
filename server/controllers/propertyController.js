// controllers/propertyController.js
import Property from '../models/Property.js';
import User from '../models/User.js';
import { createNotification } from '../utils/notifications.js';
import { optimizeImage } from '../config/sharp.js';
import cloudinary from '../config/cloudinary.js';

export const toggleFavorite = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Get current user ID as string for comparison
    const userId = req.user._id.toString();
    
    const userIndex = property.favoritedBy.findIndex(id => id.toString() === userId);
    
    if (userIndex === -1) {
      // Add to favorites
      property.favoritedBy.push(userId);
    } else {
      // Remove from favorites using filter
      property.favoritedBy = property.favoritedBy.filter(id => id.toString() !== userId);
    }

    // Update favoritesCount
    property.favoritesCount = property.favoritedBy.length;

    await property.save();

    // Update user's favorite properties
    const user = await User.findById(userId);
    if (userIndex === -1) {
      // Add to user's favorites if not already present
      if (!user.favoriteProperties.includes(property._id)) {
        user.favoriteProperties.push(property._id);
      }
    } else {
      // Remove from user's favorites
      user.favoriteProperties = user.favoriteProperties.filter(
        id => id.toString() !== property._id.toString()
      );
    }
    await user.save();

    res.json({
      isFavorited: userIndex === -1,
      favoritesCount: property.favoritedBy.length
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ message: 'Error toggling favorite', error: error.message });
  }
};

export const getAllProperties = async (req, res) => {
  try {
    const {
      search,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      furnished,
      sortBy,
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Property type filter
    if (propertyType) {
      query.propertyType = propertyType;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Bedrooms filter
    if (bedrooms) {
      query.bedrooms = Number(bedrooms);
    }

    // Bathrooms filter
    if (bathrooms) {
      query.bathrooms = Number(bathrooms);
    }

    // Furnished status filter
    if (furnished) {
      query.furnished = furnished;
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'price-asc':
        sortOptions.price = 1;
        break;
      case 'price-desc':
        sortOptions.price = -1;
        break;
      case 'date-desc':
        sortOptions.createdAt = -1;
        break;
      case 'date-asc':
        sortOptions.createdAt = 1;
        break;
      default:
        sortOptions.createdAt = -1; // Default sort by newest
    }

    const skip = (page - 1) * limit;

    // First, get the total count
    const total = await Property.countDocuments(query);

    // Then execute query with pagination
    const properties = await Property.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('owner', 'name')
      .lean();

    // If user is authenticated, add isFavorited field
    if (req.user) {
      properties.forEach(property => {
        property.isFavorited = property.favoritedBy?.includes(req.user._id);
      });
    }

    res.json({
      properties,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: 'Error fetching properties' });
  }
};

export const createProperty = async (req, res) => {
  try {
    const { images, location, ...propertyData } = req.body;

    let optimizedImages = [];
    if (Array.isArray(images) && images.length > 0) {
      try {
        // Process and upload each image
        for (const imageBase64 of images) {
          if (!imageBase64.startsWith('data:image')) {
            console.error('Invalid image format');
            continue;
          }

          try {
            // Convert base64 to buffer
            const imageBuffer = Buffer.from(
              imageBase64.replace(/^data:image\/\w+;base64,/, ''),
              'base64'
            );

            // Optimize image
            const optimizedBuffer = await optimizeImage(imageBuffer, {
              width: 1200,
              height: 800,
              fit: 'inside',
              format: 'jpeg',
              quality: 80
            });

            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(
              `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`,
              {
                folder: 'properties',
                resource_type: 'auto'
              }
            );
            optimizedImages.push(result.secure_url);
          } catch (uploadError) {
            console.error('Image processing/upload error:', uploadError);
          }
        }
      } catch (imageProcessError) {
        console.error('Image processing error:', imageProcessError);
      }
    }

    // Parse coordinates from location string if provided
    let coordinates = {};
    if (location) {
      const [latitude, longitude] = location.split(',').map(coord => parseFloat(coord.trim()));
      if (!isNaN(latitude) && !isNaN(longitude)) {
        coordinates = { latitude, longitude };
      }
    }

    // Create new property with processed data
    const newProperty = new Property({
      ...propertyData,
      location,
      coordinates,
      images: optimizedImages,
      owner: req.user._id
    });

    const savedProperty = await newProperty.save();
    res.status(201).json(savedProperty);
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(400).json({ 
      message: error.message || 'Error creating property',
      details: error.errors // Include mongoose validation errors if any
    });
  }
};

export const addVirtualTour = async (req, res) => {
  try {
    const { tourUrl, provider } = req.body;
    const property = await Property.findById(req.params.id);
    property.virtualTour = {
      url: tourUrl,
      provider: provider // e.g., 'matterport', 'custom'
    };
    await property.save();
    res.json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const addPropertyRating = async (req, res) => {
  try {
    const { rating, comment, category } = req.body;
    const property = await Property.findById(req.params.id);
    const newRating = {
      user: req.user._id,
      rating,
      comment,
      category
    };
    property.ratings.reviews.push(newRating);
    // Update average ratings
    const reviews = property.ratings.reviews;
    property.ratings.overall = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await property.save();
    // Using try-catch for notification to prevent rating failure if notification fails
    try {
      await createNotification({
        userId: property.owner,
        type: 'Review',
        message: `New ${rating}-star review on your property "${property.title}"`
      });
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
    }
    res.json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const searchNearbyPlaces = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    const { type, radius } = req.query;
    // Implementation would typically use a Maps API
    // This is a placeholder that returns mock data
    const nearbyPlaces = [
      { type: 'School', name: 'Local High School', distance: 0.5 },
      { type: 'Hospital', name: 'City Hospital', distance: 1.2 },
      // ... more places
    ];
    res.json(nearbyPlaces);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('ratings.reviews.user', 'name');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Add isFavorited field if user is authenticated
    const result = property.toObject();
    if (req.user) {
      result.isFavorited = property.favoritedBy.includes(req.user._id);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const { images, location, ...updates } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is owner
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    // Handle new images if provided
    if (images && images.length > 0) {
      const optimizedImages = [];
      for (const imageBase64 of images) {
        const optimized = await sharp(Buffer.from(imageBase64.split(',')[1], 'base64'))
          .resize(1200, 800, { fit: 'inside' })
          .jpeg({ quality: 80 })
          .toBuffer();

        const result = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${optimized.toString('base64')}`,
          { folder: 'properties' }
        );
        optimizedImages.push(result.secure_url);
      }
      updates.images = [...property.images, ...optimizedImages];
    }

    // Update coordinates if location changed
    if (location) {
      const [latitude, longitude] = location.split(',').map(coord => parseFloat(coord.trim()));
      if (!isNaN(latitude) && !isNaN(longitude)) {
        updates.coordinates = { latitude, longitude };
      }
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    res.json(updatedProperty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is owner
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    // Delete associated images from Cloudinary
    if (property.images && property.images.length > 0) {
      for (const imageUrl of property.images) {
        const publicId = imageUrl.split('/').pop().split('.')[0];
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error('Error deleting image from Cloudinary:', error);
        }
      }
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ message: error.message });
  }
};

// controllers/propertyController.js
import Property from '../models/Property.js';
import User from '../models/User.js';
import { createNotification } from '../utils/notifications.js';
import sharp from 'sharp';
import cloudinary from '../config/cloudinary.js';

export const getAllProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const { search, propertyType, minPrice, maxPrice, furnished, sortBy } = req.query;
    let query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (propertyType) {
      query.propertyType = propertyType;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (furnished) {
      query.furnished = furnished;
    }

    let sortQuery = {};
    if (sortBy === 'price-asc') sortQuery.price = 1;
    if (sortBy === 'price-desc') sortQuery.price = -1;
    if (sortBy === 'latest') sortQuery.createdAt = -1;

    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .populate('owner', 'name'),
      Property.countDocuments(query)
    ]);

    res.json({
      properties,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProperties: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProperty = async (req, res) => {
  const { images, location, ...propertyData } = req.body;
  try {
    const optimizedImages = [];
    // Parse coordinates from location string
    let coordinates = {};
    if (location) {
      const [latitude, longitude] = location.split(',').map(coord => parseFloat(coord.trim()));
      if (!isNaN(latitude) && !isNaN(longitude)) {
        coordinates = { latitude, longitude };
      }
    }
    // Process and upload each image
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
    }    const newProp = new Property({
      ...propertyData,
      location,es,
      coordinates,mizedImages,
      images: optimizedImages,
      owner: req.user._id
    });
    const saved = await newProp.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const toggleFavorite = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    const isFavorited = property.favoritedBy.includes(req.user._id);
    if (isFavorited) {
      property.favoritedBy.pull(req.user._id);
      property.favoritesCount--;
    } else {
      property.favoritedBy.push(req.user._id);
      property.favoritesCount++;
    }
    await property.save();
    res.json({ isFavorited: !isFavorited, favoritesCount: property.favoritesCount });
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    
    res.json(property);
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

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

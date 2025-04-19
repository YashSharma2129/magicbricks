import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

export const uploadVerificationDoc = async (req, res) => {
  try {
    const { type, document } = req.body;
    const result = await cloudinary.uploader.upload(document, {
      folder: 'verification_docs'
    });

    const user = await User.findById(req.user._id);
    user.verificationStatus.documents.push({
      type,
      url: result.secure_url,
      status: 'Pending'
    });
    
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const { propertyTypes, locations, priceRange, amenities } = req.body;
    const user = await User.findById(req.user._id);
    
    user.preferences = {
      propertyTypes,
      locations,
      priceRange,
      amenities
    };
    
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserRewards = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Calculate tier based on points
    const points = user.rewards.points;
    let tier = 'Bronze';
    if (points > 1000) tier = 'Silver';
    if (points > 5000) tier = 'Gold';
    if (points > 10000) tier = 'Platinum';
    
    user.rewards.tier = tier;
    await user.save();
    
    res.json(user.rewards);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create new user
    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = user.generateAuthToken();
    res.json({ 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    // Use lean() for better performance and exclude password
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate({
        path: 'favoriteProperties',
        select: 'title price location images propertyType' // Only select needed fields
      })
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Transform _id to string to avoid ObjectId issues
    user._id = user._id.toString();
    if (user.favoriteProperties) {
      user.favoriteProperties = user.favoriteProperties.map(prop => ({
        ...prop,
        _id: prop._id.toString()
      }));
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      message: 'Error fetching profile', 
      error: error.message 
    });
  }
};

export const updateVerificationStatus = async (req, res) => {
  try {
    const { userId, documentId, status, remarks } = req.body;
    const user = await User.findById(userId);
    
    const document = user.verificationStatus.documents.id(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    document.status = status;
    document.remarks = remarks;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('notifications')
      .sort({ 'notifications.createdAt': -1 });
    res.json(user.notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const notification = user.notifications.id(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await user.save();
    res.json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

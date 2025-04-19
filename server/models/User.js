import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  favoriteProperties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  verificationStatus: {
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isIdentityVerified: { type: Boolean, default: false },
    documents: [{
      type: { type: String, enum: ['ID', 'Address', 'Income'] },
      url: String,
      status: { type: String, enum: ['Pending', 'Verified', 'Rejected'] }
    }]
  },
  preferences: {
    propertyTypes: [String],
    locations: [String],
    priceRange: {
      min: Number,
      max: Number
    },
    amenities: [String]
  },
  rewards: {
    points: { type: Number, default: 0 },
    tier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' }
  },
  searchHistory: [{
    query: String,
    filters: Object,
    timestamp: { type: Date, default: Date.now }
  }],
  notifications: [{
    type: { type: String, enum: ['Price Drop', 'New Listing', 'Review', 'Message'] },
    message: String,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const User = mongoose.model('User', userSchema);
export default User;

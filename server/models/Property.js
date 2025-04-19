import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true }, // Format: "latitude,longitude"
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  description: { type: String, required: true },
  images: [{ type: String }],
  propertyType: {
    type: String,
    enum: ['Apartment', 'House', 'Villa', 'Plot', 'Commercial'],
    required: true
  },
  size: { type: Number, required: true }, // in sq ft
  bedrooms: { type: Number },
  bathrooms: { type: Number },
  amenities: [{
    type: String,
    enum: ['Parking', 'Garden', 'Security', 'Gym', 'Pool', 'Elevator']
  }],
  furnished: {
    type: String,
    enum: ['Unfurnished', 'Semi-Furnished', 'Fully-Furnished']
  },
  listed: { type: Date, default: Date.now },
  featured: { type: Boolean, default: false },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  favoritedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  favoritesCount: {
    type: Number,
    default: 0
  },
  virtualTour: { type: String }, // URL to 360° virtual tour
  videoUrl: { type: String }, // Property walkthrough video
  nearbyPlaces: [{
    type: {
      type: String,
      enum: ['School', 'Hospital', 'Mall', 'Metro', 'Park', 'Restaurant']
    },
    name: String,
    distance: Number // in km
  }],
  sustainability: [{
    type: String,
    enum: ['Solar Panels', 'Rainwater Harvesting', 'EV Charging', 'Waste Management']
  }],
  availableFrom: { type: Date },
  rentTerms: {
    minDuration: { type: Number }, // minimum stay in months
    petsAllowed: { type: Boolean, default: false },
    maintenanceIncluded: { type: Boolean, default: false }
  },
  cancellationPolicy: {
    type: String,
    enum: ['Flexible', 'Moderate', 'Strict'],
    default: 'Moderate'
  },
  ratings: {
    overall: { type: Number, default: 0 },
    cleanliness: { type: Number, default: 0 },
    location: { type: Number, default: 0 },
    value: { type: Number, default: 0 },
    reviews: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: Number,
      comment: String,
      photos: [String],
      createdAt: { type: Date, default: Date.now }
    }]
  }
}, { timestamps: true });

// Add search index
propertySchema.index({ 
  title: 'text', 
  description: 'text', 
  location: 'text' 
});

const Property = mongoose.model('Property', propertySchema);
export default Property;

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cloudinary from './config/cloudinary.js';
import sharp from 'sharp'; // ✅ fixed import
import propertyRoutes from './routes/propertyRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

// ✅ Check for required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://rapidfecto.netlify.app'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ✅ Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ✅ Root route to avoid 500 on /
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ✅ API routes
app.use('/api/properties', propertyRoutes);
app.use('/api/auth', authRoutes);

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error('Internal error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ✅ Cloudinary config verification (wrapped in async function)
const verifyCloudinary = async () => {
  try {
    await cloudinary.api.ping();
    console.log('✅ Cloudinary verified');
  } catch (error) {
    console.error('❌ Cloudinary error:', error);
    process.exit(1);
  }
};

verifyCloudinary();

export default app;

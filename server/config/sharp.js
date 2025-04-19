import sharp from 'sharp';

// Configure Sharp for production environment
if (process.env.NODE_ENV === 'production') {
  sharp.concurrency(1);
  sharp.cache(false);
}

// Helper function for image optimization
export const optimizeImage = async (buffer, options = {}) => {
  const {
    width = 1200,
    height = 800,
    fit = 'inside',
    format = 'jpeg',
    quality = 80
  } = options;

  try {
    const image = sharp(buffer);
    
    return await image
      .resize(width, height, { fit })
      [format]({ quality })
      .toBuffer();
  } catch (error) {
    console.error('Image optimization error:', error);
    return buffer; // Return original buffer if optimization fails
  }
};

export default sharp;

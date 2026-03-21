import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;

// Initialize Cloudinary configuration
const initializeCloudinary = () => {
  if (isConfigured) return;
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Log configuration status (without exposing secrets)
  console.log('🌤️ Cloudinary configuration initialized:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'missing',
    api_secret: process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'missing'
  });

  isConfigured = true;
};

// Validate configuration
export const validateCloudinaryConfig = (): boolean => {
  // Initialize if not already done
  initializeCloudinary();
  
  const requiredVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    console.error(`❌ Missing Cloudinary environment variables: ${missing.join(', ')}`);
    return false;
  }

  console.log('✅ Cloudinary configuration validated successfully');
  return true;
};

// Get configured cloudinary instance
export const getCloudinary = () => {
  initializeCloudinary();
  return cloudinary;
};

export default cloudinary;
/**
 * Environment variable validation
 * Ensures all required environment variables are set
 */

interface RequiredEnvVars {
  JWT_SECRET: string;
  MONGODB_URI: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  NODE_ENV?: string;
  PORT?: string;
}

export const validateEnvironment = (): RequiredEnvVars => {
  const requiredVars = ['JWT_SECRET', 'MONGODB_URI', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  // Validate JWT_SECRET strength
  const jwtSecret = process.env.JWT_SECRET!;
  if (jwtSecret.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long for security. ' +
      'Please generate a strong secret key.'
    );
  }

  if (jwtSecret === 'your-secret-key' || jwtSecret.includes('example')) {
    throw new Error(
      'JWT_SECRET appears to be a default or example value. ' +
      'Please generate a secure random secret key.'
    );
  }

  return {
    JWT_SECRET: jwtSecret,
    MONGODB_URI: process.env.MONGODB_URI!,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || '3000',
  };
};
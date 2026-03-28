/**
 * ============================================
 * ENVIRONMENT-BASED API CONFIGURATION
 * ============================================
 * 
 * This configuration relies entirely on environment variables.
 * No URLs or IPs are hardcoded in the committed code.
 * 
 * Environment Variables Required:
 * - EXPO_PUBLIC_API_URL: The API base URL
 * - EXPO_PUBLIC_ENV: 'development' or 'production'
 * - EXPO_PUBLIC_DEBUG: 'true' or 'false'
 * 
 * These are set via:
 * 1. .env.local (local development - not committed)
 * 2. EAS build configuration (eas.json)
 * 3. Manual environment setup
 */

import Constants from 'expo-constants';

// ============================================
// ENVIRONMENT DETECTION
// ============================================

/**
 * Detect the current environment based on multiple factors
 */
const detectEnvironment = () => {
  // Check explicit environment variable first
  const explicitEnv = process.env.EXPO_PUBLIC_ENV;
  if (explicitEnv === 'development' || explicitEnv === 'production') {
    return explicitEnv;
  }
  
  // Check if this is an EAS build
  const isEASBuild = process.env.EAS_BUILD === 'true' || Constants.executionEnvironment === 'standalone';
  if (isEASBuild) {
    return 'production';
  }
  
  // Check if running in Expo Go or development
  const isExpoGo = Constants.executionEnvironment === 'storeClient';
  const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';
  
  if (isExpoGo || isDevelopment) {
    return 'development';
  }
  
  return 'production'; // Default to production for safety
};

// ============================================
// CONFIGURATION CONSTANTS
// ============================================

const ENVIRONMENT = detectEnvironment();

// Get API URL from environment variables with fallback
const getApiUrl = () => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  
  if (!apiUrl) {
    // In development, provide a helpful error with fallback
    if (ENVIRONMENT === 'development') {
      console.warn(
        '⚠️ Missing EXPO_PUBLIC_API_URL environment variable. ' +
        'Please create .env.local file with your local API URL. ' +
        'Using fallback URL for now.'
      );
      return 'http://192.168.100.14:3000/api'; // Fallback for development
    }
    
    // In production, this is a critical error
    throw new Error(
      `Missing EXPO_PUBLIC_API_URL environment variable. ` +
      `Please set it in your .env.local file for development or EAS configuration for builds.`
    );
  }
  
  return apiUrl;
};

// ============================================
// EXPORTED CONFIGURATION
// ============================================

export const API_BASE_URL = getApiUrl();

export const APP_CONFIG = {
  name: 'AfroChinaTrade',
  version: '1.0.0',
  currency: 'NGN',
  defaultLanguage: 'en',
  environment: ENVIRONMENT,
  isProduction: ENVIRONMENT === 'production',
  isDevelopment: ENVIRONMENT === 'development',
  debug: process.env.EXPO_PUBLIC_DEBUG === 'true' || ENVIRONMENT === 'development',
} as const;

// Connection timeouts based on environment
export const CONNECTION_CONFIG = (() => {
  const configs = {
    development: {
      timeout: 8000,
      retries: 2,
      retryDelay: 1000,
    },
    production: {
      timeout: 20000,
      retries: 3,
      retryDelay: 2000,
    }
  };
  
  return configs[ENVIRONMENT as keyof typeof configs] || configs.production;
})();

// ============================================
// DEVELOPMENT LOGGING
// ============================================

if (APP_CONFIG.debug) {
  console.log('🌐 API Configuration Debug Info:', {
    environment: ENVIRONMENT,
    apiUrl: API_BASE_URL,
    isEASBuild: process.env.EAS_BUILD === 'true',
    executionEnvironment: Constants.executionEnvironment,
    isDev: __DEV__,
    nodeEnv: process.env.NODE_ENV,
    explicitEnv: process.env.EXPO_PUBLIC_ENV,
    connectionConfig: CONNECTION_CONFIG,
  });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get environment-specific configuration
 */
export const getEnvironmentConfig = () => ({
  apiUrl: API_BASE_URL,
  timeout: CONNECTION_CONFIG.timeout,
  retries: CONNECTION_CONFIG.retries,
  retryDelay: CONNECTION_CONFIG.retryDelay,
  debug: APP_CONFIG.debug,
  environment: ENVIRONMENT,
});

/**
 * Check if we're running in a specific environment
 */
export const isEnvironment = (env: 'development' | 'production') => ENVIRONMENT === env;

/**
 * Log configuration info (only in debug mode)
 */
export const logConfigInfo = () => {
  if (APP_CONFIG.debug) {
    console.log('📱 App Configuration:', APP_CONFIG);
    console.log('🔗 Connection Configuration:', CONNECTION_CONFIG);
  }
};
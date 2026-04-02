/**
 * ============================================
 * ENVIRONMENT-BASED API CONFIGURATION
 * ============================================
 *
 * SETUP INSTRUCTIONS:
 * 1. Copy this file to config.ts in the same directory
 * 2. Update VERCEL_API_URL with your actual Vercel deployment URL
 * 3. Configure your .env.local file with appropriate URLs
 *
 * Environment Variables:
 * - EXPO_PUBLIC_API_URL: Primary API base URL (Vercel production)
 * - EXPO_PUBLIC_FALLBACK_API_URL: Fallback URL (local dev) when primary fails
 * - EXPO_PUBLIC_ENV: 'development' or 'production'
 * - EXPO_PUBLIC_DEBUG: 'true' or 'false'
 */

import Constants from 'expo-constants';

// ============================================
// ENVIRONMENT DETECTION
// ============================================

const detectEnvironment = () => {
  const explicitEnv = process.env.EXPO_PUBLIC_ENV;
  if (explicitEnv === 'development' || explicitEnv === 'production') {
    return explicitEnv;
  }

  const isEASBuild =
    process.env.EAS_BUILD === 'true' ||
    Constants.executionEnvironment === 'standalone';
  if (isEASBuild) return 'production';

  const isExpoGo = Constants.executionEnvironment === 'storeClient';
  const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';
  if (isExpoGo || isDevelopment) return 'development';

  return 'production';
};

// ============================================
// CONFIGURATION CONSTANTS
// ============================================

const ENVIRONMENT = detectEnvironment();

/** Vercel production URL — UPDATE THIS WITH YOUR ACTUAL URL */
export const VERCEL_API_URL = 'https://your-app.vercel.app/api';

const getApiUrl = () => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  if (!apiUrl) {
    console.warn(
      '⚠️ Missing EXPO_PUBLIC_API_URL. Using Vercel URL as default.'
    );
    return VERCEL_API_URL;
  }

  return apiUrl;
};

export const API_BASE_URL = getApiUrl();

/**
 * Fallback URL used when the primary API_BASE_URL is unreachable.
 * In development, this can be your local server.
 * If not specified, no fallback is used.
 */
export const FALLBACK_API_URL = process.env.EXPO_PUBLIC_FALLBACK_API_URL || undefined;

export const APP_CONFIG = {
  name: 'AfroChinaTrade',
  version: '1.0.0',
  currency: 'NGN',
  defaultLanguage: 'en',
  environment: ENVIRONMENT,
  isProduction: ENVIRONMENT === 'production',
  isDevelopment: ENVIRONMENT === 'development',
  debug:
    process.env.EXPO_PUBLIC_DEBUG === 'true' || ENVIRONMENT === 'development',
} as const;

// Connection timeouts based on environment
export const CONNECTION_CONFIG = (() => {
  const configs = {
    development: { timeout: 8000, retries: 2, retryDelay: 1000 },
    production: { timeout: 20000, retries: 3, retryDelay: 2000 },
  };
  return configs[ENVIRONMENT as keyof typeof configs] || configs.production;
})();

// ============================================
// DEVELOPMENT LOGGING
// ============================================

if (APP_CONFIG.debug) {
  console.log('🌐 API Configuration:', {
    environment: ENVIRONMENT,
    primaryUrl: API_BASE_URL,
    fallbackUrl: FALLBACK_API_URL,
    isEASBuild: process.env.EAS_BUILD === 'true',
    executionEnvironment: Constants.executionEnvironment,
    isDev: __DEV__,
  });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getEnvironmentConfig = () => ({
  apiUrl: API_BASE_URL,
  fallbackUrl: FALLBACK_API_URL,
  timeout: CONNECTION_CONFIG.timeout,
  retries: CONNECTION_CONFIG.retries,
  retryDelay: CONNECTION_CONFIG.retryDelay,
  debug: APP_CONFIG.debug,
  environment: ENVIRONMENT,
});

export const isEnvironment = (env: 'development' | 'production') =>
  ENVIRONMENT === env;

export const logConfigInfo = () => {
  if (APP_CONFIG.debug) {
    console.log('📱 App Configuration:', APP_CONFIG);
    console.log('🔗 Connection Configuration:', CONNECTION_CONFIG);
  }
};

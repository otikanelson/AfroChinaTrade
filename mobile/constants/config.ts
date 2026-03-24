// ============================================
// API CONFIGURATION
// ============================================
// Update the URL below based on your setup:
// - For local dev with physical device: Use your computer's IP (e.g., 'http://192.168.95.202:3000/api')
// - For Android emulator: Use 'http://10.0.2.2:3000/api'
// - For iOS simulator: Use 'http://localhost:3000/api'
// - For EAS preview/production: This will be overridden by EXPO_PUBLIC_API_URL from eas.json

const LOCAL_DEV_API_URL = 'http://192.168.1.7:3000/api'; // <-- UPDATE THIS WHEN YOUR IP CHANGES

// Production API URL (used by EAS builds)
const PRODUCTION_API_URL = 'https://afro-china-trade.vercel.app/api';

// ============================================
// DO NOT MODIFY BELOW THIS LINE
// ============================================

// Demo mode configuration
export const DEMO_MODE = false; // Set to true for client demo build

// Determine API URL based on environment
// Priority: EXPO_PUBLIC_API_URL (from EAS) > LOCAL_DEV_API_URL
const easApiUrl = process.env.EXPO_PUBLIC_API_URL;

export const API_BASE_URL = easApiUrl || LOCAL_DEV_API_URL;

console.log('🌐 API Configuration:', {
  easApiUrl: easApiUrl || 'not set',
  localDevUrl: LOCAL_DEV_API_URL,
  finalUrl: API_BASE_URL,
  isProduction: !!easApiUrl
});

export const APP_CONFIG = {
  name: 'AfroChinaTrade',
  version: '1.0.0',
  currency: 'NGN',
  defaultLanguage: 'en',
} as const;

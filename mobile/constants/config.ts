// Development API URLs - choose the appropriate one for your setup
const DEV_URLS = {
  // Use this for Android emulator
  EMULATOR: 'http://10.0.2.2:3000/api',
  // Use this for physical device on same WiFi network (192.168.100.14)
  WIFI: 'http://192.168.100.14:3000/api',
  // Use this for iOS simulator
  IOS_SIMULATOR: 'http://localhost:3000/api',
};

// Production API URL (Vercel deployment)
const PRODUCTION_URL = 'https://afro-china-trade.vercel.app/api';

// Demo mode configuration
export const DEMO_MODE = false; // Set to true for client demo build

// Current configuration - using Vercel cloud backend for production
export const API_BASE_URL = PRODUCTION_URL;

export const APP_CONFIG = {
  name: 'AfroChinaTrade',
  version: '1.0.0',
  currency: 'NGN',
  defaultLanguage: 'en',
} as const;

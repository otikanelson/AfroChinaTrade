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

// Determine API URL based on environment
// Use app.json extra.apiUrl if available (set by EAS), otherwise use local dev URL
import Constants from 'expo-constants';

const appExtra = Constants.expoConfig?.extra as any;
const configApiUrl = appExtra?.apiUrl;

export const API_BASE_URL = configApiUrl || DEV_URLS.WIFI;

export const APP_CONFIG = {
  name: 'AfroChinaTrade',
  version: '1.0.0',
  currency: 'NGN',
  defaultLanguage: 'en',
} as const;

/**
 * ============================================
 * ENVIRONMENT-BASED API CONFIGURATION
 * ============================================
 *
 * ADMIN PANEL NOW USES PRODUCTION API DIRECTLY
 * This ensures we see real users and data from the mobile app
 */

export const VERCEL_API_URL = 'https://afro-china-trade.vercel.app/api'

/**
 * Admin panel uses production API to access the same database as mobile app
 */
export const ENVIRONMENT: 'development' | 'production' = import.meta.env.PROD
  ? 'production'
  : 'development'

// Always use production API URL
export const API_BASE_URL: string = VERCEL_API_URL

export const FALLBACK_API_URL: string = VERCEL_API_URL

export const APP_CONFIG = {
  name: 'AfroChinaTrade Admin',
  version: '1.0.0',
  environment: ENVIRONMENT,
  isProduction: ENVIRONMENT === 'production',
  isDevelopment: ENVIRONMENT === 'development',
  debug: true, // Always enable debug for now
} as const

export const CONNECTION_CONFIG = import.meta.env.PROD
  ? { timeout: 20_000, retries: 3, retryDelay: 2_000 }
  : { timeout: 8_000, retries: 2, retryDelay: 1_000 }

if (APP_CONFIG.debug) {
  console.log('🌐 Admin API Configuration:', {
    environment: ENVIRONMENT,
    primaryUrl: API_BASE_URL,
    fallbackUrl: FALLBACK_API_URL,
  })
}

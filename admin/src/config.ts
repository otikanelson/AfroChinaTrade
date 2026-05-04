/**
 * ============================================
 * ENVIRONMENT-BASED API CONFIGURATION
 * ============================================
 *
 * .env (gitignored, never committed):
 *   VITE_API_URL=http://localhost:3001/api          ← local backend
 *   VITE_FALLBACK_API_URL=https://afro-china-trade.vercel.app/api
 *
 * In production builds (import.meta.env.PROD = true) there is no local
 * server, so we always use the Vercel backend directly.
 */

export const VERCEL_API_URL = 'https://afro-china-trade.vercel.app/api'

/**
 * import.meta.env.PROD is injected by Vite at build time:
 *   - `vite dev`   → false  (development)
 *   - `vite build` → true   (production)
 *
 * In dev:  use VITE_API_URL (local backend), fall back to Vercel if unreachable.
 * In prod: always use Vercel directly — no proxy, no local server.
 */
export const ENVIRONMENT: 'development' | 'production' = import.meta.env.PROD
  ? 'production'
  : 'development'

export const API_BASE_URL: string = import.meta.env.PROD
  ? VERCEL_API_URL
  : '/api'   // In dev, use Vite proxy — avoids CORS entirely

export const FALLBACK_API_URL: string = VERCEL_API_URL

export const APP_CONFIG = {
  name: 'AfroChinaTrade Admin',
  version: '1.0.0',
  environment: ENVIRONMENT,
  isProduction: ENVIRONMENT === 'production',
  isDevelopment: ENVIRONMENT === 'development',
  debug: !import.meta.env.PROD,
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

/**
 * Connection utilities with automatic fallback to Vercel when local fails.
 */

import {
  API_BASE_URL,
  FALLBACK_API_URL,
  CONNECTION_CONFIG,
  APP_CONFIG,
} from '../constants/config';

export interface ConnectionTestResult {
  success: boolean;
  responseTime: number;
  url?: string;
  error?: string;
  isColdStart?: boolean;
  usedFallback?: boolean;
  environment?: string;
}

// ─── Internal helpers ────────────────────────────────────────────────────────

const pingUrl = async (baseUrl: string, timeoutMs: number): Promise<number> => {
  const start = Date.now();
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return Date.now() - start;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Resolves the best available API URL.
 * Tries the primary URL first; if it fails, falls back to FALLBACK_API_URL.
 * Returns the URL that succeeded, or the fallback URL if both fail.
 */
export const resolveApiUrl = async (): Promise<{
  url: string;
  usedFallback: boolean;
}> => {
  // If primary and fallback are the same (e.g. production build), skip the probe
  if (API_BASE_URL === FALLBACK_API_URL) {
    return { url: API_BASE_URL, usedFallback: false };
  }

  try {
    await pingUrl(API_BASE_URL, CONNECTION_CONFIG.timeout);
    if (APP_CONFIG.debug) console.log('✅ Primary API reachable:', API_BASE_URL);
    return { url: API_BASE_URL, usedFallback: false };
  } catch {
    if (APP_CONFIG.debug)
      console.warn(
        `⚠️ Primary API unreachable (${API_BASE_URL}). Switching to fallback: ${FALLBACK_API_URL}`
      );
    return { url: FALLBACK_API_URL, usedFallback: true };
  }
};

/**
 * Test connection with retry logic.
 * Tries primary URL; on failure automatically retries with fallback.
 */
export const testConnectionWithRetry = async (
  maxAttempts?: number,
  timeoutMs?: number
): Promise<ConnectionTestResult> => {
  const attempts = maxAttempts || CONNECTION_CONFIG.retries;
  const timeout = timeoutMs || CONNECTION_CONFIG.timeout;

  const urls =
    API_BASE_URL !== FALLBACK_API_URL
      ? [API_BASE_URL, FALLBACK_API_URL]
      : [API_BASE_URL];

  for (const url of urls) {
    let lastError = '';

    for (let attempt = 1; attempt <= attempts; attempt++) {
      if (APP_CONFIG.debug)
        console.log(`🔄 Attempt ${attempt}/${attempts} → ${url}/health`);

      try {
        const responseTime = await pingUrl(url, timeout);
        if (APP_CONFIG.debug)
          console.log(`✅ Connected to ${url} in ${responseTime}ms`);

        return {
          success: true,
          responseTime,
          url,
          isColdStart: responseTime > 5000,
          usedFallback: url === FALLBACK_API_URL && url !== API_BASE_URL,
          environment: APP_CONFIG.environment,
        };
      } catch (err: any) {
        lastError = err?.message || 'Network error';
        if (APP_CONFIG.debug)
          console.warn(`❌ Attempt ${attempt} failed for ${url}: ${lastError}`);

        if (attempt < attempts) {
          await new Promise((r) =>
            setTimeout(r, CONNECTION_CONFIG.retryDelay)
          );
        }
      }
    }

    if (APP_CONFIG.debug)
      console.warn(`⛔ All attempts failed for ${url}. Last error: ${lastError}`);
  }

  return {
    success: false,
    responseTime: 0,
    error: 'All endpoints unreachable',
    environment: APP_CONFIG.environment,
  };
};

/** Quick single-attempt connection test against the primary URL. */
export const quickConnectionTest = async (): Promise<boolean> => {
  try {
    await pingUrl(API_BASE_URL, Math.floor(CONNECTION_CONFIG.timeout / 2));
    return true;
  } catch {
    return false;
  }
};

/** User-friendly error message based on environment and error type. */
export const getConnectionErrorMessage = (
  result: ConnectionTestResult
): string => {
  if (result.success) return '';

  const isDev = APP_CONFIG.isDevelopment;

  if (result.error?.includes('timeout') || result.error?.includes('Abort')) {
    return isDev
      ? 'Cannot connect to local server. Make sure your backend is running and the IP is correct.'
      : 'The server is starting up (10–15 s). Please try again in a moment.';
  }

  if (result.error?.includes('Network') || result.error?.includes('unreachable')) {
    return isDev
      ? 'Network error. Check that your device and computer are on the same network.'
      : 'Please check your internet connection and try again.';
  }

  return isDev
    ? 'Development server connection failed. Check your local backend and network settings.'
    : 'Unable to connect to the server. Please try again later.';
};

/** Fire-and-forget server warm-up. */
export const warmUpServer = async (): Promise<void> => {
  if (APP_CONFIG.debug) console.log('🔥 Warming up server...');
  fetch(`${API_BASE_URL}/health`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {});
};

export const logConnectionConfig = () => {
  if (APP_CONFIG.debug) {
    console.log('🔗 Connection Configuration:', {
      primaryUrl: API_BASE_URL,
      fallbackUrl: FALLBACK_API_URL,
      environment: APP_CONFIG.environment,
      timeout: CONNECTION_CONFIG.timeout,
      retries: CONNECTION_CONFIG.retries,
      retryDelay: CONNECTION_CONFIG.retryDelay,
    });
  }
};

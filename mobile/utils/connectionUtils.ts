/**
 * Connection utilities for handling environment-specific networking
 */

import { API_BASE_URL, CONNECTION_CONFIG, APP_CONFIG } from '../constants/config';

export interface ConnectionTestResult {
  success: boolean;
  responseTime: number;
  error?: string;
  isColdStart?: boolean;
  environment?: string;
}

/**
 * Test connection with environment-specific retry logic
 */
export const testConnectionWithRetry = async (
  maxAttempts?: number,
  timeoutMs?: number
): Promise<ConnectionTestResult> => {
  const attempts = maxAttempts || CONNECTION_CONFIG.retries;
  const timeout = timeoutMs || CONNECTION_CONFIG.timeout;
  
  let currentAttempt = 0;
  let lastError: string = '';
  
  while (currentAttempt < attempts) {
    currentAttempt++;
    const startTime = Date.now();
    
    try {
      if (APP_CONFIG.debug) {
        console.log(`🔄 Connection attempt ${currentAttempt}/${attempts} to ${API_BASE_URL}/health`);
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        
        if (APP_CONFIG.debug) {
          console.log(`✅ Connection successful (${responseTime}ms):`, data);
        }
        
        return {
          success: true,
          responseTime,
          isColdStart: responseTime > 5000,
          environment: APP_CONFIG.environment,
        };
      } else {
        lastError = `HTTP ${response.status}: ${response.statusText}`;
        if (APP_CONFIG.debug) {
          console.warn(`⚠️ Connection failed (attempt ${currentAttempt}): ${lastError}`);
        }
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      lastError = error.message || 'Network error';
      
      if (APP_CONFIG.debug) {
        console.error(`❌ Connection error (attempt ${currentAttempt}, ${responseTime}ms):`, lastError);
      }
      
      // If it's a timeout and we have more attempts, wait before retrying
      if ((error.name === 'AbortError' || error.name === 'TimeoutError') && currentAttempt < attempts) {
        if (APP_CONFIG.debug) {
          console.log(`🔄 Timeout detected, waiting ${CONNECTION_CONFIG.retryDelay}ms before retry...`);
        }
        await new Promise(resolve => setTimeout(resolve, CONNECTION_CONFIG.retryDelay));
        continue;
      }
    }
    
    // Wait between attempts (except for the last one)
    if (currentAttempt < attempts) {
      const waitTime = CONNECTION_CONFIG.retryDelay;
      if (APP_CONFIG.debug) {
        console.log(`⏳ Waiting ${waitTime}ms before next attempt...`);
      }
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  return {
    success: false,
    responseTime: 0,
    error: lastError,
    environment: APP_CONFIG.environment,
  };
};

/**
 * Quick connection test (single attempt)
 */
export const quickConnectionTest = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(CONNECTION_CONFIG.timeout / 2),
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Get user-friendly connection error message based on environment
 */
export const getConnectionErrorMessage = (result: ConnectionTestResult): string => {
  if (result.success) return '';
  
  const isDev = APP_CONFIG.isDevelopment;
  
  if (result.error?.includes('timeout') || result.error?.includes('AbortError')) {
    if (isDev) {
      return 'Cannot connect to local development server. Make sure your backend is running and the IP address is correct.';
    } else {
      return 'The server is starting up (this can take 10-15 seconds). Please try again in a moment.';
    }
  }
  
  if (result.error?.includes('Network')) {
    if (isDev) {
      return 'Network error. Check that your device and computer are on the same network.';
    } else {
      return 'Please check your internet connection and try again.';
    }
  }
  
  if (isDev) {
    return `Development server connection failed. Check your local backend server and network settings.`;
  }
  
  return 'Unable to connect to the server. Please try again later.';
};

/**
 * Warm up the server (call this proactively)
 */
export const warmUpServer = async (): Promise<void> => {
  if (APP_CONFIG.debug) {
    console.log('🔥 Warming up server...');
  }
  
  try {
    // Fire and forget - don't wait for response
    fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {
      // Ignore errors - this is just a warm-up
    });
  } catch {
    // Ignore errors
  }
};

/**
 * Log current connection configuration (debug only)
 */
export const logConnectionConfig = () => {
  if (APP_CONFIG.debug) {
    console.log('🔗 Connection Configuration:', {
      apiUrl: API_BASE_URL,
      environment: APP_CONFIG.environment,
      timeout: CONNECTION_CONFIG.timeout,
      retries: CONNECTION_CONFIG.retries,
      retryDelay: CONNECTION_CONFIG.retryDelay,
    });
  }
};
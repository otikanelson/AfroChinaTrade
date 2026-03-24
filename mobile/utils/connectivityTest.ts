/**
 * Connectivity test utility for verifying backend connection
 */

import { API_BASE_URL } from '../constants/config';

export interface ConnectivityTestResult {
  success: boolean;
  url: string;
  responseTime?: number;
  error?: string;
  status?: number;
}

export const testBackendConnectivity = async (): Promise<ConnectivityTestResult> => {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Testing backend connectivity to:', API_BASE_URL);
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout for mobile networks
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      console.log('✅ Backend connectivity test passed:', {
        url: API_BASE_URL,
        status: response.status,
        responseTime: `${responseTime}ms`
      });
      
      return {
        success: true,
        url: API_BASE_URL,
        responseTime,
        status: response.status,
      };
    } else {
      console.warn('⚠️ Backend responded with error status:', response.status);
      
      return {
        success: false,
        url: API_BASE_URL,
        responseTime,
        status: response.status,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    console.error('❌ Backend connectivity test failed:', {
      url: API_BASE_URL,
      error: error.message,
      responseTime: `${responseTime}ms`
    });
    
    return {
      success: false,
      url: API_BASE_URL,
      responseTime,
      error: error.message || 'Network error',
    };
  }
};

export const logConnectivityInfo = () => {
  console.log('📱 App Connectivity Info:', {
    apiBaseUrl: API_BASE_URL,
    isEasBuild: !!process.env.EAS_BUILD,
    expoPublicApiUrl: process.env.EXPO_PUBLIC_API_URL || 'not set',
    nodeEnv: process.env.NODE_ENV || 'not set',
  });
};
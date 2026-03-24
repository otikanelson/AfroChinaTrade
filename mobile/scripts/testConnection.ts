/**
 * Simple script to test backend connectivity
 * Run this to verify the app can connect to the Vercel backend
 */

import { API_BASE_URL } from '../constants/config';

export const testConnection = async () => {
  console.log('🔍 Testing connection to:', API_BASE_URL);
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 10 second timeout
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Connection successful:', data);
      return { success: true, data };
    } else {
      console.error('❌ Connection failed:', response.status, response.statusText);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error: any) {
    console.error('❌ Connection error:', error.message);
    return { success: false, error: error.message };
  }
};

// Auto-run test when imported
testConnection();
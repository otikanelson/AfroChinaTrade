#!/usr/bin/env node

/**
 * Script to clear all authentication tokens and user data from AsyncStorage
 * This forces users to login again with fresh tokens
 */

const AsyncStorage = require('@react-native-async-storage/async-storage');

async function clearAllAuthData() {
  try {
    console.log('🧹 Clearing all authentication data...');
    
    const keysToRemove = [
      '@auth_tokens',
      '@afrochinatrade:auth_user',
      '@last_activity',
    ];
    
    await AsyncStorage.multiRemove(keysToRemove);
    console.log('✅ All authentication data cleared successfully');
    console.log('📱 Users will need to login again');
    
  } catch (error) {
    console.error('❌ Failed to clear authentication data:', error);
  }
}

if (require.main === module) {
  clearAllAuthData();
}

module.exports = { clearAllAuthData };
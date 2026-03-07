/**
 * Patch for jest-expo ~52 compatibility with React Native 0.81+
 * UIManager is no longer a plain object in RN 0.81, which causes
 * Object.defineProperty to fail in jest-expo's setup.js.
 */
'use strict';

// Ensure UIManager is a plain object so jest-expo can define properties on it
try {
  const NativeModules = require('react-native/Libraries/BatchedBridge/NativeModules');
  if (NativeModules && typeof NativeModules.UIManager !== 'object') {
    NativeModules.UIManager = {};
  }
  if (NativeModules && NativeModules.UIManager === null) {
    NativeModules.UIManager = {};
  }
} catch (e) {
  // ignore
}

/**
 * Initialize toast notification system for mobile app
 * Call this in your app entry point (App.tsx)
 */

import { mobileToastManager } from './toast';

/**
 * Initialize the mobile toast manager
 * This sets up the toast system for the mobile app
 * Should be called once during app initialization
 */
export function initToast(): void {
  // Mobile toast manager is already initialized
  console.log('Toast manager initialized for mobile app');
}

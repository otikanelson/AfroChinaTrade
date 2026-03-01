/**
 * Initialize toast notification system for mobile app
 * Call this in your app entry point (App.tsx)
 */

import { setToastManager } from '../../../shared/src/utils/toast';
import { mobileToastManager } from './toast';

/**
 * Initialize the mobile toast manager
 * Should be called once during app initialization
 */
export function initToast(): void {
  setToastManager(mobileToastManager);
}

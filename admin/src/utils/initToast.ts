/**
 * Initialize toast notification system for admin dashboard
 * Call this in your app entry point (main.tsx or App.tsx)
 */

import { setToastManager } from '../../../shared/src/utils/toast';
import { webToastManager } from './toast';

/**
 * Initialize the web toast manager
 * Should be called once during app initialization
 */
export function initToast(): void {
  setToastManager(webToastManager);
}

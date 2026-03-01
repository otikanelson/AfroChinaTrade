/**
 * Toast notification system for displaying errors and messages
 * Platform-agnostic interface that can be implemented for web and mobile
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  type: ToastType;
  message: string;
  duration?: number;
  title?: string;
}

/**
 * Toast manager interface
 * Platform-specific implementations should implement this interface
 */
export interface ToastManager {
  show(options: ToastOptions): void;
  success(message: string, title?: string): void;
  error(message: string, title?: string): void;
  warning(message: string, title?: string): void;
  info(message: string, title?: string): void;
}

/**
 * Default toast manager implementation (console-based fallback)
 */
class ConsoleToastManager implements ToastManager {
  show(options: ToastOptions): void {
    const prefix = options.title ? `[${options.title}] ` : '';
    const typePrefix = `[${options.type.toUpperCase()}] `;
    console.log(typePrefix + prefix + options.message);
  }

  success(message: string, title?: string): void {
    this.show({ type: 'success', message, title });
  }

  error(message: string, title?: string): void {
    this.show({ type: 'error', message, title });
  }

  warning(message: string, title?: string): void {
    this.show({ type: 'warning', message, title });
  }

  info(message: string, title?: string): void {
    this.show({ type: 'info', message, title });
  }
}

/**
 * Global toast manager instance
 * Can be replaced with platform-specific implementation
 */
let toastManager: ToastManager = new ConsoleToastManager();

/**
 * Sets the global toast manager implementation
 * Should be called during app initialization with platform-specific implementation
 */
export function setToastManager(manager: ToastManager): void {
  toastManager = manager;
}

/**
 * Gets the current toast manager instance
 */
export function getToastManager(): ToastManager {
  return toastManager;
}

/**
 * Convenience functions for showing toasts
 */
export const toast = {
  show: (options: ToastOptions) => toastManager.show(options),
  success: (message: string, title?: string) => toastManager.success(message, title),
  error: (message: string, title?: string) => toastManager.error(message, title),
  warning: (message: string, title?: string) => toastManager.warning(message, title),
  info: (message: string, title?: string) => toastManager.info(message, title),
};

/**
 * Helper function to show error from ServiceError or Error object
 */
export function showErrorToast(error: Error | string, title?: string): void {
  const message = typeof error === 'string' ? error : error.message;
  toast.error(message, title || 'Error');
}

/**
 * Helper function to show success message
 */
export function showSuccessToast(message: string, title?: string): void {
  toast.success(message, title || 'Success');
}

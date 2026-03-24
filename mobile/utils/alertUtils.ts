/**
 * Alert utility functions that work with the custom alert system.
 * These are designed to be drop-in replacements for React Native's Alert.alert()
 * 
 * Usage:
 * Instead of: Alert.alert('Title', 'Message')
 * Use: alertUtils.alert('Title', 'Message')
 * 
 * Note: These functions require the AlertProvider to be set up in your app root.
 */

// import { AlertType, AlertButton } from '../components/ui/CustomAlert';

// Define types locally since CustomAlert is not available
type AlertType = 'info' | 'success' | 'warning' | 'error';
type AlertButton = {
  text: string;
  onPress?: () => void;
  style: 'default' | 'cancel' | 'destructive';
};

// This will be set by the app when AlertProvider is initialized
let alertFunction: ((
  title: string,
  message?: string,
  buttons?: AlertButton[],
  type?: AlertType,
  autoClose?: number
) => void) | null = null;

export const setAlertFunction = (fn: typeof alertFunction) => {
  alertFunction = fn;
};

/**
 * Show a basic alert
 * @param title - Alert title
 * @param message - Alert message
 * @param buttons - Array of buttons (optional)
 */
export const alert = (
  title: string,
  message?: string,
  buttons?: AlertButton[]
) => {
  if (!alertFunction) {
    console.warn('Alert function not initialized. Make sure AlertProvider is set up.');
    return;
  }
  alertFunction(title, message, buttons, 'info', 0);
};

/**
 * Show a success alert
 * @param title - Alert title
 * @param message - Alert message
 * @param autoClose - Auto close after milliseconds (default: 2000)
 */
export const success = (
  title: string,
  message?: string,
  autoClose: number = 2000
) => {
  if (!alertFunction) {
    console.warn('Alert function not initialized. Make sure AlertProvider is set up.');
    return;
  }
  alertFunction(title, message, [{ text: 'OK', style: 'default' }], 'success', autoClose);
};

/**
 * Show an error alert
 * @param title - Alert title
 * @param message - Alert message
 */
export const error = (title: string, message?: string) => {
  if (!alertFunction) {
    console.warn('Alert function not initialized. Make sure AlertProvider is set up.');
    return;
  }
  alertFunction(title, message, [{ text: 'OK', style: 'default' }], 'error', 0);
};

/**
 * Show a warning alert
 * @param title - Alert title
 * @param message - Alert message
 */
export const warning = (title: string, message?: string) => {
  if (!alertFunction) {
    console.warn('Alert function not initialized. Make sure AlertProvider is set up.');
    return;
  }
  alertFunction(title, message, [{ text: 'OK', style: 'default' }], 'warning', 0);
};

/**
 * Show a confirmation dialog
 * @param title - Dialog title
 * @param message - Dialog message
 * @param onConfirm - Callback when confirmed
 * @param onCancel - Callback when cancelled
 * @param confirmText - Text for confirm button
 * @param cancelText - Text for cancel button
 */
export const confirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText: string = 'Confirm',
  cancelText: string = 'Cancel'
) => {
  if (!alertFunction) {
    console.warn('Alert function not initialized. Make sure AlertProvider is set up.');
    return;
  }
  alertFunction(
    title,
    message,
    [
      { text: cancelText, style: 'cancel', onPress: onCancel },
      { text: confirmText, style: 'default', onPress: onConfirm },
    ],
    'info',
    0
  );
};

/**
 * Show a destructive confirmation dialog (for delete operations)
 * @param title - Dialog title
 * @param message - Dialog message
 * @param onConfirm - Callback when confirmed
 * @param onCancel - Callback when cancelled
 * @param confirmText - Text for confirm button
 * @param cancelText - Text for cancel button
 */
export const destructiveConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText: string = 'Delete',
  cancelText: string = 'Cancel'
) => {
  if (!alertFunction) {
    console.warn('Alert function not initialized. Make sure AlertProvider is set up.');
    return;
  }
  alertFunction(
    title,
    message,
    [
      { text: cancelText, style: 'cancel', onPress: onCancel },
      { text: confirmText, style: 'destructive', onPress: onConfirm },
    ],
    'warning',
    0
  );
};

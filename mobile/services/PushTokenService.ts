import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import apiClient from './api/apiClient';

class PushTokenService {
  private deviceId: string | null = null;

  /**
   * Register push token with the backend
   * - Requests OS permission via expo-notifications
   * - Skips silently if permission denied
   * - Skips with console warning if running in Expo Go
   * - Obtains Expo push token
   * - Calls POST /api/push-tokens with { token, deviceId, platform }
   */
  async register(): Promise<void> {
    try {
      // Check if running in Expo Go
      if (Constants.appOwnership === 'expo') {
        console.warn('⚠️ Push notifications are not supported in Expo Go. Skipping token registration.');
        return;
      }

      // Check if device is physical (push notifications don't work on simulators)
      if (!Device.isDevice) {
        console.warn('⚠️ Push notifications only work on physical devices. Skipping token registration.');
        return;
      }

      // Request permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // If permission denied, skip silently
      if (finalStatus !== 'granted') {
        console.log('📵 Push notification permission denied. Skipping token registration.');
        return;
      }

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      const token = tokenData.data;

      // Get device ID
      const deviceId = this.getDeviceId();

      // Get platform
      const platform = Device.osName === 'iOS' ? 'ios' : 'android';

      // Register with backend
      await apiClient.post('/push-tokens', {
        token,
        deviceId,
        platform,
      });

      console.log('✅ Push token registered successfully');
    } catch (error: any) {
      console.warn('⚠️ Failed to register push token:', error.message);
      // Don't throw - registration failure should not block app flow
    }
  }

  /**
   * Unregister push token from the backend
   * - Calls DELETE /api/push-tokens with current token
   * - Logs warning on failure but does not throw
   */
  async unregister(): Promise<void> {
    try {
      // Check if running in Expo Go or simulator
      if (Constants.appOwnership === 'expo' || !Device.isDevice) {
        return;
      }

      // Get current token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      const token = tokenData.data;

      // Remove from backend
      await apiClient.delete('/push-tokens', {
        data: { token },
      });

      console.log('✅ Push token unregistered successfully');
    } catch (error: any) {
      console.warn('⚠️ Failed to unregister push token:', error.message);
      // Don't throw - unregistration failure should not block logout
    }
  }

  /**
   * Get stable device identifier via expo-device
   * @returns Stable device identifier string
   */
  getDeviceId(): string {
    if (this.deviceId) {
      return this.deviceId;
    }

    // Use a combination of device properties to create a stable ID
    // Device.osBuildId is the most stable identifier available
    const buildId = Device.osBuildId || 'unknown';
    const modelName = Device.modelName || 'unknown';
    const osVersion = Device.osVersion || 'unknown';

    // Create a stable identifier
    this.deviceId = `${buildId}-${modelName}-${osVersion}`.replace(/\s+/g, '-');

    return this.deviceId;
  }
}

export const pushTokenService = new PushTokenService();
export default pushTokenService;

import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = '@afrochinatrade:access_token';
const REFRESH_TOKEN_KEY = '@afrochinatrade:refresh_token';

interface TokenPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isInitialized = false;
  private expiryWarningCallback: ((expiresIn: number) => void) | null = null;
  private tokenExpiredCallback: (() => void) | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private warningShown = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      const [accessToken, refreshToken] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(REFRESH_TOKEN_KEY)
      ]);
      
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.isInitialized = true;
      
      console.log('🔐 Token manager initialized:', {
        hasAccessToken: !!this.accessToken,
        hasRefreshToken: !!this.refreshToken
      });

      // Start monitoring token expiry
      if (this.accessToken) {
        this.startExpiryMonitoring();
      }
    } catch (error) {
      console.error('Failed to initialize token manager:', error);
      this.isInitialized = true;
    }
  }

  async setTokens(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      this.accessToken = accessToken;
      if (refreshToken) {
        this.refreshToken = refreshToken;
      }

      const promises = [AsyncStorage.setItem(TOKEN_KEY, accessToken)];
      if (refreshToken) {
        promises.push(AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken));
      }

      await Promise.all(promises);
      console.log('✅ Tokens saved successfully');

      // Reset warning flag and restart monitoring
      this.warningShown = false;
      this.startExpiryMonitoring();
    } catch (error) {
      console.error('Failed to save tokens:', error);
      throw error;
    }
  }

  async getAccessToken(): Promise<string | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  isAuthenticated(): boolean {
    if (!this.accessToken) return false;
    
    // Check if token is expired
    const timeRemaining = this.getTimeUntilExpiry();
    return timeRemaining !== null && timeRemaining > 0;
  }

  async clearTokens(): Promise<void> {
    try {
      this.accessToken = null;
      this.refreshToken = null;
      this.warningShown = false;

      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(REFRESH_TOKEN_KEY)
      ]);
      
      console.log('🗑️ Tokens cleared');
      this.stopExpiryMonitoring();
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  // Decode token and get expiry time in milliseconds
  private getTokenExpiry(): number | null {
    if (!this.accessToken) return null;
    
    try {
      const decoded = jwtDecode<TokenPayload>(this.accessToken);
      return decoded.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  // Get time remaining until expiry in seconds
  getTimeUntilExpiry(): number | null {
    const expiry = this.getTokenExpiry();
    if (!expiry) return null;
    
    const now = Date.now();
    const secondsRemaining = Math.floor((expiry - now) / 1000);
    return secondsRemaining > 0 ? secondsRemaining : 0;
  }

  // Register callback for expiry warning (5 minutes before expiry)
  onExpiryWarning(callback: (expiresIn: number) => void): void {
    this.expiryWarningCallback = callback;
  }

  // Register callback for token expired
  onTokenExpired(callback: () => void): void {
    this.tokenExpiredCallback = callback;
  }

  // Start monitoring token expiry with interval checks
  private startExpiryMonitoring(): void {
    this.stopExpiryMonitoring();

    const expiry = this.getTokenExpiry();
    if (!expiry) {
      console.warn('⚠️ Could not determine token expiry time');
      return;
    }

    const now = Date.now();
    const timeUntilExpiry = expiry - now;

    console.log(`⏱️ Token expiry monitoring started:`, {
      expiresAt: new Date(expiry).toISOString(),
      now: new Date(now).toISOString(),
      secondsUntilExpiry: Math.floor(timeUntilExpiry / 1000)
    });

    // Check every 30 seconds for more reliable monitoring
    this.monitoringInterval = setInterval(() => {
      const remaining = this.getTimeUntilExpiry();
      
      if (remaining === null || remaining <= 0) {
        // Token expired
        console.error('🔴 Token has expired');
        this.stopExpiryMonitoring();
        if (this.tokenExpiredCallback) {
          this.tokenExpiredCallback();
        }
        return;
      }

      // Show warning at 10 minutes (600 seconds) for 1-hour tokens
      if (remaining <= 600 && !this.warningShown) {
        console.warn(`⏰ Token expiring in ${remaining} seconds`);
        this.warningShown = true;
        if (this.expiryWarningCallback) {
          this.expiryWarningCallback(remaining);
        }
      }
    }, 30000); // Check every 30 seconds

    // Also do an immediate check
    const immediateRemaining = this.getTimeUntilExpiry();
    if (immediateRemaining !== null && immediateRemaining <= 600 && !this.warningShown) {
      console.warn(`⏰ Token expiring in ${immediateRemaining} seconds (immediate check)`);
      this.warningShown = true;
      if (this.expiryWarningCallback) {
        this.expiryWarningCallback(immediateRemaining);
      }
    }
  }

  private stopExpiryMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}

export const tokenManager = new TokenManager();
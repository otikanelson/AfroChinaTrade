import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@afrochinatrade:access_token';
const REFRESH_TOKEN_KEY = '@afrochinatrade:refresh_token';

class SimpleTokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isInitialized = false;

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
    } catch (error) {
      console.error('Failed to initialize token manager:', error);
      this.isInitialized = true;
    }
  }

  async setTokens(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken || null;

      const promises = [AsyncStorage.setItem(TOKEN_KEY, accessToken)];
      if (refreshToken) {
        promises.push(AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken));
      }

      await Promise.all(promises);
      console.log('✅ Tokens saved successfully');
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
    return !!this.accessToken;
  }

  async clearTokens(): Promise<void> {
    try {
      this.accessToken = null;
      this.refreshToken = null;

      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(REFRESH_TOKEN_KEY)
      ]);
      
      console.log('🗑️ Tokens cleared');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }
}

export const tokenManager = new SimpleTokenManager();
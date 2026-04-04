import apiClient, { ApiResponse } from './api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Ad {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkPath?: string;
  linkParams?: Record<string, string>;
  isActive: boolean;
  displayOrder: number;
  placement: {
    home?: 'carousel' | 'tile';
    'buy-now'?: 'carousel' | 'tile';
    'product-detail'?: 'carousel' | 'tile';
    app?: 'splash';
  };
  // Splash ad specific fields
  splashFrequency?: 'once' | 'daily' | 'session' | 'always';
  splashDuration?: number; // Duration in milliseconds (default 3000)
}

class AdService {
  async getAds(placement?: 'home' | 'buy-now' | 'product-detail', adType?: 'carousel' | 'tile'): Promise<ApiResponse<Ad[]>> {
    const params: any = {};
    if (placement) params.placement = placement;
    if (adType) params.adType = adType;
    return apiClient.get<Ad[]>('/ads', { params });
  }

  async createAd(data: Partial<Ad>): Promise<ApiResponse<Ad>> {
    return apiClient.post<Ad>('/ads', data);
  }

  async updateAd(id: string, data: Partial<Ad>): Promise<ApiResponse<Ad>> {
    return apiClient.put<Ad>(`/ads/${id}`, data);
  }

  async deleteAd(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/ads/${id}`);
  }

  /**
   * Get splash ad (if available and should be shown)
   */
  async getSplashAd(): Promise<ApiResponse<Ad | null>> {
    try {
      // Check if we should show splash ad based on frequency
      const lastShown = await AsyncStorage.getItem('@splash_ad_last_shown');
      const lastShownDate = lastShown ? new Date(lastShown) : null;
      
      const response = await apiClient.get<Ad[]>('/ads', {
        params: {
          placement: 'app',
          adType: 'splash',
          active: true,
        },
      });

      if (response.success && response.data && response.data.length > 0) {
        const splashAd = response.data[0]; // Get the first active splash ad
        
        // Check frequency rules
        const shouldShow = await this.shouldShowSplashAd(splashAd, lastShownDate);
        
        if (shouldShow) {
          // Update last shown timestamp
          await AsyncStorage.setItem('@splash_ad_last_shown', new Date().toISOString());
          return { success: true, data: splashAd };
        }
      }

      return { success: true, data: null };
    } catch (error: any) {
      console.error('Error fetching splash ad:', error);
      return {
        success: false,
        error: {
          message: error.message || 'Failed to fetch splash ad',
          code: error.code,
        },
        data: null,
      };
    }
  }

  /**
   * Check if splash ad should be shown based on frequency settings
   */
  private async shouldShowSplashAd(ad: Ad, lastShownDate: Date | null): Promise<boolean> {
    if (!lastShownDate) {
      return true; // Never shown before
    }

    const now = new Date();
    const frequency = ad.splashFrequency || 'daily';

    switch (frequency) {
      case 'once':
        return false; // Only show once ever
      
      case 'daily':
        // Show once per day
        const daysSinceLastShown = Math.floor((now.getTime() - lastShownDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceLastShown >= 1;
      
      case 'session':
        // Show once per app session - check if app was backgrounded/foregrounded
        const sessionKey = '@splash_ad_session_shown';
        const sessionShown = await AsyncStorage.getItem(sessionKey);
        if (!sessionShown) {
          await AsyncStorage.setItem(sessionKey, 'true');
          return true;
        }
        return false;
      
      case 'always':
        return true; // Show every time
      
      default:
        return false;
    }
  }

  /**
   * Reset session flag (call this when app comes to foreground)
   */
  async resetSessionFlag(): Promise<void> {
    try {
      await AsyncStorage.removeItem('@splash_ad_session_shown');
    } catch (error) {
      console.error('Error resetting session flag:', error);
    }
  }

  /**
   * Mark splash ad as seen (for analytics)
   */
  async markSplashAdSeen(adId: string): Promise<void> {
    try {
      await apiClient.post(`/ads/${adId}/view`);
    } catch (error) {
      console.error('Error marking splash ad as seen:', error);
    }
  }
}

export const adService = new AdService();

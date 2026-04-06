import { router } from 'expo-router';
import React from 'react';

/**
 * Safe navigation utility to prevent navigation state corruption
 */
export class NavigationUtils {
  private static isNavigating = false;
  private static navigationTimeout: NodeJS.Timeout | null = null;

  /**
   * Safe navigation with debouncing to prevent rapid navigation calls
   */
  static safeNavigate(path: string, options?: { replace?: boolean; delay?: number }) {
    // Prevent rapid navigation calls
    if (this.isNavigating) {
      console.warn('Navigation already in progress, ignoring duplicate call');
      return;
    }

    this.isNavigating = true;

    // Clear any existing timeout
    if (this.navigationTimeout) {
      clearTimeout(this.navigationTimeout);
    }

    const navigate = () => {
      try {
        if (options?.replace) {
          router.replace(path as any);
        } else {
          router.push(path as any);
        }
      } catch (error) {
        console.error('Navigation error:', error);
      } finally {
        // Reset navigation flag after a short delay
        setTimeout(() => {
          this.isNavigating = false;
        }, 500);
      }
    };

    // Add optional delay for smoother transitions
    if (options?.delay) {
      this.navigationTimeout = setTimeout(navigate, options.delay);
    } else {
      navigate();
    }
  }

  /**
   * Safe back navigation with fallback
   */
  static safeGoBack(fallbackPath?: string) {
    try {
      if (router.canGoBack()) {
        router.back();
      } else if (fallbackPath) {
        this.safeNavigate(fallbackPath, { replace: true });
      } else {
        // Default fallback to home
        this.safeNavigate('/(tabs)/home', { replace: true });
      }
    } catch (error) {
      console.error('Back navigation error:', error);
      // Fallback to home on error
      this.safeNavigate('/(tabs)/home', { replace: true });
    }
  }

  /**
   * Reset navigation state
   */
  static reset() {
    this.isNavigating = false;
    if (this.navigationTimeout) {
      clearTimeout(this.navigationTimeout);
      this.navigationTimeout = null;
    }
  }
}

/**
 * Hook to handle component cleanup on navigation
 */
export const useNavigationCleanup = (cleanup: () => void) => {
  const router = require('expo-router').useRouter();
  
  React.useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      cleanup();
    };
  }, [cleanup]);
};
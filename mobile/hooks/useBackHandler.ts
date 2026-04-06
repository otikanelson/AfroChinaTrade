import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { NavigationUtils } from '../utils/navigationUtils';

/**
 * Hook to handle Android back button and prevent navigation issues
 */
export const useBackHandler = (onBack?: () => boolean) => {
  const router = useRouter();

  useEffect(() => {
    const backAction = () => {
      // If custom handler is provided and returns true, prevent default
      if (onBack && onBack()) {
        return true;
      }

      // Use safe navigation for back action
      try {
        NavigationUtils.safeGoBack();
        return true; // Prevent default back action
      } catch (error) {
        console.error('Back handler error:', error);
        return false; // Allow default back action as fallback
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [onBack]);
};
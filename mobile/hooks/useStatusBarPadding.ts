import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Hook to get consistent status bar padding across iOS and Android
 * 
 * Returns the device's status bar height plus platform-specific spacing:
 * - Android: insets.top + 10px
 * - iOS: insets.top + 8px
 * 
 * This ensures proper spacing that accounts for:
 * - iPhone notches and Dynamic Island
 * - Android status bars (various heights)
 * - Different screen sizes and orientations
 */
export const useStatusBarPadding = () => {
  const insets = useSafeAreaInsets();
  
  const topPadding = insets.top + (Platform.OS === 'android' ? 10 : 8);
  const bottomPadding = insets.bottom;
  
  return {
    top: topPadding,
    bottom: bottomPadding,
    left: insets.left,
    right: insets.right,
    insets, // Original insets for custom calculations
  };
};

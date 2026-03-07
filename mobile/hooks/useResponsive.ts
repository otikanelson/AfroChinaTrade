import { useWindowDimensions } from 'react-native';

const TABLET_BREAKPOINT = 768;
const CONTENT_MAX_WIDTH = 960;

export interface ResponsiveLayout {
  isTablet: boolean;
  numColumns: number;
  contentMaxWidth: number;
  width: number;
  height: number;
}

/**
 * Hook that detects screen size and returns layout helpers for responsive design.
 * - isTablet: true when screen width >= 768px
 * - numColumns: 2 for tablet, 1 for phone
 * - contentMaxWidth: max width for centering content on large screens
 */
export function useResponsive(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;

  return {
    isTablet,
    numColumns: isTablet ? 2 : 1,
    contentMaxWidth: CONTENT_MAX_WIDTH,
    width,
    height,
  };
}

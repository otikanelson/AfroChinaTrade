/**
 * Design System Hook
 * 
 * Custom hook that provides easy access to design system utilities
 * and theme tokens throughout the application.
 */

import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  createSpacingUtilities,
  createTypographyUtilities,
  createComponentStyles,
  componentSpacing,
  typographyPresets,
  SpacingUtilities,
  TypographyUtilities,
} from '../utils/designSystem';

export interface DesignSystemHook {
  // Theme tokens
  colors: ReturnType<typeof useTheme>['colors'];
  typography: ReturnType<typeof useTheme>['typography'];
  spacing: ReturnType<typeof useTheme>['spacing'];
  
  // Utility functions
  spacingUtils: SpacingUtilities;
  typographyUtils: TypographyUtilities;
  
  // Component styles
  componentStyles: ReturnType<typeof createComponentStyles>;
  
  // Presets
  componentSpacing: typeof componentSpacing;
  typographyPresets: typeof typographyPresets;
  
  // Quick access functions
  getSpacing: (multiplier: number) => number;
  getSemanticSpacing: (semantic: 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose') => number;
  getTypography: (variant: keyof ReturnType<typeof useTheme>['typography']) => ReturnType<typeof useTheme>['typography'][keyof ReturnType<typeof useTheme>['typography']];
  
  // Theme state
  isDark: boolean;
  toggleTheme: () => void;
}

/**
 * Hook that provides comprehensive access to the design system
 * 
 * @returns DesignSystemHook object with all design system utilities
 */
export const useDesignSystem = (): DesignSystemHook => {
  const theme = useTheme();
  
  // Create utility functions with memoization for performance
  const spacingUtils = useMemo(
    () => createSpacingUtilities(theme.spacing.base),
    [theme.spacing.base]
  );
  
  const typographyUtils = useMemo(
    () => createTypographyUtilities(theme.typography),
    [theme.typography]
  );
  
  const componentStyles = useMemo(
    () => createComponentStyles(spacingUtils, typographyUtils, theme.colors),
    [spacingUtils, typographyUtils, theme.colors]
  );
  
  return {
    // Theme tokens
    colors: theme.colors,
    typography: theme.typography,
    spacing: theme.spacing,
    
    // Utility functions
    spacingUtils,
    typographyUtils,
    
    // Component styles
    componentStyles,
    
    // Presets
    componentSpacing,
    typographyPresets,
    
    // Quick access functions (delegated to theme for consistency)
    getSpacing: theme.getSpacing,
    getSemanticSpacing: theme.getSemanticSpacing,
    getTypography: theme.getTypography,
    
    // Theme state
    isDark: theme.isDark,
    toggleTheme: theme.toggleTheme,
  };
};

/**
 * Hook for accessing only spacing utilities
 * Useful when you only need spacing-related functions
 */
export const useSpacing = () => {
  const theme = useTheme();
  
  return useMemo(() => ({
    spacing: theme.spacing,
    getSpacing: theme.getSpacing,
    getSemanticSpacing: theme.getSemanticSpacing,
    calculateSpacing: theme.calculateSpacing,
    getResponsiveSpacing: theme.getResponsiveSpacing,
  }), [theme]);
};

/**
 * Hook for accessing only typography utilities
 * Useful when you only need typography-related functions
 */
export const useTypography = () => {
  const theme = useTheme();
  
  return useMemo(() => ({
    typography: theme.typography,
    getTypography: theme.getTypography,
    typographyUtils: createTypographyUtilities(theme.typography),
  }), [theme.typography, theme.getTypography]);
};

/**
 * Hook for accessing component-specific styles
 * Provides pre-built styles for common UI patterns
 */
export const useComponentStyles = () => {
  const theme = useTheme();
  
  return useMemo(() => {
    const spacingUtils = createSpacingUtilities(theme.spacing.base);
    const typographyUtils = createTypographyUtilities(theme.typography);
    
    return createComponentStyles(spacingUtils, typographyUtils, theme.colors);
  }, [theme]);
};
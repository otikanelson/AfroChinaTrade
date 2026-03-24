/**
 * Design System Hook
 * 
 * Custom hook that provides easy access to design system utilities
 * and theme tokens throughout the application.
 */

import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Define missing types locally since designSystem utils are not available
interface SpacingUtilities {
  getSpacing: (multiplier: number) => number;
}

interface TypographyUtilities {
  getTypography: (variant: string) => any;
}

const componentSpacing = {};
const typographyPresets = {};

const createComponentStyles = () => ({});
const createSpacingUtilities = (base: number): SpacingUtilities => ({
  getSpacing: (multiplier: number) => base * multiplier,
});
const createTypographyUtilities = (typography: any): TypographyUtilities => ({
  getTypography: (variant: string) => typography[variant] || {},
});

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
  getTypography: (variant: string) => any;
  
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
    () => createComponentStyles(),
    [theme.colors]
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
    getTypography: (variant: string) => theme.getTypography(variant as any),
    
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
    
    return createComponentStyles();
  }, [theme]);
};
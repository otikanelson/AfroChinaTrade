import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../theme/colors';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { fontSizes, fontWeights, typography } from '../theme/typography';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof lightColors | typeof darkColors;
  fonts: typeof fonts;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  fontSizes: typeof fontSizes;
  fontWeights: typeof fontWeights;
  shadows: typeof shadows;
  typography: typeof typography;
  // Enhanced utility functions for spacing calculations and typography access
  getSpacing: (multiplier: number) => number;
  getTypography: (variant: keyof typeof typography) => typeof typography[keyof typeof typography];
  getSemanticSpacing: (semantic: 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose') => number;
  calculateSpacing: (base: number, multiplier?: number) => number;
  getResponsiveSpacing: (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => number;
  // Additional design system utilities
  getSpacingScale: (scale: keyof typeof spacing) => number;
  createSpacingStyle: (property: string, value: number | string) => object;
  getTypographyWithColor: (variant: keyof typeof typography, color?: string) => typeof typography[keyof typeof typography] & { color?: string };
}

const THEME_STORAGE_KEY = '@afrochinatrade:theme_mode';

// Typography - Enhanced with proper hierarchy
const fonts = {
  regular: 'Roboto-Regular',
  medium: 'Roboto-Regular',
  bold: 'Roboto-Regular',
  light: 'Roboto-Regular',
  italic: 'Roboto-Italic',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');

  // Load theme preference from storage
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
      setThemeModeState(newMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  // Select color scheme
  const currentColors = themeMode === 'dark' ? darkColors : lightColors;

  // Enhanced utility functions for spacing calculations and typography access
  const getSpacing = (multiplier: number): number => {
    // Support both numeric multipliers and direct spacing scale access
    if (multiplier in spacing) {
      return spacing[multiplier as keyof typeof spacing];
    }
    return spacing.base * multiplier;
  };

  const getTypography = (variant: keyof typeof typography): typeof typography[keyof typeof typography] => {
    return typography[variant];
  };

  // Additional utility functions for enhanced design system
  const getSemanticSpacing = (semantic: 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose'): number => {
    return spacing[semantic];
  };

  const calculateSpacing = (base: number, multiplier: number = 1): number => {
    return base * multiplier;
  };

  const getResponsiveSpacing = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): number => {
    const sizeMap = {
      xs: spacing.tight,
      sm: spacing.snug,
      md: spacing.normal,
      lg: spacing.relaxed,
      xl: spacing.loose,
    };
    return sizeMap[size];
  };

  // Additional design system utilities
  const getSpacingScale = (scale: keyof typeof spacing): number => {
    return spacing[scale];
  };

  const createSpacingStyle = (property: string, value: number | string): object => {
    const spacingValue = typeof value === 'string' && value in spacing 
      ? spacing[value as keyof typeof spacing] 
      : value;
    return { [property]: spacingValue };
  };

  const getTypographyWithColor = (variant: keyof typeof typography, color?: string): typeof typography[keyof typeof typography] & { color?: string } => {
    const typographyStyle = typography[variant];
    return color ? { ...typographyStyle, color } : typographyStyle;
  };

  const contextValue: ThemeContextType = {
    themeMode,
    isDark: themeMode === 'dark',
    toggleTheme,
    colors: currentColors,
    fonts,
    spacing,
    borderRadius,
    fontSizes,
    fontWeights,
    shadows,
    typography,
    getSpacing,
    getTypography,
    getSemanticSpacing,
    calculateSpacing,
    getResponsiveSpacing,
    getSpacingScale,
    createSpacingStyle,
    getTypographyWithColor,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Legacy theme export for backward compatibility
export const theme = {
  colors: lightColors,
  fonts,
  spacing,
  borderRadius,
  fontSizes,
  fontWeights,
  shadows,
};
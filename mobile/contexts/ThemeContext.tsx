import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';

export type ThemeMode = 'light' | 'dark';

// Typography utility types
export interface TypographyStyle {
  fontSize: number;
  fontWeight: string;
  lineHeight?: number;
  letterSpacing?: number;
}

export interface TypographyVariants {
  h1: TypographyStyle;
  h2: TypographyStyle;
  h3: TypographyStyle;
  h4: TypographyStyle;
  h5: TypographyStyle;
  h6: TypographyStyle;
  body1: TypographyStyle;
  body2: TypographyStyle;
  subtitle1: TypographyStyle;
  subtitle2: TypographyStyle;
  caption: TypographyStyle;
  overline: TypographyStyle;
  button: TypographyStyle;
}

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof lightColors;
  fonts: typeof fonts;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  fontSizes: typeof fontSizes;
  fontWeights: typeof fontWeights;
  shadows: typeof shadows;
  typography: TypographyVariants;
  // Utility functions
  getSpacing: (multiplier: number) => number;
  getTypography: (variant: keyof TypographyVariants) => TypographyStyle;
}

const THEME_STORAGE_KEY = '@afrochinatrade:theme_mode';

// Color schemes based on existing theme
const lightColors = {
  // Primary colors from existing theme
  primary: '#C41E3A', // Deep red
  primaryLight: '#E63946',
  primaryDark: '#8B0000',
  
  secondary: '#2D5F3F', // Deep green
  secondaryLight: '#3A7D4F',
  secondaryDark: '#1B3A28',
  
  accent: '#D4AF37', // Gold
  accentLight: '#F4D03F',
  accentDark: '#B8941E',
  
  // Background colors
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceSecondary: '#FAFBFC',
  
  // Text colors
  text: '#1A1A1A',
  textSecondary: '#6C757D',
  textLight: '#ADB5BD',
  textInverse: '#FFFFFF',
  
  // Border colors
  border: '#DEE2E6',
  borderLight: '#E9ECEF',
  
  // Status colors
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',
  
  // Special colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  disabled: '#ADB5BD',
  
  // Tab colors
  tabActive: '#C41E3A',
  tabInactive: '#6C757D',
  tabBackground: '#F8F9FA',
};

const darkColors = {
  // Primary colors (slightly adjusted for dark mode)
  primary: '#E63946',
  primaryLight: '#FF6B7A',
  primaryDark: '#C41E3A',
  
  secondary: '#3A7D4F',
  secondaryLight: '#4A9D5F',
  secondaryDark: '#2D5F3F',
  
  accent: '#F4D03F',
  accentLight: '#F7DC6F',
  accentDark: '#D4AF37',
  
  // Background colors
  background: '#121212',
  surface: '#1E1E1E',
  surfaceSecondary: '#2A2A2A',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textLight: '#808080',
  textInverse: '#121212',
  
  // Border colors
  border: '#404040',
  borderLight: '#505050',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Special colors
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  disabled: '#606060',
  
  // Tab colors
  tabActive: '#E63946',
  tabInactive: '#B0B0B0',
  tabBackground: '#1E1E1E',
};

// Typography - Enhanced with proper hierarchy
const fonts = {
  regular: 'Roboto-Regular',
  medium: 'Roboto-Regular',
  bold: 'Roboto-Regular',
  light: 'Roboto-Regular',
  italic: 'Roboto-Italic',
};

// Enhanced font sizes with semantic naming
const fontSizes = {
  // Utility sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  
  // Semantic sizes
  caption: 12,
  body: 16,
  bodyLarge: 18,
  subtitle: 14,
  title: 20,
  headline: 24,
  display: 30,
  hero: 36,
};

const fontWeights = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// Enhanced spacing with more granular control
const spacing = {
  // Base spacing scale (4px increments)
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  
  // Legacy naming for backward compatibility
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
  
  // Semantic spacing
  tight: 4,
  snug: 8,
  normal: 16,
  relaxed: 24,
  loose: 32,
  
  // Component-specific spacing
  cardPadding: 16,
  screenPadding: 16,
  sectionSpacing: 24,
  itemSpacing: 12,
};

// Border radius
const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// Shadows
const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Typography variants for consistent text styling
const typography: TypographyVariants = {
  h1: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 38,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    letterSpacing: 0,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: 0.25,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: 0,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  subtitle1: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  subtitle2: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  overline: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 1.5,
  },
  button: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 1.25,
  },
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
  const colors = themeMode === 'dark' ? darkColors : lightColors;

  // Utility functions
  const getSpacing = (multiplier: number): number => {
    return spacing.base * multiplier;
  };

  const getTypography = (variant: keyof TypographyVariants): TypographyStyle => {
    return typography[variant];
  };

  const contextValue: ThemeContextType = {
    themeMode,
    isDark: themeMode === 'dark',
    toggleTheme,
    colors,
    fonts,
    spacing,
    borderRadius,
    fontSizes,
    fontWeights,
    shadows,
    typography,
    getSpacing,
    getTypography,
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
export const lightColors = {
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
  surfaceLight: '#FAFBFC', // Alias for compatibility
  
  // Text colors
  text: '#1A1A1A',
  textSecondary: '#6C757D',
  textLight: '#ADB5BD',
  textInverse: '#FFFFFF',
  
  // Border colors
  border: '#DEE2E6',
  borderLight: '#E9ECEF',
  divider: '#F1F3F5', // Keep for compatibility
  
  // Status colors
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',
  
  // Special colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(41, 39, 39, 0.5)',
  overlayLight: 'rgba(43, 41, 41, 0.3)',
  input: '#dbdbdbff',
  disabled: '#ADB5BD',
  
  // Badge colors
  badge: '#DC3545', // Use error color for consistency
  badgeText: '#FFFFFF',
  
  // Tab colors
  tabActive: '#C41E3A',
  tabInactive: '#6C757D',
  tabBackground: '#F8F9FA',
} as const;

export const darkColors = {
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
  
  // Background colors - Lighter tones for better readability
  background: '#2D2D2D', // Lighter than pure black
  surface: '#1f1f1fff', // Much lighter surface
  surfaceSecondary: '#3A3A3A', // Even lighter for contrast
  surfaceLight: '#3A3A3A', // Alias for compatibility
  
  // Text colors - Better contrast
  text: '#F5F5F5', // Slightly off-white for comfort
  textSecondary: '#C0C0C0', // Lighter secondary text
  textLight: '#A0A0A0', // More readable light text
  textInverse: '#1A1A1A',
  
  // Border colors - More visible
  border: '#4A4A4A', // Much lighter borders
  borderLight: '#5A5A5A', // Even lighter for subtle borders
  divider: '#4A4A4A', // Keep for compatibility
  
  // Status colors - Adjusted for dark mode
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Special colors
  shadow: 'rgba(0, 0, 0, 0.4)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  input: '#303030ff',
  disabled: '#707070', // More visible disabled state
  
  // Badge colors
  badge: '#F44336', // Use error color for consistency
  badgeText: '#FFFFFF',
  
  // Tab colors
  tabActive: '#E63946',
  tabInactive: '#C0C0C0',
  tabBackground: '#2D2D2D',
} as const;

// Default export for backward compatibility
export const colors = lightColors;

export type ColorKey = keyof typeof lightColors;

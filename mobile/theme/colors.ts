export const colors = {
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
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  disabled: '#ADB5BD',
  
  // Badge colors
  badge: '#DC3545', // Use error color for consistency
  badgeText: '#FFFFFF',
  
  // Tab colors
  tabActive: '#C41E3A',
  tabInactive: '#6C757D',
  tabBackground: '#F8F9FA',
} as const;

export type ColorKey = keyof typeof colors;

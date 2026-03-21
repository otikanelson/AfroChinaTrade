import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography } from './Typography';

export interface AppHeaderProps {
  // Content
  title: string;
  subtitle?: string;
  
  // Navigation
  showBackButton?: boolean;
  onBackPress?: () => void;
  
  // Actions
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
  
  // Styling
  variant?: 'default' | 'large' | 'minimal' | 'centered';
  backgroundColor?: string;
  textColor?: string;
  
  // Layout
  safeArea?: boolean;
  borderBottom?: boolean;
  
  // Custom styles
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  rightAction,
  leftAction,
  variant = 'default',
  backgroundColor,
  textColor,
  safeArea = true,
  borderBottom = true,
  style,
  titleStyle,
  subtitleStyle,
}) => {
  const router = useRouter();
  const { colors, spacing, shadows, typography } = useTheme();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'large':
        return {
          container: styles.largeContainer,
          title: styles.largeTitle,
          subtitle: styles.largeSubtitle,
        };
      case 'minimal':
        return {
          container: styles.minimalContainer,
          title: styles.minimalTitle,
          subtitle: styles.minimalSubtitle,
        };
      case 'centered':
        return {
          container: styles.centeredContainer,
          title: styles.centeredTitle,
          subtitle: styles.centeredSubtitle,
        };
      default:
        return {
          container: styles.defaultContainer,
          title: styles.defaultTitle,
          subtitle: styles.defaultSubtitle,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const containerStyle = [
    styles.baseContainer,
    variantStyles.container,
    {
      backgroundColor: backgroundColor || colors.background,
      borderBottomWidth: borderBottom ? 1 : 0,
      borderBottomColor: colors.borderLight,
    },
    style,
  ];

  const titleTextStyle = [
    variantStyles.title,
    { color: textColor || colors.text },
    titleStyle,
  ];

  const subtitleTextStyle = [
    variantStyles.subtitle,
    { color: textColor || colors.textSecondary },
    subtitleStyle,
  ];

  const HeaderContent = () => (
    <View style={containerStyle}>
      <View style={styles.headerRow}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBackPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name="arrow-back" 
                size={24} 
                color={textColor || colors.text} 
              />
            </TouchableOpacity>
          )}
          {leftAction}
        </View>

        {/* Center Section */}
        <View style={styles.centerSection}>
          <Text style={titleTextStyle} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={subtitleTextStyle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          {rightAction}
        </View>
      </View>
    </View>
  );

  if (safeArea) {
    return (
      <SafeAreaView edges={['top']} style={{ backgroundColor: backgroundColor || colors.background }}>
        <HeaderContent />
      </SafeAreaView>
    );
  }

  return <HeaderContent />;
};

const styles = StyleSheet.create({
  baseContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 44,
    justifyContent: 'flex-start',
  },
  
  centerSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 44,
    justifyContent: 'flex-end',
  },
  
  backButton: {
    padding: 8,
    marginLeft: -8,
  },

  // Default variant
  defaultContainer: {},
  defaultTitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  defaultSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 18,
    marginTop: 2,
  },

  // Large variant
  largeContainer: {
    paddingVertical: 20,
  },
  largeTitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  largeSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
    marginTop: 4,
  },

  // Minimal variant
  minimalContainer: {
    paddingVertical: 8,
  },
  minimalTitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  minimalSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    marginTop: 2,
  },

  // Centered variant
  centeredContainer: {
    paddingVertical: 16,
  },
  centeredTitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    textAlign: 'center',
  },
  centeredSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    marginTop: 4,
    textAlign: 'center',
  },
});

// Convenience components for common header patterns
export const BackHeader: React.FC<Omit<AppHeaderProps, 'showBackButton'>> = (props) => (
  <AppHeader showBackButton {...props} />
);

export const LargeHeader: React.FC<Omit<AppHeaderProps, 'variant'>> = (props) => (
  <AppHeader variant="large" {...props} />
);

export const MinimalHeader: React.FC<Omit<AppHeaderProps, 'variant'>> = (props) => (
  <AppHeader variant="minimal" {...props} />
);

export const CenteredHeader: React.FC<Omit<AppHeaderProps, 'variant'>> = (props) => (
  <AppHeader variant="centered" {...props} />
);
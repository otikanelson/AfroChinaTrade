import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface NotificationBadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
  style?: any;
  showZero?: boolean;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  size = 'medium',
  style,
  showZero = false,
}) => {
  const { colors, fontSizes, fontWeights } = useTheme();

  if (count === 0 && !showZero) {
    return null;
  }

  const sizeConfig = {
    small: {
      container: { width: 16, height: 16, borderRadius: 8 },
      text: { fontSize: 10 },
    },
    medium: {
      container: { width: 20, height: 20, borderRadius: 10 },
      text: { fontSize: 12 },
    },
    large: {
      container: { width: 24, height: 24, borderRadius: 12 },
      text: { fontSize: 14 },
    },
  };

  const config = sizeConfig[size];
  const displayCount = count > 99 ? '99+' : count.toString();

  const styles = StyleSheet.create({
    container: {
      ...config.container,
      backgroundColor: colors.error,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: -8,
      right: -8,
      zIndex: 1,
      borderWidth: 2,
      borderColor: colors.background,
    },
    text: {
      ...config.text,
      color: colors.textInverse,
      fontWeight: fontWeights.bold,
      textAlign: 'center',
    },
  });

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>{displayCount}</Text>
    </View>
  );
};
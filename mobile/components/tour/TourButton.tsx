import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface TourButtonProps {
  onPress: () => void;
  variant?: 'icon' | 'text' | 'full';
  size?: 'sm' | 'md';
}

export function TourButton({ onPress, variant = 'icon', size = 'md' }: TourButtonProps) {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();

  const styles = StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingHorizontal: variant === 'icon' ? spacing.xs : spacing.md,
      paddingVertical: size === 'sm' ? spacing.xs : spacing.sm,
      backgroundColor: variant === 'full' ? colors.primary : 'transparent',
    },
    text: {
      fontSize: size === 'sm' ? fontSizes.xs : fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: variant === 'full' ? colors.textInverse : colors.primary,
    },
  });

  const iconSize = size === 'sm' ? 16 : 20;
  const iconColor = variant === 'full' ? colors.textInverse : colors.primary;

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name="help-circle-outline" size={iconSize} color={iconColor} />
      {(variant === 'text' || variant === 'full') && (
        <Text style={styles.text}>Tour</Text>
      )}
    </TouchableOpacity>
  );
}

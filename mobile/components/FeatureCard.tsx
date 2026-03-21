import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface FeatureCardProps {
  iconName: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  iconColor?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  iconName,
  title,
  subtitle,
  onPress,
  iconColor,
}) => {
  const { colors, spacing, borderRadius, fontSizes, fontWeights, shadows } = useTheme();
  const finalIconColor = iconColor || colors.primary;

  return (
    <TouchableOpacity style={[styles.container, { 
      backgroundColor: colors.background, 
      borderRadius: borderRadius.md, 
      padding: spacing.sm,
      ...shadows.sm 
    }]} onPress={onPress}>
      <View style={[styles.iconContainer, { 
        borderRadius: borderRadius.base, 
        backgroundColor: colors.surface,
        marginBottom: spacing.xs 
      }]}>
        <MaterialCommunityIcons name={iconName as any} size={20} color={finalIconColor} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { 
          fontSize: fontSizes.xs, 
          fontWeight: fontWeights.semibold, 
          color: colors.text 
        }]} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 80,
  },
  iconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
  },
});

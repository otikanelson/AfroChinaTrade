import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionText,
  onActionPress,
}) => {
  const { colors, spacing, borderRadius, fontSizes, fontWeights, shadows } = useTheme();

  return (
    <View style={[styles.container, { 
      paddingHorizontal: spacing.base, 
      marginBottom: spacing.lg, 
      marginTop: spacing.xl 
    }]}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { 
          fontSize: fontSizes.xl, 
          fontWeight: fontWeights.bold, 
          color: colors.text 
        }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { 
          fontSize: fontSizes.sm, 
          color: colors.textSecondary, 
          fontWeight: fontWeights.medium 
        }]}>{subtitle}</Text>}
      </View>
      {actionText && onActionPress && (
        <TouchableOpacity onPress={onActionPress} style={[styles.actionButton, { 
          paddingHorizontal: spacing.md, 
          paddingVertical: spacing.sm, 
          borderRadius: borderRadius.lg, 
          backgroundColor: colors.surface, 
          borderWidth: 1, 
          borderColor: colors.border,
          ...shadows.sm 
        }]}>
          <Text style={[styles.actionText, { 
            fontSize: fontSizes.sm, 
            color: colors.primary, 
            fontWeight: fontWeights.semibold, 
            marginRight: spacing.xs 
          }]}>{actionText}</Text>
          <MaterialIcons name="chevron-right" size={20} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 2,
  },
  subtitle: {
    // Styles applied inline
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    // Styles applied inline
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { NavigationSource, CollectionType } from '../types/navigation';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
  navigationSource?: NavigationSource; // New prop
  collectionType?: CollectionType;     // New prop
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionText,
  onActionPress,
  navigationSource,
  collectionType,
}) => {
  const { colors, spacing, borderRadius, fontSizes, fontWeights, shadows } = useTheme();
  const router = useRouter();

  const handleActionPress = () => {
    if (onActionPress) {
      onActionPress();
    } else if (navigationSource && collectionType) {
      router.push({
        pathname: '/product-listing',
        params: {
          source: navigationSource,
          collectionType,
          title
        }
      });
    }
  };

  return (
    <View style={[styles.container, { 
      paddingHorizontal: spacing.base, 
      marginBottom: spacing.sm, 
    }]}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { 
          fontSize: fontSizes.lg, 
          fontWeight: fontWeights.bold, 
          color: colors.text 
        }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { 
          fontSize: fontSizes.sm, 
          color: colors.textSecondary, 
          fontWeight: fontWeights.medium 
        }]}>{subtitle}</Text>}
      </View>
      {actionText && (onActionPress || (navigationSource && collectionType)) && (
        <TouchableOpacity onPress={handleActionPress} style={[styles.actionButton, { 
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

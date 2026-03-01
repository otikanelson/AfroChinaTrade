import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme';

interface NavItem {
  id: string;
  label: string;
  iconName: string;
  iconType?: 'ionicons' | 'material';
  badge?: number;
}

interface BottomNavProps {
  items: NavItem[];
  activeId: string;
  onItemPress: (id: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ items, activeId, onItemPress }) => {
  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isActive = item.id === activeId;
        const IconComponent = item.iconType === 'material' ? MaterialCommunityIcons : Ionicons;
        
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.item}
            onPress={() => onItemPress(item.id)}
          >
            <View style={styles.iconContainer}>
              <IconComponent
                name={item.iconName as any}
                size={24}
                color={isActive ? theme.colors.primary : theme.colors.textSecondary}
              />
              {item.badge && item.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.base,
    ...theme.shadows.md,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeights.medium,
  },
  activeLabel: {
    color: theme.colors.primary,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: theme.colors.badge,
    borderRadius: theme.borderRadius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: theme.colors.badgeText,
    fontSize: 10,
    fontWeight: theme.fontWeights.bold,
  },
});

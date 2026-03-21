import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

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
  const { colors, spacing, borderRadius, fontSizes, fontWeights, shadows } = useTheme();

  return (
    <View style={[styles.container, { 
      backgroundColor: colors.background, 
      borderTopWidth: 1, 
      borderTopColor: colors.border, 
      paddingVertical: spacing.sm, 
      paddingHorizontal: spacing.base,
      ...shadows.md 
    }]}>
      {items.map((item) => {
        const isActive = item.id === activeId;
        const IconComponent = item.iconType === 'material' ? MaterialCommunityIcons : Ionicons;
        
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.item}
            onPress={() => onItemPress(item.id)}
          >
            <View style={[styles.iconContainer, { marginBottom: spacing.xs }]}>
              <IconComponent
                name={item.iconName as any}
                size={24}
                color={isActive ? colors.primary : colors.textSecondary}
              />
              {item.badge && item.badge > 0 && (
                <View style={[styles.badge, { 
                  backgroundColor: colors.error, 
                  borderRadius: borderRadius.full 
                }]}>
                  <Text style={[styles.badgeText, { 
                    color: 'white', 
                    fontWeight: fontWeights.bold 
                  }]}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[
              styles.label, 
              { 
                fontSize: fontSizes.xs, 
                color: isActive ? colors.primary : colors.textSecondary, 
                fontWeight: fontWeights.medium 
              }
            ]}>
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
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
  },
  label: {
    // Styles applied inline
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
  },
});

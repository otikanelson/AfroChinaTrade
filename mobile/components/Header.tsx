import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Sidebar } from './Sidebar';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  showBack?: boolean;
  showCart?: boolean;
  showRefresh?: boolean;
  showFilter?: boolean;
  showMenu?: boolean;
  cartCount?: number;
  onCartPress?: () => void;
  onRefreshPress?: () => void;
  onFilterPress?: () => void;
  onBackPress?: () => void;
  // New props for admin pages
  rightAction?: React.ReactNode;
  badge?: {
    count: number;
    color?: string;
  };
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle,
  showLogo = false,
  showBack = false,
  showCart = false,
  showRefresh = false,
  showMenu = true,
  cartCount = 0,
  onCartPress,
  onRefreshPress,
  rightAction,
  badge
}) => {
  const router = useRouter();
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    header: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    backBtn: {
      padding: spacing.sm,
      marginRight: spacing.sm,
      borderRadius: borderRadius.base,
    },
    menuBtn: {
      padding: spacing.sm,
      marginRight: spacing.sm,
      borderRadius: borderRadius.base,
    },
    logo: {
      width: 30,
      height: 30,
      marginRight: spacing.md,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: fontSizes['xl'],
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: subtitle ? 2 : 0,
    },
    subtitle: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    right: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    actionBtn: {
      padding: spacing.sm,
      borderRadius: borderRadius.base,
      backgroundColor: colors.primary,
    },
    cartBtn: {
      position: 'relative',
      padding: spacing.sm,
      borderRadius: borderRadius.base,
    },
    badge: {
      position: 'absolute',
      top: 2,
      right: 2,
      backgroundColor: colors.primary,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      color: colors.textInverse,
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.bold,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.left}>
            {showBack && (
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
            
            {!showBack && showMenu && (
              <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuBtn}>
                <Ionicons name="menu" size={24} color={colors.primary} />
              </TouchableOpacity>
            )}
            
            {showLogo && (
              <Image 
                source={require('../assets/images/Logo_bg.png')} 
                style={styles.logo}
              />
            )}
            
            <View style={styles.titleContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Text style={styles.title}>{title}</Text>
                {badge && badge.count > 0 && (
                  <View style={[styles.badge, { backgroundColor: badge.color || colors.primary }]}>
                    <Text style={styles.badgeText}>{badge.count}</Text>
                  </View>
                )}
              </View>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          </View>
          
          <View style={styles.right}>
            {rightAction}
            
            {showRefresh && (
              <TouchableOpacity onPress={onRefreshPress} style={styles.actionBtn}>
                <Ionicons name="refresh" size={20} color={colors.textInverse} />
              </TouchableOpacity>
            )}
            
            {showCart && (
              <TouchableOpacity onPress={onCartPress} style={styles.cartBtn}>
                <Ionicons name="cart" size={24} color={colors.primary} />
                {cartCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      
      <Sidebar 
        visible={sidebarVisible} 
        onClose={() => setSidebarVisible(false)} 
      />
    </SafeAreaView>
  );
};
import React, { useState, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Sidebar } from './Sidebar';
import Constants from 'expo-constants';

interface HeaderProps {
  title?: string;
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
  rightAction?: React.ReactNode;
  badge?: {
    count: number;
    color?: string;
  };
  debugMode?: boolean; // Add debug mode prop
}

const HeaderComponent: React.FC<HeaderProps> = ({ 
  title, 
  subtitle,
  showLogo = false,
  showBack = false,
  showCart = false,
  showRefresh = false,
  showFilter = false,
  showMenu = true,
  cartCount = 0,
  onCartPress,
  onRefreshPress,
  onFilterPress,
  onBackPress,
  rightAction,
  badge,
  debugMode = false // Default to false
}) => {
  const router = useRouter();
  const segments = useSegments();
  const isAdminPage = segments.some(s => s === '(admin)' || s === 'admin');
  const { colors, fontSizes, fontWeights } = useTheme();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const insets = useSafeAreaInsets();

  // Enhanced platform and environment detection
  const isExpoGo = Constants.appOwnership === 'expo';
  const isAndroid = Platform.OS === 'android';
  const isIOS = Platform.OS === 'ios';
  
  // Determine the appropriate top padding
  const getTopPadding = () => {
    if (isIOS) {
      // iOS always needs safe area padding
      return insets.top;
    } else if (isAndroid) {
      // Android behavior depends on build type and SDK version
      if (isExpoGo) {
        // In Expo Go, Android usually doesn't need extra padding
        return 0;
      } else {
        // In production builds, check if we have insets
        return insets.top > 0 ? insets.top : 0;
      }
    }
    return 0;
  };

  const topPadding = getTopPadding();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      paddingTop: topPadding,
    },
    debugInfo: {
      backgroundColor: 'rgba(255, 0, 0, 0.1)',
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: 'red',
    },
    debugText: {
      fontSize: 10,
      color: 'red',
      fontFamily: 'monospace',
    },
    header: {
      height: 60,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      backgroundColor: colors.background,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    centerSection: {
      flex: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      flex: 1,
      gap: 8,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    menuButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',

    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cartButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    logo: {
      width: 60,
      height: 60,
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
    },
    logoText: {
      fontSize: 20,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    afroText: {
      color: colors.secondary, // Green
    },
    chinaText: {
      color: colors.primary, // Red
    },
    tradeText: {
      color: colors.accentDark, // Dark gold
    },
    titleContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 2,
    },
    badge: {
      position: 'absolute',
      top: -2,
      right: -2,
      backgroundColor: colors.primary,
      borderRadius: 10,
      minWidth: 18,
      height: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.background,
    },
    badgeText: {
      color: colors.textInverse,
      fontSize: 10,
      fontWeight: '600',
    },
  });

  const renderLogo = () => (
    <View style={styles.logoContainer}>
      <Image 
      source={require('../assets/images/Logo.png')} 
      style={styles.logo}
      resizeMode="contain"/>
      <Text style={styles.logoText}>
        <Text style={styles.afroText}>Afro</Text>
        <Text style={styles.chinaText}>China</Text>
        <Text style={styles.tradeText}>Trade</Text>
      </Text>
    </View>
  );

  const renderTitle = () => (
    <View style={styles.titleContainer}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={colors.background} 
        translucent={Platform.OS === 'android' ? false : true}
      />
      
      {/* Debug Information - only show when debugMode is true */}
      {debugMode && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            Platform: {Platform.OS} | Expo Go: {isExpoGo ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.debugText}>
            Safe Area Insets - Top: {insets.top}, Bottom: {insets.bottom}
          </Text>
          <Text style={styles.debugText}>
            Applied Padding: {topPadding}px
          </Text>
          <Text style={styles.debugText}>
            App Ownership: {Constants.appOwnership}
          </Text>
        </View>
      )}
      
      <View style={styles.header}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            {showBack ? (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={onBackPress || (() => router.back())}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
            ) : showMenu ? (
              <TouchableOpacity 
                style={styles.menuButton}
                onPress={() => setSidebarVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="menu" size={24} color={colors.primary} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Center Section */}
          <View style={styles.centerSection}>
            {showLogo ? renderLogo() : title ? renderTitle() : null}
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            {rightAction}
            
            {showRefresh && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={onRefreshPress}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
            
            {showFilter && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={onFilterPress}
                activeOpacity={0.7}
              >
                <Ionicons name="filter" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
            
            {showCart && (
              <TouchableOpacity 
                style={styles.cartButton}
                onPress={onCartPress}
                activeOpacity={0.7}
              >
                <Ionicons name="cart-outline" size={22} color={colors.primary} />
                {cartCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {cartCount > 99 ? '99+' : cartCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {badge && badge.count > 0 && (
              <View style={[styles.badge, { backgroundColor: badge.color || colors.primary }]}>
                <Text style={styles.badgeText}>
                  {badge.count > 99 ? '99+' : badge.count}
                </Text>
              </View>
            )}
          </View>
        </View>
      
      <Sidebar 
        visible={sidebarVisible} 
        onClose={() => setSidebarVisible(false)}
        isAdminPage={isAdminPage}
      />
    </View>
  );
};

// Memoize the Header component to prevent unnecessary re-renders
export const Header = memo(HeaderComponent, (prevProps, nextProps) => {
  // Custom comparison function to prevent re-renders when props haven't changed
  return (
    prevProps.title === nextProps.title &&
    prevProps.subtitle === nextProps.subtitle &&
    prevProps.showLogo === nextProps.showLogo &&
    prevProps.showBack === nextProps.showBack &&
    prevProps.showCart === nextProps.showCart &&
    prevProps.showRefresh === nextProps.showRefresh &&
    prevProps.showFilter === nextProps.showFilter &&
    prevProps.showMenu === nextProps.showMenu &&
    prevProps.cartCount === nextProps.cartCount &&
    prevProps.onCartPress === nextProps.onCartPress &&
    prevProps.onRefreshPress === nextProps.onRefreshPress &&
    prevProps.onFilterPress === nextProps.onFilterPress &&
    prevProps.onBackPress === nextProps.onBackPress &&
    prevProps.rightAction === nextProps.rightAction &&
    JSON.stringify(prevProps.badge) === JSON.stringify(nextProps.badge) &&
    prevProps.debugMode === nextProps.debugMode
  );
});
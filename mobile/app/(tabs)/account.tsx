import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useTheme } from '../../contexts/ThemeContext';


export default function AccountTab() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { wishlistCount } = useWishlist();
  const { colors, fonts, fontSizes, spacing } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      backgroundColor: colors.background,
      paddingTop: 10,
      paddingBottom: spacing.base,
      paddingHorizontal: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    headerTitle: {
      fontSize: fontSizes['2xl'],
      fontFamily: fonts.bold,
      color: colors.text,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.regular,
      color: colors.textSecondary,
    },
    content: {
      flex: 1,
    },
    userCard: {
      backgroundColor: colors.background,
      margin: spacing.base,
      padding: spacing.base,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    userInfo: {
      flex: 1,
      marginLeft: spacing.md,
    },
    userName: {
      fontSize: fontSizes.lg,
      fontFamily: fonts.medium,
      color: colors.text,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.regular,
      color: colors.textSecondary,
    },
    userRole: {
      fontSize: fontSizes.xs,
      fontFamily: fonts.medium,
      color: colors.primary,
      marginTop: 2,
    },
    signInButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      borderRadius: 8,
    },
    signInText: {
      color: colors.textInverse,
      fontSize: fontSizes.sm,
      fontFamily: fonts.medium,
    },
    menuSection: {
      backgroundColor: colors.background,
      marginHorizontal: spacing.base,
      marginTop: spacing.base,
      borderRadius: 12,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    menuIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    menuContent: {
      flex: 1,
    },
    menuRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    badge: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    badgeText: {
      color: colors.background,
      fontSize: fontSizes.xs,
      fontFamily: fonts.bold,
    },
    menuTitle: {
      fontSize: fontSizes.base,
      fontFamily: fonts.medium,
      color: colors.text,
      marginBottom: 2,
    },
    menuSubtitle: {
      fontSize: fontSizes.xs,
      fontFamily: fonts.regular,
      color: colors.textSecondary,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      marginHorizontal: spacing.base,
      marginTop: spacing.base,
      marginBottom: spacing.xl,
      padding: spacing.base,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.error,
    },
    logoutText: {
      fontSize: fontSizes.base,
      fontFamily: fonts.medium,
      color: colors.error,
      marginLeft: spacing.sm,
    },
    adminButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      marginHorizontal: spacing.base,
      marginTop: spacing.sm,
      marginBottom: spacing.xl,
      padding: spacing.base,
      borderRadius: 12,
      gap: spacing.sm,
    },
    adminButtonText: {
      fontSize: fontSizes.base,
      fontFamily: fonts.medium,
      color: colors.background,
    },
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/auth/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          }
        },
      ]
    );
  };

  const handleSignIn = () => {
    router.push('/auth/login');
  };

  const handleMenuItemPress = (title: string) => {
    switch (title) {
      case 'Profile':
        router.push('/profile');
        break;
      case 'Orders':
        router.push('/orders');
        break;
      case 'Wishlist':
        router.push('/wishlist');
        break;
      case 'Addresses':
        router.push('/addresses');
        break;
      case 'Payment Methods':
        router.push('/payment-methods');
        break;
      case 'Settings':
        router.push('/settings');
        break;
      case 'Help & Support':
        router.push('/help-support');
        break;
      default:
        break;
    }
  };

  const menuItems = [
    { icon: 'person-outline', title: 'Profile', subtitle: 'Edit your information' },
    { icon: 'receipt-outline', title: 'Orders', subtitle: 'View order history' },
    { 
      icon: 'heart-outline', 
      title: 'Wishlist', 
      subtitle: `${wishlistCount} saved products`,
      badge: wishlistCount > 0 ? wishlistCount : undefined
    },
    { icon: 'location-outline', title: 'Addresses', subtitle: 'Manage delivery addresses' },
    { icon: 'card-outline', title: 'Payment Methods', subtitle: 'Manage payment options' },
    { icon: 'settings-outline', title: 'Settings', subtitle: 'App preferences' },
    { icon: 'help-circle-outline', title: 'Help & Support', subtitle: 'Get assistance' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
        <Text style={styles.headerSubtitle}>Manage your profile and preferences</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* User Info */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={colors.background} />
          </View>
          <View style={styles.userInfo}>
            {isAuthenticated && user ? (
              <>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userRole}>Role: {user.role}</Text>
              </>
            ) : (
              <>
                <Text style={styles.userName}>Guest User</Text>
                <Text style={styles.userEmail}>Sign in to access all features</Text>
              </>
            )}
          </View>
          {!isAuthenticated && (
            <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.title} 
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(item.title)}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon as any} size={24} color={colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <View style={styles.menuRight}>
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button - only show if authenticated */}
        {isAuthenticated && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}

        {/* Admin Dashboard shortcut - only show for admin users */}
        {isAuthenticated && (user?.role === 'admin' || user?.role === 'super_admin') && (
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => router.push('/(admin)/(tabs)/products')}
          >
            <Ionicons name="settings-outline" size={20} color={colors.background} />
            <Text style={styles.adminButtonText}>Admin Dashboard</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Header } from '../../components/Header';
import { ThemeModal } from '../../components/ThemeModal';
import { spacing } from '../../theme/spacing';
import { getDisplayPhone } from '../../utils/phoneUtils';
import { fontWeights } from '../../theme';

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  showChevron?: boolean;
  variant?: 'default' | 'grid';
  disabled?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, subtitle, onPress, showChevron = true, variant = 'default', disabled = false }) => {
  const { colors, fontSizes, fonts } = useTheme();
  
  const styles = StyleSheet.create({
    menuItem: {
      flexDirection: variant === 'grid' ? 'column' : 'row',
      alignItems: 'center',
      paddingHorizontal: variant === 'grid' ? spacing.xs : spacing.sm,
      paddingVertical: variant === 'grid' ? spacing.sm : spacing.sm,
      marginHorizontal: variant === 'grid' ? 0 : spacing.sm,
      marginBottom: spacing.xs,
      borderRadius: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
      flex: variant === 'grid' ? 1 : undefined,
      minHeight: variant === 'grid' ? 60 : undefined,
      opacity: disabled ? 0.5 : 1,
    },
    iconContainer: {
      width: variant === 'grid' ? 28 : 32,
      height: variant === 'grid' ? 28 : 32,
      borderRadius: variant === 'grid' ? 14 : 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: variant === 'grid' ? 0 : spacing.sm,
      marginBottom: variant === 'grid' ? spacing.xs : 0,
    },
    menuContent: {
      flex: variant === 'grid' ? 0 : 1,
      alignItems: variant === 'grid' ? 'center' : 'flex-start',
    },
    menuTitle: {
      marginBottom: variant === 'default' ? 1 : 0,
      textAlign: variant === 'grid' ? 'center' : 'left',
      fontSize: variant === 'grid' ? fontSizes.xs : fontSizes.sm,
    },
    menuSubtitle: {
      lineHeight: 16,
      textAlign: variant === 'grid' ? 'center' : 'left',
      fontSize: fontSizes.xs,
    },
  });
  
  return (
    <TouchableOpacity 
      style={[styles.menuItem, { backgroundColor: colors.background }]} 
      onPress={disabled ? () => {} : onPress}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name={icon as any} size={variant === 'grid' ? 16 : 18} color={disabled ? colors.textLight : colors.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, { color: disabled ? colors.textLight : colors.text, fontFamily: fonts.medium }]}>
          {title}
        </Text>
        {variant === 'default' && (
          <Text style={[styles.menuSubtitle, { color: disabled ? colors.textLight : colors.textSecondary, fontFamily: fonts.regular }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {showChevron && variant === 'default' && (
        <Ionicons name="chevron-forward" size={16} color={disabled ? colors.textLight : colors.textLight} />
      )}
    </TouchableOpacity>
  );
};

export default function AccountTab() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { colors, fonts, fontSizes } = useTheme();
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  // Check if admin is viewing customer app
  const isAdminViewingCustomer = isAdmin;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    userCard: {
      backgroundColor: colors.background,
      margin: spacing.sm,
      padding: spacing.md,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    avatarImage: {
      width: 56,
      height: 56,
      borderRadius: 28,
    },
    userInfo: {
      flex: 1,
      marginLeft: spacing.md,
    },
    userName: {
      fontSize: fontSizes.lg,
      fontFamily: fonts.bold,
      color: colors.text,
      marginBottom: 2,
    },
    userEmail: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.regular,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    userPhone: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.regular,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    userRole: {
      fontSize: fontSizes.xs,
      fontFamily: fonts.bold,
      color: colors.primary,
      backgroundColor: colors.surface,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    signInButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: 12,
    },
    signInText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontFamily: fonts.bold,
    },
    adminButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      marginHorizontal: spacing['3xl'],
      marginTop: spacing.md,
      padding: spacing.lg,
      borderRadius: 12,
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    adminButtonText: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.medium,
      color: colors.primary,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: spacing.sm,
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    gridItem: {
      width: '48.5%',
    },
    sectionTitle: {
      fontSize: fontSizes.base,
      fontFamily: fonts.bold,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginHorizontal: spacing.lg,
      marginTop: spacing.md,
      marginBottom: spacing.md,
    },
    guestContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    guestIcon: {
      marginBottom: spacing.lg,
    },
    guestTitle: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    guestSubtitle: {
      fontSize: fontSizes.base,
      fontFamily: fonts.regular,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.lg,
      lineHeight: 22,
    },
    adminNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      margin: spacing.md,
      padding: spacing.md,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.warning,
      gap: spacing.sm,
    },
    adminNoticeText: {
      flex: 1,
      fontSize: fontSizes.sm,
      fontFamily: fonts.medium,
      color: colors.warning,
    },
  });

  const handleSignIn = () => {
    router.push('/auth/login');
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Header
          title="Account"
          subtitle="Manage your profile and settings"
        />
        <View style={styles.guestContainer}>
          <View style={styles.guestIcon}>
            <Ionicons name="person-circle-outline" size={80} color={colors.textSecondary} />
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.guestTitle}>Welcome to </Text>
            <Text style={[styles.guestTitle, {color: colors.primary}]}>Afro</Text>
            <Text style={[styles.guestTitle, {color: colors.secondary}]}>China</Text>
            <Text style={[styles.guestTitle, {color: colors.accentDark}]}>Trade</Text>
          </View>
          <Text style={styles.guestSubtitle}>
            Sign in to access your orders, wishlist, and personalized shopping experience
          </Text>
          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show loading state while user data is being fetched
  if (!user) {
    return (
      <View style={styles.container}>
        <Header
          title="My Account"
          subtitle="Loading..."
        />
        <View style={styles.guestContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.guestSubtitle, { marginTop: spacing.md }]}>
            Loading your account information...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="My Account"
        subtitle="Manage your profile and settings"
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Admin Viewing Notice */}
        {isAdminViewingCustomer && (
          <View style={styles.adminNotice}>
            <Ionicons name="eye" size={20} color={colors.warning} />
            <Text style={styles.adminNoticeText}>
              You are viewing as admin - customer settings are disabled
            </Text>
          </View>
        )}

        {/* User Profile Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            {user?.avatar ? (
              <Image 
                source={{ uri: user.avatar }} 
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={28} color={colors.textInverse} />
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            {user?.phone && (
              <Text style={styles.userPhone}>{getDisplayPhone(user.phone)}</Text>
            )}
            <Text style={styles.userRole}>
              {user?.role === 'admin' || user?.role === 'super_admin' ? 'Administrator' : 'Customer'}
            </Text>
          </View>
        </View>

        {/* Orders Section */}
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <MenuItem
              icon="receipt"
              title="Orders"
              subtitle=""
              onPress={() => router.push('/orders')}
              variant="grid"
              showChevron={false}
              disabled={isAdminViewingCustomer}
            />
          </View>
          <View style={styles.gridItem}>
            <MenuItem
              icon="refresh"
              title="Refunds"
              subtitle=""
              onPress={() => router.push('/refunds')}
              variant="grid"
              showChevron={false}
              disabled={isAdminViewingCustomer}
            />
          </View>
          <View style={styles.gridItem}>
            <MenuItem
              icon="heart"
              title="Favorites"
              subtitle=""
              onPress={() => router.push('/wishlist')}
              variant="grid"
              showChevron={false}
              disabled={isAdminViewingCustomer}
            />
          </View>
          <View style={styles.gridItem}>
            <MenuItem
              icon="time"
              title="Browsing History"
              subtitle=""
              onPress={() => router.push('/browsing-history')}
              variant="grid"
              showChevron={false}
              disabled={isAdminViewingCustomer}
            />
          </View>
          <View style={styles.gridItem}>
            <MenuItem
              icon="mail"
              title="Inquiries"
              subtitle=""
              onPress={() => router.push('/inquiries')}
              variant="grid"
              showChevron={false}
              disabled={isAdminViewingCustomer}
            />
          </View>
          <View style={styles.gridItem}>
            <MenuItem
              icon="chatbubble"
              title="Quotations"
              subtitle=""
              onPress={() => router.push('/quotations')}
              variant="grid"
              showChevron={false}
              disabled={isAdminViewingCustomer}
            />
          </View>
          <View style={styles.gridItem}>
            <MenuItem
              icon="star"
              title="Reviews"
              subtitle=""
              onPress={() => router.push('/reviews')}
              variant="grid"
              showChevron={false}
              disabled={isAdminViewingCustomer}
            />
          </View>
          <View style={styles.gridItem}>
            <MenuItem
              icon="happy"
              title="Preferences"
              subtitle=""
              onPress={() => setThemeModalVisible(true)}
              variant="grid"
              showChevron={false}
            />
          </View>
        </View>

        {/* Account Settings */}
        <Text style={styles.sectionTitle}>Account Settings</Text>
        
        <MenuItem
          icon="person-outline"
          title="Profile"
          subtitle="Edit your information"
          onPress={() => router.push('/profile')}
        />
        
        <MenuItem
          icon="lock-closed-outline"
          title="Change Password"
          subtitle="Update your account password"
          onPress={() => router.push('/change-password')}
        />

        <MenuItem
          icon="location-outline"
          title="Addresses"
          subtitle="Manage delivery addresses"
          onPress={() => router.push('/addresses')}
          disabled={isAdminViewingCustomer}
        />
        
        <MenuItem
          icon="card-outline"
          title="Payment Methods"
          subtitle="Manage payment options"
          onPress={() => router.push('/payment-methods')}
          disabled={isAdminViewingCustomer}
        />
        
        <MenuItem
          icon="help-circle-outline"
          title="Help & Support"
          subtitle="Get help and contact support"
          onPress={() => router.push('/help-support')}
          disabled={isAdminViewingCustomer}
        />

        <MenuItem
          icon="notifications-outline"
          title="Notifications"
          subtitle="Manage notification preferences"
          onPress={() => router.push('/notifications')}
        />
        
        <MenuItem
          icon="language-outline"
          title="Language"
          subtitle="English"
          onPress={() => router.push('/language')}
        />

        {/* Logout */}
        <MenuItem
          icon="log-out-outline"
          title="Sign Out"
          subtitle="Sign out of your account"
          onPress={handleLogout}
          showChevron={false}
        />

        <ThemeModal
          visible={themeModalVisible}
          onClose={() => setThemeModalVisible(false)}
        />
        
        {/* Admin Dashboard shortcut */}
        {(user?.role === 'admin' || user?.role === 'super_admin') && (
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => router.push('/(admin)/(tabs)/products')}
          >
            <Ionicons name="settings" size={18} color={colors.primary} />
            <Text style={styles.adminButtonText}>Admin Dashboard</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}

      </ScrollView>
    </View>
  );
}

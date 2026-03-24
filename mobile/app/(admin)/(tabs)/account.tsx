import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { Header } from '../../../components/Header';
import { ThemeModal } from '../../../components/ThemeModal';
import { spacing } from '../../../theme/spacing';
import { getDisplayPhone } from '../../../utils/phoneUtils';
import { fontWeights } from '../../../theme';

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  showChevron?: boolean;
  variant?: 'default' | 'grid';
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, subtitle, onPress, showChevron = true, variant = 'default' }) => {
  const { colors, fontSizes, fonts, fontWeights } = useTheme();
  
  const styles = StyleSheet.create({
    menuItem: {
      flexDirection: variant === 'grid' ? 'column' : 'row',
      alignItems: 'center',
      paddingHorizontal: variant === 'grid' ? spacing.xs : spacing.sm,
      paddingVertical: variant === 'grid' ? spacing.sm : spacing.sm,
      marginHorizontal: variant === 'grid' ? 0 : spacing.md,
      marginBottom: spacing.xs,
      borderRadius: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
      flex: variant === 'grid' ? 1 : undefined,
      minHeight: variant === 'grid' ? 60 : undefined,
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
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name={icon as any} size={variant === 'grid' ? 16 : 18} color={colors.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, { color: colors.text, fontFamily: fonts.medium }]}>
          {title}
        </Text>
        {variant === 'default' && (
          <Text style={[styles.menuSubtitle, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {showChevron && variant === 'default' && (
        <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
      )}
    </TouchableOpacity>
  );
};

export default function AdminAccountTab() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { colors, fonts, fontSizes } = useTheme();
  const [themeModalVisible, setThemeModalVisible] = useState(false);

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
      color: colors.textInverse,
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    customerButton: {
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
    customerButtonText: {
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    loadingText: {
      fontSize: fontSizes.base,
      fontFamily: fonts.regular,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.md,
    },
  });

  const handleLogout = async () => {
    try {
      await logout();
      // Use replace to ensure we don't go back to admin pages
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to home
      router.replace('/(tabs)/home');
    }
  };

  // Show loading state while user data is being fetched
  if (!user) {
    return (
      <View style={styles.container}>
        <Header
          title="My Account"
          subtitle="Loading..."
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
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
        subtitle="Admin Dashboard"
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Admin Profile Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            {user?.avatar ? (
              <Image 
                source={{ uri: user.avatar }} 
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="shield" size={28} color={colors.textInverse} />
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Admin User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            {user?.phone && (
              <Text style={styles.userPhone}>{getDisplayPhone(user.phone)}</Text>
            )}
            <Text style={styles.userRole}>
              {user?.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
            </Text>
          </View>
        </View>

        {/* Analytics Section */}
        <Text style={styles.sectionTitle}>Analytics & Reports</Text>
        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <MenuItem
              icon="person"
              title="User management"
              subtitle=""
              onPress={() => router.push('/(admin)/users')}
              variant="grid"
              showChevron={false}
            />
          </View>
          <View style={styles.gridItem}>
            <MenuItem
              icon="flag"
              title="Reports"
              subtitle=""
              onPress={() => router.push('/(admin)/moderation/reports')}
              variant="grid"
              showChevron={false}
            />
          </View>
          <View style={styles.gridItem}>
            <MenuItem
              icon="star"
              title="Reviews"
              subtitle=""
              onPress={() => router.push('/(admin)/moderation/reviews')}
              variant="grid"
              showChevron={false}
            />
          </View>
          <View style={styles.gridItem}>
            <MenuItem
              icon="cog"
              title="Settings"
              subtitle=""
              onPress={() => setThemeModalVisible(true)}
              variant="grid"
              showChevron={false}
            />
          </View>
        </View>

        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        
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
          icon="help-circle-outline"
          title="Help & Support"
          subtitle="Admin documentation and support"
          onPress={() => router.push('/(admin)/moderation/tickets')}
        />

        {/* Logout */}
        <MenuItem
          icon="log-out-outline"
          title="Sign Out"
          subtitle="Sign out of your account"
          onPress={handleLogout}
          showChevron={false}
        />

                {/* Customer View shortcut */}
        <TouchableOpacity
          style={styles.customerButton}
          onPress={() => router.push('/(tabs)/home')}
        >
          <Ionicons name="storefront" size={18} color={colors.primary} />
          <Text style={styles.customerButtonText}>Customer View</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </TouchableOpacity>

        <ThemeModal
          visible={themeModalVisible}
          onClose={() => setThemeModalVisible(false)}
        />

      </ScrollView>
    </View>
  );
}
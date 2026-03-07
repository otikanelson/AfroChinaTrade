import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';

export default function AccountTab() {
  const router = useRouter();
  const menuItems = [
    { icon: 'person-outline', title: 'Profile', subtitle: 'Edit your information' },
    { icon: 'receipt-outline', title: 'Orders', subtitle: 'View order history' },
    { icon: 'heart-outline', title: 'Wishlist', subtitle: 'Saved products' },
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
            <Ionicons name="person" size={40} color={theme.colors.background} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Guest User</Text>
            <Text style={styles.userEmail}>Sign in to access all features</Text>
          </View>
          <TouchableOpacity style={styles.signInButton}>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon as any} size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Admin Dashboard shortcut (dev/seller access) */}
        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => router.push('/(admin)/(tabs)/products')}
        >
          <Ionicons name="settings-outline" size={20} color={theme.colors.background} />
          <Text style={styles.adminButtonText}>Admin Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    backgroundColor: theme.colors.background,
    paddingTop: 40,
    paddingBottom: theme.spacing.base,
    paddingHorizontal: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  headerTitle: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  userCard: {
    backgroundColor: theme.colors.background,
    margin: theme.spacing.base,
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  userName: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  signInButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.base,
  },
  signInText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
  },
  menuSection: {
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.base,
    marginTop: theme.spacing.base,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.base,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.base,
    marginTop: theme.spacing.base,
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  logoutText: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    marginHorizontal: theme.spacing.base,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  adminButtonText: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.background,
  },
});

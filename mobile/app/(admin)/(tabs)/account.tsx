import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';


export default function AdminAccountTab() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { colors, fonts, fontSizes, spacing } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      backgroundColor: colors.background,
      paddingTop: 40,
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
      fontFamily: fonts.bold,
      color: colors.primary,
      marginTop: 2,
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
    customerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      marginHorizontal: spacing.base,
      marginTop: spacing.base,
      padding: spacing.base,
      borderRadius: 12,
      gap: spacing.sm,
    },
    customerButtonText: {
      fontSize: fontSizes.base,
      fontFamily: fonts.medium,
      color: colors.background,
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

  const adminMenuItems = [
    { icon: 'person-outline', title: 'Profile', subtitle: 'Edit admin information', route: '/profile' },
    { icon: 'people-outline', title: 'User Management', subtitle: 'Manage users', route: '/(admin)/users' },
    { icon: 'shield-outline', title: 'Moderation', subtitle: 'Content moderation', route: '/(admin)/moderation/reports' },
    { icon: 'analytics-outline', title: 'Analytics', subtitle: 'View reports and stats', route: null },
    { icon: 'settings-outline', title: 'Settings', subtitle: 'App preferences', route: '/(admin)/settings' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Account</Text>
        <Text style={styles.headerSubtitle}>Administrative settings and profile</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Admin Info */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Ionicons name="shield" size={40} color={colors.background} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Admin User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'admin@example.com'}</Text>
            <Text style={styles.userRole}>Administrator</Text>
          </View>
        </View>

        {/* Admin Menu Items */}
        <View style={styles.menuSection}>
          {adminMenuItems.map((item) => (
            <TouchableOpacity 
              key={item.title} 
              style={styles.menuItem}
              onPress={() => item.route && router.push(item.route as any)}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon as any} size={24} color={colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Customer View Button */}
        <TouchableOpacity
          style={styles.customerButton}
          onPress={() => router.push('/(tabs)/home')}
        >
          <Ionicons name="storefront-outline" size={20} color={colors.background} />
          <Text style={styles.customerButtonText}>View Customer App</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
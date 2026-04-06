import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { Header } from '../components/Header';
import { spacing } from '../theme/spacing';
import { NotificationSettings } from '../services/NotificationService';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

export default function NotificationSettingsScreen() {
  const { colors, fontSizes, fontWeights, borderRadius } = useTheme();
  const { isAuthenticated } = useAuth();
  
  const {
    settings,
    settingsLoading,
    settingsSaving,
    updateSettings,
  } = useNotifications();

  const [localSettings, setLocalSettings] = useState<NotificationSettings | null>(null);

  // Update local settings when settings change
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    content: {
      flex: 1,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    loadingText: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      marginTop: spacing.md,
    },
    section: {
      backgroundColor: colors.background,
      marginTop: spacing.sm,
      paddingVertical: spacing.xs,
    },
    sectionTitle: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.bold,
      color: colors.textSecondary,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      textTransform: 'uppercase',
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingIcon: {
      marginRight: spacing.sm,
    },
    settingInfo: {
      flex: 1,
    },
    settingTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
      color: colors.text,
      marginBottom: 2,
    },
    settingDescription: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    saveButton: {
      backgroundColor: colors.primary,
      marginHorizontal: spacing.base,
      marginVertical: spacing.base,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    saveButtonText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    expoGoNotice: {
      backgroundColor: colors.warning + '20',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      marginHorizontal: spacing.base,
      marginTop: spacing.sm,
      borderRadius: borderRadius.sm,
      borderLeftWidth: 4,
      borderLeftColor: colors.warning,
    },
    expoGoNoticeText: {
      fontSize: fontSizes.sm,
      color: colors.warning,
      textAlign: 'center',
    },
    signInButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      marginTop: spacing.lg,
    },
    signInButtonText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    emptyText: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.medium,
      color: colors.text,
      marginTop: spacing.md,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
  });

  // Handle unauthenticated users
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Header title="Notification Settings" showBack={true} />
        <View style={styles.centerContainer}>
          <Ionicons name="settings-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>Sign in to manage settings</Text>
          <Text style={styles.emptySubtext}>
            You need to be signed in to configure your notification preferences
          </Text>
        </View>
      </View>
    );
  }

  const toggleSetting = (key: keyof NotificationSettings) => {
    if (!localSettings) return;
    setLocalSettings(prev => prev ? { ...prev, [key]: !prev[key] } : null);
  };

  const saveSettings = async () => {
    if (!localSettings) return;

    try {
      await updateSettings(localSettings);
      Alert.alert('Success', 'Notification preferences saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save notification preferences');
    }
  };

  if (settingsLoading) {
    return (
      <View style={styles.container}>
        <Header title="Notification Settings" showBack={true} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Notification Settings" showBack={true} />

      {isExpoGo && (
        <View style={styles.expoGoNotice}>
          <Text style={styles.expoGoNoticeText}>
            📱 Push notifications are limited in Expo Go. Use a development build for full functionality.
          </Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {localSettings && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Content Preferences</Text>
              
              <View style={styles.settingItem}>
                <Ionicons name="cube-outline" size={24} color={colors.primary} style={styles.settingIcon} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Order Updates</Text>
                  <Text style={styles.settingDescription}>Get notified about your order status</Text>
                </View>
                <Switch
                  value={localSettings.orderUpdates}
                  onValueChange={() => toggleSetting('orderUpdates')}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View style={styles.settingItem}>
                <Ionicons name="pricetag-outline" size={24} color={colors.primary} style={styles.settingIcon} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Promotions</Text>
                  <Text style={styles.settingDescription}>Receive special offers and deals</Text>
                </View>
                <Switch
                  value={localSettings.promotions}
                  onValueChange={() => toggleSetting('promotions')}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View style={styles.settingItem}>
                <Ionicons name="sparkles-outline" size={24} color={colors.primary} style={styles.settingIcon} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>New Products</Text>
                  <Text style={styles.settingDescription}>Be first to know about new arrivals</Text>
                </View>
                <Switch
                  value={localSettings.newProducts}
                  onValueChange={() => toggleSetting('newProducts')}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View style={styles.settingItem}>
                <Ionicons name="trending-down-outline" size={24} color={colors.primary} style={styles.settingIcon} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Price Drops</Text>
                  <Text style={styles.settingDescription}>Get alerts on price reductions</Text>
                </View>
                <Switch
                  value={localSettings.priceDrops}
                  onValueChange={() => toggleSetting('priceDrops')}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View style={styles.settingItem}>
                <Ionicons name="megaphone-outline" size={24} color={colors.primary} style={styles.settingIcon} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>New Ads</Text>
                  <Text style={styles.settingDescription}>Get notified about new promotional ads</Text>
                </View>
                <Switch
                  value={localSettings.newAds}
                  onValueChange={() => toggleSetting('newAds')}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
                <Ionicons name="mail-outline" size={24} color={colors.primary} style={styles.settingIcon} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Newsletter</Text>
                  <Text style={styles.settingDescription}>Weekly updates and tips</Text>
                </View>
                <Switch
                  value={localSettings.newsletter}
                  onValueChange={() => toggleSetting('newsletter')}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Delivery Methods</Text>
              
              <View style={styles.settingItem}>
                <Ionicons name="notifications-outline" size={24} color={colors.primary} style={styles.settingIcon} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Push Notifications</Text>
                  <Text style={styles.settingDescription}>
                    {isExpoGo ? 'Limited in Expo Go - use development build' : 'Receive notifications on your device'}
                  </Text>
                </View>
                <Switch
                  value={localSettings.pushNotifications && !isExpoGo}
                  onValueChange={(value) => {
                    if (!isExpoGo) {
                      toggleSetting('pushNotifications');
                    }
                  }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  disabled={isExpoGo}
                />
              </View>

              <View style={styles.settingItem}>
                <Ionicons name="mail-outline" size={24} color={colors.primary} style={styles.settingIcon} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Email Notifications</Text>
                  <Text style={styles.settingDescription}>Receive updates via email</Text>
                </View>
                <Switch
                  value={localSettings.emailNotifications}
                  onValueChange={() => toggleSetting('emailNotifications')}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
                <Ionicons name="chatbubble-outline" size={24} color={colors.primary} style={styles.settingIcon} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>SMS Notifications</Text>
                  <Text style={styles.settingDescription}>Receive text messages</Text>
                </View>
                <Switch
                  value={localSettings.smsNotifications}
                  onValueChange={() => toggleSetting('smsNotifications')}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {localSettings && (
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveSettings}
          disabled={settingsSaving}
        >
          {settingsSaving ? (
            <ActivityIndicator size="small" color={colors.textInverse} />
          ) : (
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
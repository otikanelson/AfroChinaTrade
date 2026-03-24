import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { Header } from '../components/Header';
import { API_BASE_URL } from '../constants/config';
import { tokenManager } from '../services/api/tokenManager';
import { spacing } from '../theme/spacing';

interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  newProducts: boolean;
  priceDrops: boolean;
  newsletter: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export default function NotificationsScreen() {
  const { isAuthenticated } = useRequireAuth('Please sign in to manage notifications');
  const router = useRouter();
  const { colors, fontSizes, fontWeights, borderRadius } = useTheme();
  const { user } = useAuth();
  
  const [settings, setSettings] = useState<NotificationSettings>({
    orderUpdates: true,
    promotions: true,
    newProducts: false,
    priceDrops: true,
    newsletter: false,
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
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
    content: {
      flex: 1,
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
  });

  const fetchSettings = useCallback(async (isRefresh: boolean = false) => {
    if (!user?.id) return;

    const token = await tokenManager.getAccessToken();
    if (!token) return;

    try {
      if (!isRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `${API_BASE_URL}/users/notification-settings`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.status === 'success' && data.data) {
        setSettings(data.data);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching notification settings:', err);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchSettings();
    }
  }, [isAuthenticated, user?.id, fetchSettings]);

  const handleRefresh = useCallback(() => {
    fetchSettings(true);
  }, [fetchSettings]);

  const toggleSetting = (key: keyof NotificationSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveSettings = async () => {
    const token = await tokenManager.getAccessToken();
    if (!token) return;

    try {
      setSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/users/notification-settings`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(settings),
        }
      );

      const data = await response.json();

      if (data.status === 'success') {
        // Show success message
      }
    } catch (err) {
      console.error('Error saving notification settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Notifications" showBack={true} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Notifications" showBack={true} />

      <FlatList
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
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
                  value={settings.orderUpdates}
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
                  value={settings.promotions}
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
                  value={settings.newProducts}
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
                  value={settings.priceDrops}
                  onValueChange={() => toggleSetting('priceDrops')}
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
                  value={settings.newsletter}
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
                  <Text style={styles.settingDescription}>Receive notifications on your device</Text>
                </View>
                <Switch
                  value={settings.pushNotifications}
                  onValueChange={() => toggleSetting('pushNotifications')}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View style={styles.settingItem}>
                <Ionicons name="mail-outline" size={24} color={colors.primary} style={styles.settingIcon} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Email Notifications</Text>
                  <Text style={styles.settingDescription}>Receive updates via email</Text>
                </View>
                <Switch
                  value={settings.emailNotifications}
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
                  value={settings.smsNotifications}
                  onValueChange={() => toggleSetting('smsNotifications')}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
            </View>
          </>
        }
        data={[]}
        renderItem={null}
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveSettings}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color={colors.textInverse} />
        ) : (
          <Text style={styles.saveButtonText}>Save Preferences</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

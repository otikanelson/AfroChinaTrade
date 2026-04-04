import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { Header } from '../components/Header';
import { DateDivider, createListWithDateDividers } from '../components/DateDivider';
import { spacing } from '../theme/spacing';
import { Notification, NotificationSettings } from '../services/NotificationService';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
  onMarkAsRead: (id: string) => void;
  colors: any;
  fontSizes: any;
  fontWeights: any;
  borderRadius: any;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onMarkAsRead,
  colors,
  fontSizes,
  fontWeights,
  borderRadius,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order_update':
        return 'cube-outline';
      case 'refund_request':
        return 'card-outline';
      case 'system':
        return 'settings-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order_update':
        return colors.success;
      case 'refund_request':
        return colors.warning;
      case 'system':
        return colors.info;
      default:
        return colors.primary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: notification.read ? colors.background : colors.surface,
          paddingHorizontal: spacing.base,
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: 'row',
          alignItems: 'flex-start',
        },
        !notification.read && {
          borderLeftWidth: 4,
          borderLeftColor: colors.primary,
        },
      ]}
      onPress={() => onPress(notification)}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: getTypeColor(notification.type) + '20',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: spacing.sm,
        }}
      >
        <Ionicons
          name={getTypeIcon(notification.type) as any}
          size={20}
          color={getTypeColor(notification.type)}
        />
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text
            style={{
              fontSize: fontSizes.base,
              fontWeight: notification.read ? fontWeights.medium : fontWeights.bold,
              color: colors.text,
              flex: 1,
              marginRight: spacing.xs,
            }}
          >
            {notification.title}
          </Text>
          <Text
            style={{
              fontSize: fontSizes.xs,
              color: colors.textSecondary,
            }}
          >
            {formatDate(notification.createdAt)}
          </Text>
        </View>

        <Text
          style={{
            fontSize: fontSizes.sm,
            color: colors.textSecondary,
            marginTop: 2,
            lineHeight: 18,
          }}
          numberOfLines={2}
        >
          {notification.message}
        </Text>

        {!notification.read && (
          <TouchableOpacity
            style={{
              alignSelf: 'flex-start',
              marginTop: spacing.xs,
              paddingHorizontal: spacing.sm,
              paddingVertical: 4,
              backgroundColor: colors.primary + '20',
              borderRadius: borderRadius.sm,
            }}
            onPress={() => onMarkAsRead(notification.id)}
          >
            <Text
              style={{
                fontSize: fontSizes.xs,
                color: colors.primary,
                fontWeight: fontWeights.medium,
              }}
            >
              Mark as read
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors, fontSizes, fontWeights, borderRadius } = useTheme();
  const { user, isAuthenticated } = useAuth();
  
  const {
    notifications,
    unreadCount,
    settings,
    loading,
    refreshing,
    settingsLoading,
    settingsSaving,
    error,
    hasMore,
    fetchNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    updateSettings,
  } = useNotifications();

  const [showSettings, setShowSettings] = useState(false);
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
    headerActions: {
      flexDirection: 'row',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      marginRight: spacing.sm,
    },
    headerButtonText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      marginLeft: spacing.xs,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
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
    loadMoreButton: {
      backgroundColor: colors.background,
      paddingVertical: spacing.md,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    loadMoreText: {
      fontSize: fontSizes.base,
      color: colors.primary,
      fontWeight: fontWeights.medium,
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
    errorContainer: {
      backgroundColor: colors.error + '20',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      marginHorizontal: spacing.base,
      marginTop: spacing.sm,
      borderRadius: borderRadius.sm,
      borderLeftWidth: 4,
      borderLeftColor: colors.error,
    },
    errorText: {
      fontSize: fontSizes.sm,
      color: colors.error,
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
  });

  // Handle unauthenticated users
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Header title="Notifications" showBack={true} />
        <View style={styles.centerContainer}>
          <Ionicons name="notifications-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>Sign in to view notifications</Text>
          <Text style={styles.emptySubtext}>
            You need to be signed in to access your notifications
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type and data
    if (notification.data?.refundId) {
      router.push('/my-refunds');
    } else if (notification.data?.orderId) {
      router.push(`/order-detail/${notification.data.orderId}`);
    } else if (notification.data?.threadId) {
      router.push(`/message-thread/${notification.data.threadId}`);
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;

    Alert.alert(
      'Mark All as Read',
      `Mark all ${unreadCount} notifications as read?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mark All', onPress: markAllAsRead },
      ]
    );
  };

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

  const listItems = useMemo(() => {
    return createListWithDateDividers(
      notifications,
      (item) => item.id,
      (item) => item.createdAt
    );
  }, [notifications]);

  const renderNotification = useCallback(({ item }: { item: any }) => {
    if (item.type === 'divider') {
      return <DateDivider date={item.label} />;
    }

    const notification = item.data;
    return (
      <NotificationItem
        notification={notification}
        onPress={handleNotificationPress}
        onMarkAsRead={markAsRead}
        colors={colors}
        fontSizes={fontSizes}
        fontWeights={fontWeights}
        borderRadius={borderRadius}
      />
    );
  }, [colors, fontSizes, fontWeights, borderRadius]);

  const renderLoadMore = () => {
    if (!hasMore) return null;

    return (
      <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
        <Text style={styles.loadMoreText}>Load More</Text>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyText}>No notifications yet</Text>
      <Text style={styles.emptySubtext}>
        You'll see important updates and messages here
      </Text>
    </View>
  );

  if (loading && notifications.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Notifications" showBack={true} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title={showSettings ? "Notification Settings" : "Notifications"} 
        showBack={true}
        rightAction={
          !showSettings ? (
            <TouchableOpacity onPress={() => setShowSettings(true)}>
              <Ionicons name="settings-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          )
        }
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isExpoGo && (
        <View style={styles.expoGoNotice}>
          <Text style={styles.expoGoNoticeText}>
            📱 Push notifications are limited in Expo Go. Use a development build for full functionality.
          </Text>
        </View>
      )}

      {showSettings ? (
        // Settings View
        <>
          {settingsLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading settings...</Text>
            </View>
          ) : (
            <FlatList
              style={styles.content}
              ListHeaderComponent={
                localSettings ? (
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
                ) : null
              }
              data={[]}
              renderItem={null}
            />
          )}

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
        </>
      ) : (
        // Notifications List View
        <>
          {notifications.length > 0 && (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: colors.primary + '20' }]}
                onPress={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                <Ionicons name="checkmark-done" size={16} color={colors.primary} />
                <Text style={[styles.headerButtonText, { color: colors.primary }]}>
                  Mark All Read ({unreadCount})
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <FlatList
            style={styles.content}
            data={listItems}
            renderItem={renderNotification}
            keyExtractor={(item: any) => item.key}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchNotifications(true)}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderLoadMore}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { notificationService, Notification, NotificationSettings } from '../services/NotificationService';
import { useAuth } from '../contexts/AuthContext';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings | null;
  loading: boolean;
  refreshing: boolean;
  settingsLoading: boolean;
  settingsSaving: boolean;
  error: string | null;
  hasMore: boolean;
  fetchNotifications: (refresh?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  updateSettings: (settings: NotificationSettings) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(async (refresh: boolean = false) => {
    if (!user?.id) return;

    try {
      if (refresh) {
        setRefreshing(true);
        setCurrentPage(1);
      } else if (!refresh && currentPage === 1) {
        setLoading(true);
      }

      setError(null);

      const page = refresh ? 1 : currentPage;
      const response = await notificationService.getNotifications({
        page,
        limit: 20,
      });

      if (response.success && response.data) {
        if (refresh || page === 1) {
          setNotifications(response.data);
        } else {
          setNotifications(prev => [...prev, ...response.data]);
        }

        if (response.pagination) {
          setHasMore(page < response.pagination.pages);
          if (!refresh) {
            setCurrentPage(page + 1);
          }
        }
      } else {
        setError(response.message || 'Failed to fetch notifications');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, currentPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || refreshing) return;
    await fetchNotifications(false);
  }, [hasMore, loading, refreshing, fetchNotifications]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await notificationService.getUnreadCount();
      if (response.success && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [user?.id]);

  const fetchSettings = useCallback(async () => {
    if (!user?.id) return;

    try {
      setSettingsLoading(true);
      setError(null);

      const response = await notificationService.getNotificationSettings();
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        setError(response.message || 'Failed to fetch notification settings');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notification settings');
    } finally {
      setSettingsLoading(false);
    }
  }, [user?.id]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await notificationService.markAsRead(id);
      if (response.success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === id
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: NotificationSettings) => {
    try {
      setSettingsSaving(true);
      setError(null);

      const response = await notificationService.updateNotificationSettings(newSettings);
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        setError(response.message || 'Failed to update notification settings');
        throw new Error(response.message || 'Failed to update notification settings');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update notification settings');
      throw err;
    } finally {
      setSettingsSaving(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (user?.id) {
      fetchNotifications(true);
      fetchUnreadCount();
      fetchSettings();
    }
  }, [user?.id]);

  return {
    notifications,
    unreadCount,
    settings,
    loading,
    refreshing,
    settingsLoading,
    settingsSaving,
    error,
    hasMore,
    fetchNotifications: (refresh = true) => fetchNotifications(refresh),
    loadMore,
    markAsRead,
    markAllAsRead,
    updateSettings,
    fetchUnreadCount,
  };
};
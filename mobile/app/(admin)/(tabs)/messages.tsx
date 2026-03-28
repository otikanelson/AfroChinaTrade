import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useNavigation, useFocusEffect } from 'expo-router';

import { messageService } from '../../../services/MessageService';
import { MessageThread } from '../../../types/message';
import { Card } from '../../../components/admin/Card';
import { DataList } from '../../../components/admin/DataList';
import { SearchBar } from '../../../components/admin/SearchBar';
import { useTheme } from '../../../contexts/ThemeContext';
import { Header } from '../../../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { useMessages } from '../../../contexts/MessagesContext';






// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const diff = now - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

type FilterType = 'all' | 'unread';

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<ChipProps> = ({ label, active, onPress }) => {
  const { colors, fontSizes, fontWeights } = useTheme();
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 20,
          borderWidth: 1.5,
          borderColor: active ? colors.primary : colors.border,
          backgroundColor: active ? colors.primary : colors.background,
        }
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[
        {
          fontSize: fontSizes.sm,
          fontWeight: fontWeights.medium as any,
          color: active ? colors.background : colors.textSecondary,
        }
      ]}>{label}</Text>
    </TouchableOpacity>
  );
};

// ─── Thread card ──────────────────────────────────────────────────────────────

interface ThreadCardProps {
  thread: MessageThread;
  onPress: () => void;
}

const ThreadCard: React.FC<ThreadCardProps> = ({ thread, onPress }) => {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const hasUnread = thread.unreadCount > 0;
  return (
    <Card onPress={onPress} style={{ marginHorizontal: spacing.base, marginVertical: spacing.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        {/* Avatar */}
        <View style={[
          {
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: colors.surface,
            borderWidth: 2,
            borderColor: hasUnread ? colors.primary : colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          },
          hasUnread && { backgroundColor: colors.primary + '20' }
        ]}>
          <Text style={{
            fontSize: fontSizes.lg,
            fontWeight: fontWeights.bold as any,
            color: colors.primary,
          }}>
            {thread.customerName.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Content */}
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text
              style={[
                {
                  fontSize: fontSizes.base,
                  fontWeight: hasUnread ? fontWeights.bold as any : fontWeights.medium as any,
                  color: colors.text,
                  flex: 1,
                  marginRight: spacing.sm,
                }
              ]}
              numberOfLines={1}
            >
              {thread.customerName}
            </Text>
            <Text style={{
              fontSize: fontSizes.xs,
              color: colors.textSecondary,
              flexShrink: 0,
            }}>{formatRelativeTime(thread.lastMessageAt)}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text
              style={[
                {
                  fontSize: fontSizes.sm,
                  color: hasUnread ? colors.text : colors.textSecondary,
                  fontWeight: hasUnread ? fontWeights.medium as any : 'normal',
                  flex: 1,
                  marginRight: spacing.sm,
                }
              ]}
              numberOfLines={1}
            >
              {thread.lastMessage}
            </Text>
            {hasUnread && (
              <View style={{
                backgroundColor: colors.primary,
                borderRadius: borderRadius.full,
                minWidth: 20,
                height: 20,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 5,
                flexShrink: 0,
              }}>
                <Text style={{
                  fontSize: 11,
                  fontWeight: fontWeights.bold as any,
                  color: colors.background,
                }}>
                  {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MessagesScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const { refreshUnreadCount } = useMessages();

  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [activeTab, setActiveTab] = useState<'inquiry' | 'quotation'>('inquiry');

  // ── Notification permissions ───────────────────────────────────────────────

  useEffect(() => {
    // requestNotificationPermissions(); // Commented out for now
  }, []);

  // ── Polling for new messages ───────────────────────────────────────────────

  // useMessagePolling({ onThreadsUpdated: handleThreadsUpdated }); // Commented out for now

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchThreads = useCallback(async (isRefresh = false, isAutoRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (!isAutoRefresh) {
        setLoading(true);
      }
      setError(null);

      const response = await messageService.getThreads(1, 100);

      if (response.success && response.data) {
        setThreads(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to load messages');
      }
    } catch (err) {
      console.error('Error fetching message threads:', err);
      setError('Failed to load messages. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  // Auto-refresh when screen comes into focus (e.g., returning from a thread)
  // This ensures that when admins navigate back from conversation threads,
  // the message list and unread counts are updated to reflect any messages
  // that were marked as read while viewing the conversation
  useFocusEffect(
    React.useCallback(() => {
      // Set auto-refreshing state for visual feedback
      setIsAutoRefreshing(true);
      
      // Add a small delay to ensure any read status updates are processed
      const refreshTimeout = setTimeout(() => {
        // Refresh both unread count and message threads
        Promise.all([
          refreshUnreadCount(),
          fetchThreads(false, true) // isAutoRefresh = true
        ]).finally(() => {
          setIsAutoRefreshing(false);
        });
      }, 300); // 300ms delay
      
      // Cleanup timeout if component unmounts
      return () => {
        clearTimeout(refreshTimeout);
        setIsAutoRefreshing(false);
      };
    }, [refreshUnreadCount, fetchThreads])
  );

  const handleRefresh = useCallback(() => fetchThreads(true), [fetchThreads]);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filteredThreads = useMemo(() => {
    const threadsArray = Array.isArray(threads) ? threads : [];
    let result = threadsArray;

    // Filter by tab (thread type)
    if (activeTab === 'inquiry') {
      result = result.filter((t) => t.threadType === 'product_inquiry');
    } else if (activeTab === 'quotation') {
      result = result.filter((t) => t.threadType === 'quote_request');
    }

    if (filter === 'unread') {
      result = result.filter((t) => t.unreadCount > 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => t.customerName.toLowerCase().includes(q));
    }

    return result;
  }, [threads, filter, searchQuery, activeTab]);

  const totalUnread = useMemo(
    () => {
      const threadsArray = Array.isArray(threads) ? threads : [];
      return threadsArray.reduce((sum, t) => sum + t.unreadCount, 0);
    },
    [threads],
  );

  const inquiryUnread = useMemo(
    () => {
      const threadsArray = Array.isArray(threads) ? threads : [];
      return threadsArray
        .filter((t) => t.threadType === 'product_inquiry')
        .reduce((sum, t) => sum + t.unreadCount, 0);
    },
    [threads],
  );

  const quotationUnread = useMemo(
    () => {
      const threadsArray = Array.isArray(threads) ? threads : [];
      return threadsArray
        .filter((t) => t.threadType === 'quote_request')
        .reduce((sum, t) => sum + t.unreadCount, 0);
    },
    [threads],
  );

  // Update tab badge with unread count
  useEffect(() => {
    navigation.setOptions({
      tabBarBadge: totalUnread > 0 ? totalUnread : undefined,
    });
  }, [totalUnread, navigation]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  const handleThreadPress = useCallback(
    (thread: MessageThread) => {
      router.push({
        pathname: '/(admin)/message/[threadId]',
        params: { threadId: thread.threadId },
      });
    },
    [router],
  );

  // ── Render helpers ─────────────────────────────────────────────────────────

  const renderThread = useCallback(
    ({ item }: { item: MessageThread }) => (
      <ThreadCard thread={item} onPress={() => handleThreadPress(item)} />
    ),
    [handleThreadPress],
  );

  const keyExtractor = useCallback((item: MessageThread) => item.threadId, []);

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.surface,
    },

    // List
    listContent: {
      paddingBottom: spacing.xl,
    },
    listHeader: {
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
      gap: spacing.sm,
    },

    // Search & filters
    searchBar: {
      marginHorizontal: spacing.base,
    },
    filterRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.base,
      gap: spacing.sm,
    },

    // Filter chips
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    chipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    chipText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium as any,
      color: colors.textSecondary,
    },
    chipTextActive: {
      color: colors.background,
    },

    // Tab styles
    tabContainer: {
      flexDirection: 'row',
      marginHorizontal: spacing.base,
      marginBottom: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.xs,
    },
    tab: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabActive: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium as any,
      color: colors.textSecondary,
    },
    tabTextActive: {
      color: colors.background,
      fontWeight: fontWeights.semibold as any,
    },
    tabBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: colors.error,
      borderRadius: borderRadius.full,
      minWidth: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    tabBadgeText: {
      fontSize: 10,
      fontWeight: fontWeights.bold as any,
      color: colors.background,
    },

    // Thread card
    card: {
      marginHorizontal: spacing.base,
      marginVertical: spacing.xs,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    avatar: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    avatarUnread: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '20',
    },
    avatarText: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold as any,
      color: colors.primary,
    },
    cardContent: {
      flex: 1,
      gap: 4,
    },
    cardTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    customerName: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium as any,
      color: colors.text,
      flex: 1,
      marginRight: spacing.sm,
    },
    customerNameUnread: {
      fontWeight: fontWeights.bold as any,
    },
    timestamp: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      flexShrink: 0,
    },
    cardBottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    lastMessage: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      flex: 1,
      marginRight: spacing.sm,
    },
    lastMessageUnread: {
      color: colors.text,
      fontWeight: fontWeights.medium as any,
    },
    unreadBadge: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.full,
      minWidth: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 5,
      flexShrink: 0,
    },
    unreadBadgeText: {
      fontSize: 11,
      fontWeight: fontWeights.bold as any,
      color: colors.background,
    },

    // Error state
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
      gap: spacing.md,
    },
    errorText: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    retryButton: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.primary,
    },
    retryText: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold as any,
      color: colors.background,
    },
  });

  const ListHeader = (
    <View style={styles.listHeader}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'inquiry' && styles.tabActive]}
          onPress={() => setActiveTab('inquiry')}
        >
          <Text style={[styles.tabText, activeTab === 'inquiry' && styles.tabTextActive]}>
            Inquiries
          </Text>
          {inquiryUnread > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {inquiryUnread > 99 ? '99+' : inquiryUnread}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'quotation' && styles.tabActive]}
          onPress={() => setActiveTab('quotation')}
        >
          <Text style={[styles.tabText, activeTab === 'quotation' && styles.tabTextActive]}>
            Quotations
          </Text>
          {quotationUnread > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {quotationUnread > 99 ? '99+' : quotationUnread}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by customer name…"
        style={styles.searchBar}
        testID="messages-search"
      />
      <View
        style={styles.filterRow}
      >
        <FilterChip
          label="All"
          active={filter === 'all'}
          onPress={() => setFilter('all')}
        />
        <FilterChip
          label={`Unread${totalUnread > 0 ? ` (${totalUnread})` : ''}`}
          active={filter === 'unread'}
          onPress={() => setFilter('unread')}
        />
      </View>
    </View>
  );

  // ── Error state ────────────────────────────────────────────────────────────

  if (error && !loading && threads.length === 0) {
    return (
      <View style={styles.screen}>
        <Header 
          title="Messages"
          subtitle={isAutoRefreshing ? "Refreshing..." : `${activeTab === 'inquiry' ? 'Customer inquiries' : 'Quote requests'}`}
          rightAction={
            isAutoRefreshing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : undefined
          }
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchThreads()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <View style={styles.screen}>
      <Header 
        title="Messages"
        subtitle={isAutoRefreshing ? "Refreshing..." : `${activeTab === 'inquiry' ? 'Customer inquiries' : 'Quote requests'}`}
        rightAction={
          isAutoRefreshing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : undefined
        }
      />

      <DataList<MessageThread>
        data={filteredThreads}
        renderItem={renderThread}
        keyExtractor={keyExtractor}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        emptyMessage={
          searchQuery || filter === 'unread'
            ? `No ${activeTab === 'inquiry' ? 'inquiries' : 'quotations'} match your filters.`
            : `No ${activeTab === 'inquiry' ? 'inquiries' : 'quotations'} yet.`
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        skeletonCount={5}
      />
    </View>
  );
}

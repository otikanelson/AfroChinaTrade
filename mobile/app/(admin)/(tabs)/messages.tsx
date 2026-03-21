import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { messageService } from '../../../services/MessageService';
import { MessageThread } from '../../../types/messages';
import { Card } from '../../../components/admin/Card';
import { DataList } from '../../../components/admin/DataList';
import { SearchBar } from '../../../components/admin/SearchBar';
import { useTheme } from '../../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';






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
  const { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } = useTheme();

  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  // ── Notification permissions ───────────────────────────────────────────────

  useEffect(() => {
    // requestNotificationPermissions(); // Commented out for now
  }, []);

  // ── Polling for new messages ───────────────────────────────────────────────

  const handleThreadsUpdated = useCallback((updated: MessageThread[]) => {
    setThreads(updated);
  }, []);

  // useMessagePolling({ onThreadsUpdated: handleThreadsUpdated }); // Commented out for now

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchThreads = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const response = await messageService.getThreads({
        page: 1,
        limit: 100, // Get all threads for now
      });

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

  const handleRefresh = useCallback(() => fetchThreads(true), [fetchThreads]);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filteredThreads = useMemo(() => {
    const threadsArray = Array.isArray(threads) ? threads : [];
    let result = threadsArray;

    if (filter === 'unread') {
      result = result.filter((t) => t.unreadCount > 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => t.customerName.toLowerCase().includes(q));
    }

    return result;
  }, [threads, filter, searchQuery]);

  const totalUnread = useMemo(
    () => {
      const threadsArray = Array.isArray(threads) ? threads : [];
      return threadsArray.reduce((sum, t) => sum + t.unreadCount, 0);
    },
    [threads],
  );

  // ── Navigation ─────────────────────────────────────────────────────────────

  const handleThreadPress = useCallback(
    (thread: MessageThread) => {
      router.push({
        pathname: '/(admin)/message/[threadId]',
        params: { threadId: thread.id },
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

  const keyExtractor = useCallback((item: MessageThread) => item.id, []);

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      backgroundColor: colors.background,
      gap: spacing.sm,
    },
    headerTitle: {
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.bold as any,
      color: colors.text,
    },
    headerBadge: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.full,
      minWidth: 22,
      height: 22,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
    },
    headerBadgeText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.bold as any,
      color: colors.background,
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
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchThreads()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        {totalUnread > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{totalUnread}</Text>
          </View>
        )}
      </View>

      <DataList<MessageThread>
        data={filteredThreads}
        renderItem={renderThread}
        keyExtractor={keyExtractor}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        emptyMessage={
          searchQuery || filter === 'unread'
            ? 'No messages match your filters.'
            : 'No messages yet.'
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        skeletonCount={5}
      />
    </SafeAreaView>
  );
}

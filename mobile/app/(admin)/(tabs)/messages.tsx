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

import { AsyncStorageAdapter } from '../../../../shared/src/services/storage/AsyncStorageAdapter';
import { Card } from '../../../components/admin/Card';
import { DataList } from '../../../components/admin/DataList';
import { SearchBar } from '../../../components/admin/SearchBar';
import { theme } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import {
  useMessagePolling,
  requestNotificationPermissions,
} from '../../../hooks/useMessagePolling';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  threadId: string;
  senderId: string; // 'admin' or customer userId
  senderName: string;
  text: string;
  createdAt: string;
  isRead: boolean;
}

export interface MessageThread {
  id: string;
  customerId: string;
  customerName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: Message[];
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const storage = new AsyncStorageAdapter();
export const MESSAGE_THREADS_KEY = 'message_threads';

// ─── Mock data ────────────────────────────────────────────────────────────────

function createMockThreads(): MessageThread[] {
  const now = new Date();
  const mins = (n: number) => new Date(now.getTime() - n * 60 * 1000).toISOString();
  const hours = (n: number) => new Date(now.getTime() - n * 60 * 60 * 1000).toISOString();
  const days = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'thread-1',
      customerId: 'customer-1',
      customerName: 'Alice Johnson',
      lastMessage: 'Is the red dress still available in size M?',
      lastMessageAt: mins(2),
      unreadCount: 2,
      messages: [
        {
          id: 'msg-1-1',
          threadId: 'thread-1',
          senderId: 'customer-1',
          senderName: 'Alice Johnson',
          text: 'Hi, I have a question about one of your products.',
          createdAt: hours(1),
          isRead: true,
        },
        {
          id: 'msg-1-2',
          threadId: 'thread-1',
          senderId: 'admin',
          senderName: 'Admin',
          text: 'Of course! What would you like to know?',
          createdAt: mins(45),
          isRead: true,
        },
        {
          id: 'msg-1-3',
          threadId: 'thread-1',
          senderId: 'customer-1',
          senderName: 'Alice Johnson',
          text: 'Is the red dress still available in size M?',
          createdAt: mins(2),
          isRead: false,
        },
      ],
    },
    {
      id: 'thread-2',
      customerId: 'customer-2',
      customerName: 'Bob Martinez',
      lastMessage: 'Thank you for the quick delivery!',
      lastMessageAt: hours(3),
      unreadCount: 0,
      messages: [
        {
          id: 'msg-2-1',
          threadId: 'thread-2',
          senderId: 'customer-2',
          senderName: 'Bob Martinez',
          text: 'My order arrived today.',
          createdAt: hours(4),
          isRead: true,
        },
        {
          id: 'msg-2-2',
          threadId: 'thread-2',
          senderId: 'admin',
          senderName: 'Admin',
          text: 'Great to hear! Enjoy your purchase.',
          createdAt: hours(3),
          isRead: true,
        },
        {
          id: 'msg-2-3',
          threadId: 'thread-2',
          senderId: 'customer-2',
          senderName: 'Bob Martinez',
          text: 'Thank you for the quick delivery!',
          createdAt: hours(3),
          isRead: true,
        },
      ],
    },
    {
      id: 'thread-3',
      customerId: 'customer-3',
      customerName: 'Carol White',
      lastMessage: 'Can I return this item? It doesn\'t fit.',
      lastMessageAt: days(1),
      unreadCount: 1,
      messages: [
        {
          id: 'msg-3-1',
          threadId: 'thread-3',
          senderId: 'customer-3',
          senderName: 'Carol White',
          text: 'Can I return this item? It doesn\'t fit.',
          createdAt: days(1),
          isRead: false,
        },
      ],
    },
    {
      id: 'thread-4',
      customerId: 'customer-4',
      customerName: 'David Kim',
      lastMessage: 'When will the new collection be available?',
      lastMessageAt: days(2),
      unreadCount: 0,
      messages: [
        {
          id: 'msg-4-1',
          threadId: 'thread-4',
          senderId: 'customer-4',
          senderName: 'David Kim',
          text: 'When will the new collection be available?',
          createdAt: days(2),
          isRead: true,
        },
        {
          id: 'msg-4-2',
          threadId: 'thread-4',
          senderId: 'admin',
          senderName: 'Admin',
          text: 'We expect the new collection to drop next week. Stay tuned!',
          createdAt: days(2),
          isRead: true,
        },
      ],
    },
  ];
}

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

const FilterChip: React.FC<ChipProps> = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.chip, active && styles.chipActive]}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

// ─── Thread card ──────────────────────────────────────────────────────────────

interface ThreadCardProps {
  thread: MessageThread;
  onPress: () => void;
}

const ThreadCard: React.FC<ThreadCardProps> = ({ thread, onPress }) => {
  const hasUnread = thread.unreadCount > 0;
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.cardRow}>
        {/* Avatar */}
        <View style={[styles.avatar, hasUnread && styles.avatarUnread]}>
          <Text style={styles.avatarText}>
            {thread.customerName.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            <Text
              style={[styles.customerName, hasUnread && styles.customerNameUnread]}
              numberOfLines={1}
            >
              {thread.customerName}
            </Text>
            <Text style={styles.timestamp}>{formatRelativeTime(thread.lastMessageAt)}</Text>
          </View>
          <View style={styles.cardBottomRow}>
            <Text
              style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]}
              numberOfLines={1}
            >
              {thread.lastMessage}
            </Text>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
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

  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  // ── Notification permissions ───────────────────────────────────────────────

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  // ── Polling for new messages ───────────────────────────────────────────────

  const handleThreadsUpdated = useCallback((updated: MessageThread[]) => {
    setThreads(updated);
  }, []);

  useMessagePolling({ onThreadsUpdated: handleThreadsUpdated });

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchThreads = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      let data = await storage.get<MessageThread[]>(MESSAGE_THREADS_KEY);
      if (!data || data.length === 0) {
        data = createMockThreads();
        await storage.set(MESSAGE_THREADS_KEY, data);
      }

      // Sort newest first
      data.sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
      );
      setThreads(data);
    } catch {
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
    let result = threads;

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
    () => threads.reduce((sum, t) => sum + t.unreadCount, 0),
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

  const ListHeader = (
    <View style={styles.listHeader}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by customer name…"
        style={styles.searchBar}
        testID="messages-search"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
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
      </ScrollView>
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
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.bold as any,
    color: theme.colors.text,
  },
  headerBadge: {
    backgroundColor: theme.colors.badge,
    borderRadius: theme.borderRadius.full,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  headerBadgeText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold as any,
    color: theme.colors.badgeText,
  },

  // List
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  listHeader: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },

  // Search & filters
  searchBar: {
    marginHorizontal: theme.spacing.base,
  },
  filterRow: {
    paddingHorizontal: theme.spacing.base,
    gap: theme.spacing.sm,
  },

  // Filter chips
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium as any,
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: theme.colors.background,
  },

  // Thread card
  card: {
    marginHorizontal: theme.spacing.base,
    marginVertical: theme.spacing.xs,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarUnread: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight + '20',
  },
  avatarText: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold as any,
    color: theme.colors.primary,
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
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.medium as any,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  customerNameUnread: {
    fontWeight: theme.fontWeights.bold as any,
  },
  timestamp: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textLight,
    flexShrink: 0,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  lastMessageUnread: {
    color: theme.colors.text,
    fontWeight: theme.fontWeights.medium as any,
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    flexShrink: 0,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: theme.fontWeights.bold as any,
    color: theme.colors.background,
  },

  // Error state
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
  },
  retryText: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold as any,
    color: theme.colors.background,
  },
});

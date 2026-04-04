import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { Header } from '../../components/Header';
import { DateDivider, createListWithDateDividers } from '../../components/DateDivider';
import { messageService } from '../../services/MessageService';
import { useAuth } from '../../contexts/AuthContext';
import { useMessages } from '../../contexts/MessagesContext';
import { MessageThread } from '../../types/message';
import { useTheme } from '../../contexts/ThemeContext';

// Helper function to format relative time
export function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const diff = now - new Date(iso).getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  // For older dates, show month and day
  return new Date(iso).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}

export default function MessagesTab() {
  const [refreshing, setRefreshing] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { unreadCount, threads, refreshThreads, markThreadAsRead } = useMessages();
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const router = useRouter();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      refreshThreads(true);
    }
  }, [isAuthenticated, isAdmin]);

  // On focus: refresh only if data is stale (no delay, no spinner)
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated && !isAdmin) {
        refreshThreads(); // respects stale threshold — instant if fresh
      }
    }, [isAuthenticated, isAdmin, refreshThreads])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshThreads(true);
    setRefreshing(false);
  };

  const handleThreadPress = (threadId: string) => {
    router.push(`/message-thread/${threadId}`);
  };

  const handleNewMessage = () => {
    router.push('/new-message');
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Message History',
      'Are you sure you want to clear all your message history? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await messageService.clearHistory();
              
              if (response.success) {
                await refreshThreads(true);
                Alert.alert('Success', 'Message history cleared successfully');
              } else {
                Alert.alert('Error', response.error?.message || 'Failed to clear message history');
              }
            } catch (error: any) {
              console.error('Failed to clear message history:', error);
              Alert.alert('Error', 'Failed to clear message history. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return formatRelativeTime(dateString);
  };

  const getThreadTypeLabel = (type: string) => {
    switch (type) {
      case 'product_inquiry':
        return 'Product';
      case 'quote_request':
        return 'Quote';
      default:
        return 'General';
    }
  };

  const listItems = useMemo(() => {
    return createListWithDateDividers(
      threads,
      (item) => item.threadId,
      (item) => item.lastMessageAt
    );
  }, [threads]);

  const renderThreadItem = useCallback(({ item }: { item: any }) => {
    if (item.type === 'divider') {
      return <DateDivider date={item.label} />;
    }

    const thread = item.data;
    return (
      <TouchableOpacity
        style={styles.threadItem}
        onPress={() => handleThreadPress(thread.threadId)}
      >
        <View style={styles.threadAvatar}>
          <Ionicons name="chatbubble" size={24} color={colors.textInverse} />
        </View>
        <View style={styles.threadContent}>
          <View style={styles.threadHeader}>
            <Text style={styles.threadName}>AfroVendor</Text>
            <Text style={styles.threadTime}>{formatDate(thread.lastMessageAt)}</Text>
          </View>
          <Text style={styles.threadMessage} numberOfLines={2}>
            {thread.lastMessage}
          </Text>
          <View style={styles.threadMeta}>
            <Text style={styles.threadType}>
              {getThreadTypeLabel(thread.threadType)}
            </Text>
            {thread.productName && (
              <Text style={styles.productName} numberOfLines={1}>
                {thread.productName}
              </Text>
            )}
          </View>
        </View>
        {thread.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [colors]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    content: {
      flex: 1,
      width: '100%',
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 80,
      paddingHorizontal: spacing.xl,
    },
    emptyTitle: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    emptySubtitle: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    loadingText: {
      marginTop: spacing.sm,
      fontSize: fontSizes.base,
      color: colors.textSecondary,
    },
    signInButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.base,
      marginTop: spacing.lg,
    },
    signInButtonText: {
      color: colors.text,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    threadItem: {
      flexDirection: 'row',
      padding: spacing.base,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      alignItems: 'center',
    },
    threadAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    threadContent: {
      flex: 1,
    },
    threadHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    threadName: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
    },
    threadTime: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
    },
    threadMessage: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    threadMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    threadType: {
      fontSize: fontSizes.xs,
      color: colors.primary,
      backgroundColor: colors.primaryLight,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
    },
    productName: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    unreadBadge: {
      backgroundColor: colors.error,
      borderRadius: 12,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xs,
    },
    unreadText: {
      color: colors.textInverse,
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.bold,
    },
    fab: {
      position: 'absolute',
      bottom: spacing.xl,
      right: spacing.base,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    headerContainer: {
      position: 'absolute',
      top: 0,
      right: spacing.base,
      zIndex: 10,
    },
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    clearButtonText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: colors.error,
    },
  });

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Header
          title="Messages"
          subtitle="Start chatting to get quotes"
        />
        <View style={styles.emptyState}>
          <Ionicons name="person-outline" size={80} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptySubtitle}>
            Please sign in to view and send messages
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

  if (isAdmin) {
    return (
      <View style={styles.container}>
        <Header
          title="Messages"
          subtitle="Admin view mode"
        />
        <View style={styles.emptyState}>
          <Ionicons name="shield-outline" size={80} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>Admin Mode</Text>
          <Text style={styles.emptySubtitle}>
            Messages are disabled in admin view mode. This feature is for customers only.
          </Text>
        </View>
      </View>
    );
  }

  if (threads.length === 0 && refreshing) {
    return (
      <View style={styles.container}>
        <Header title="Messages" subtitle="Start chatting to get quotes" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Messages"
        subtitle="Start chatting to get quotes"
        rightAction={
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearHistory}
              accessibilityLabel="Clear message history"
              accessibilityHint="Removes all message threads from your account"
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        <FlatList
          data={listItems}
          renderItem={renderThreadItem}
          keyExtractor={(item: any) => item.key}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={threads.length === 0 ? { flexGrow: 1 } : { paddingBottom: spacing.xl }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={80} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Messages Yet</Text>
              <Text style={styles.emptySubtitle}>
                Start a conversation with our support team!{'\n'}
                Ask questions or request quotes for products.
              </Text>
            </View>
          }
        />
      </View>

      <TouchableOpacity style={styles.fab} onPress={handleNewMessage}>
        <Ionicons name="add" size={24} color={colors.textInverse} />
      </TouchableOpacity>
    </View>
  );
}
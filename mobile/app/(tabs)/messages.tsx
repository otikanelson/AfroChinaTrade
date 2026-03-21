import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { messageService } from '../../services/MessageService';
import { useAuth } from '../../contexts/AuthContext';
import { useMessages } from '../../contexts/MessagesContext';
import { MessageThread } from '../../types/messages';
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
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { unreadCount, refreshUnreadCount } = useMessages();
  const { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      loadMessageThreads();
      refreshUnreadCount();
    }
  }, [isAuthenticated]);

  const loadMessageThreads = async () => {
    try {
      setIsLoading(true);
      const response = await messageService.getThreads();
      
      if (response.success && response.data) {
        setThreads(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load message threads:', error);
      
      // Only show alert for non-network errors to avoid spam when backend is down
      if (error?.code !== 'NETWORK_ERROR' && error?.code !== 'TIMEOUT_ERROR') {
        Alert.alert('Error', 'Failed to load messages. Please try again.');
      }
      // For network errors, silently fail and show empty state
    } finally {
      setIsLoading(false);
    }
  };

  const handleThreadPress = (threadId: string) => {
    router.push(`/(admin)/message/${threadId}`);
  };

  const formatDate = (dateString: string) => {
    return formatRelativeTime(dateString);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      backgroundColor: colors.background,
      paddingTop: 10,
      paddingBottom: spacing.base,
      paddingHorizontal: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      ...shadows.sm,
    },
    headerTitle: {
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    content: {
      flex: 1,
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
      color: colors.background,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    threadItem: {
      flexDirection: 'row',
      padding: spacing.base,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
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
    threadEmail: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
    },
    unreadBadge: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xs,
    },
    unreadText: {
      color: colors.background,
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.bold,
    },
  });

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSubtitle}>Sign in to view messages</Text>
        </View>
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSubtitle}>Loading messages...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>
          {unreadCount > 0 ? `${unreadCount} unread messages` : 'All messages read'}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {threads.length > 0 ? (
          threads.map((thread) => (
            <TouchableOpacity
              key={thread.id}
              style={styles.threadItem}
              onPress={() => handleThreadPress(thread.id)}
            >
              <View style={styles.threadAvatar}>
                <Ionicons name="person" size={24} color={colors.background} />
              </View>
              <View style={styles.threadContent}>
                <View style={styles.threadHeader}>
                  <Text style={styles.threadName}>{thread.customerName}</Text>
                  <Text style={styles.threadTime}>{formatDate(thread.lastMessageAt)}</Text>
                </View>
                <Text style={styles.threadMessage} numberOfLines={2}>
                  {thread.lastMessage}
                </Text>
                <Text style={styles.threadEmail}>{thread.customerEmail}</Text>
              </View>
              {thread.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{thread.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={80} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Messages Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start chatting with suppliers to get quotes and negotiate deals
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
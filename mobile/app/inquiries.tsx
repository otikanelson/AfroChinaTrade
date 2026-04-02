import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
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

interface MessageThread {
  _id: string;
  threadId: string;
  customerId: string;
  customerName: string;
  productId?: string;
  productName?: string;
  productImage?: string;
  threadType: 'product_inquiry';
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export default function InquiriesScreen() {
  const { isAuthenticated } = useRequireAuth('Please sign in to view your inquiries');
  const router = useRouter();
  const { colors, fontSizes, fontWeights, borderRadius } = useTheme();
  const { user } = useAuth();
  
  const [inquiries, setInquiries] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    emptyTitle: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginTop: spacing.base,
      marginBottom: spacing.sm,
    },
    emptySubtitle: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    inquiriesList: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
    },
    inquiryCard: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      marginBottom: spacing.sm,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    inquiryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    inquiryInfo: {
      flex: 1,
      marginRight: spacing.sm,
    },
    inquiryTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    productInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    productImage: {
      width: 30,
      height: 30,
      borderRadius: borderRadius.sm,
      marginRight: spacing.sm,
    },
    productName: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.base,
      backgroundColor: colors.primary,
    },
    statusText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.bold,
      color: colors.textInverse,
    },
    lastMessage: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
      lineHeight: 18,
    },
    inquiryFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    date: {
      fontSize: fontSizes.xs,
      color: colors.textLight,
    },
    unreadBadge: {
      backgroundColor: colors.error,
      borderRadius: borderRadius.full,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xs,
    },
    unreadText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.bold,
      color: colors.textInverse,
    },
    errorText: {
      fontSize: fontSizes.base,
      color: colors.error,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
    },
    retryButtonText: {
      color: colors.textInverse,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
    },
  });

  const fetchInquiries = useCallback(async (isRefresh: boolean = false) => {
    if (!user?.id) return;

    const token = await tokenManager.getAccessToken();
    if (!token) return;

    try {
      if (!isRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `${API_BASE_URL}/messages/threads?threadType=product_inquiry`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setInquiries(data.data || []);
      } else {
        setError(data.error?.message || data.message || 'Failed to load inquiries');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching inquiries:', err);
        setError('Failed to load inquiries. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchInquiries();
    }
  }, [isAuthenticated, user?.id, fetchInquiries]);

  const handleRefresh = useCallback(() => {
    fetchInquiries(true);
  }, [fetchInquiries]);

  const handleInquiryPress = (inquiry: MessageThread) => {
    router.push(`/message-thread/${inquiry.threadId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const renderItem = useCallback(({ item }: { item: MessageThread }) => (
    <TouchableOpacity
      style={styles.inquiryCard}
      onPress={() => handleInquiryPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.inquiryHeader}>
        <View style={styles.inquiryInfo}>
          <Text style={styles.inquiryTitle}>
            {item.productName ? `Inquiry about ${item.productName}` : 'General Inquiry'}
          </Text>
          
          {item.productName && (
            <View style={styles.productInfo}>
              {item.productImage && (
                <Image
                  source={{ uri: item.productImage }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              )}
              <Text style={styles.productName} numberOfLines={1}>
                {item.productName}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {item.status === 'active' ? 'Active' : 'Archived'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.lastMessage} numberOfLines={2}>
        {item.lastMessage}
      </Text>
      
      <View style={styles.inquiryFooter}>
        <Text style={styles.date}>{formatDate(item.lastMessageAt)}</Text>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {item.unreadCount > 99 ? '99+' : item.unreadCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  ), [styles, colors]);

  const keyExtractor = useCallback((item: MessageThread) => item._id, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Inquiries" 
        showBack={true}
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading inquiries...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchInquiries()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : inquiries.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="help-circle-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No inquiries</Text>
          <Text style={styles.emptySubtitle}>
            Your product inquiries and questions will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={inquiries}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.inquiriesList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
}
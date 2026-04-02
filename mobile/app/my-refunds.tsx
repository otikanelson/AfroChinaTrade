import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { refundService, Refund } from '../services/RefundService';
import { spacing } from '../theme/spacing';

export default function RefundsScreen() {
  const router = useRouter();
  const { colors, fontSizes, fontWeights, borderRadius } = useTheme();
  const { user } = useAuth();
  
  const [refunds, setRefunds] = useState<Refund[]>([]);
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
    refundsList: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
    },
    refundCard: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      marginBottom: spacing.sm,
    },
    refundHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    orderNumber: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
      color: colors.text,
    },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.base,
    },
    statusText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.bold,
      color: colors.textInverse,
    },
    refundAmount: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    refundReason: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    refundDate: {
      fontSize: fontSizes.xs,
      color: colors.textLight,
    },
    adminNote: {
      fontSize: fontSizes.sm,
      color: colors.text,
      backgroundColor: colors.surface,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 4,
      marginTop: spacing.xs,
      fontStyle: 'italic',
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

  const fetchRefunds = useCallback(async (isRefresh: boolean = false) => {
    if (!user?.id) return;

    try {
      if (!isRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      const response = await refundService.getUserRefunds({
        page: 1,
        limit: 100,
      });

      if (response.success && response.data) {
        setRefunds(response.data);
      } else {
        setError(response.error?.message || 'Failed to load refunds');
      }
    } catch (err: any) {
      console.error('Error fetching refunds:', err);
      setError('Failed to load refunds. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchRefunds();
    }
  }, [user?.id, fetchRefunds]);

  const handleRefresh = useCallback(() => {
    fetchRefunds(true);
  }, [fetchRefunds]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'approved':
        return '#3b82f6';
      case 'processed':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      default:
        return colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const renderItem = useCallback(({ item }: { item: Refund }) => {
    const isExpanded = expandedId === item.id;
    const statusColor = getStatusColor(item.status);
    const orderId = typeof item.orderId === 'object'
      ? (item.orderId as any).orderId
      : String(item.orderId).slice(-8).toUpperCase();

    return (
      <TouchableOpacity
        style={[styles.refundCard, { borderLeftWidth: 4, borderLeftColor: statusColor }]}
        onPress={() => setExpandedId(isExpanded ? null : item.id)}
        activeOpacity={0.85}
      >
        <View style={styles.refundHeader}>
          <Text style={styles.orderNumber}>Order #{orderId}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.refundAmount}>₦{item.amount.toLocaleString()}</Text>
        <Text style={styles.refundReason} numberOfLines={isExpanded ? undefined : 2}>{item.reason}</Text>
        <Text style={styles.refundDate}>Requested on {formatDate(item.createdAt)}</Text>

        {isExpanded && (
          <View style={{ marginTop: spacing.sm, gap: spacing.xs }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary }}>Type</Text>
              <Text style={{ fontSize: fontSizes.xs, color: colors.text, textTransform: 'capitalize', fontWeight: fontWeights.medium }}>{item.type}</Text>
            </View>
            {item.processedAt && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary }}>Processed on</Text>
                <Text style={{ fontSize: fontSizes.xs, color: colors.text }}>{formatDate(item.processedAt)}</Text>
              </View>
            )}
            {item.processedBy && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary }}>Processed by</Text>
                <Text style={{ fontSize: fontSizes.xs, color: colors.text }}>{item.processedBy.name}</Text>
              </View>
            )}
            {item.adminNotes && (
              <Text style={styles.adminNote}>💬 {item.adminNotes}</Text>
            )}
          </View>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.xs }}>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={colors.textLight}
          />
        </View>
      </TouchableOpacity>
    );
  }, [styles, colors, expandedId, fontSizes, fontWeights]);

  const keyExtractor = useCallback((item: Refund) => item.id, []);

  return (
    <View style={styles.container}>
      <Header 
        title="Refunds" 
        showBack={true}
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading refunds...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchRefunds()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : refunds.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="refresh-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No refunds</Text>
          <Text style={styles.emptySubtitle}>
            Your refund requests will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={refunds}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.refundsList}
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

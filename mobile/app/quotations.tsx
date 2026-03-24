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
import { useRequireAuth } from '../hooks/useRequireAuth';
import { Header } from '../components/Header';
import { API_BASE_URL } from '../constants/config';
import { tokenManager } from '../services/api/tokenManager';
import { spacing } from '../theme/spacing';

interface Quotation {
  _id: string;
  productId: string;
  productName: string;
  quantity: number;
  requestedPrice?: number;
  quotedPrice?: number;
  status: 'pending' | 'quoted' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  quotedAt?: string;
  expiresAt?: string;
  notes?: string;
}

export default function QuotationsScreen() {
  const { isAuthenticated } = useRequireAuth('Please sign in to view your quotations');
  const router = useRouter();
  const { colors, fontSizes, fontWeights, borderRadius } = useTheme();
  const { user } = useAuth();
  
  const [quotations, setQuotations] = useState<Quotation[]>([]);
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
    quotationsList: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
    },
    quotationCard: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      marginBottom: spacing.sm,
    },
    quotationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    productName: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
      color: colors.text,
      flex: 1,
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
    quotationDetails: {
      gap: spacing.xs,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    detailLabel: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    detailValue: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      color: colors.text,
    },
    priceValue: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
      color: colors.primary,
    },
    date: {
      fontSize: fontSizes.xs,
      color: colors.textLight,
      marginTop: spacing.xs,
    },
    notes: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginTop: spacing.xs,
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

  const fetchQuotations = useCallback(async (isRefresh: boolean = false) => {
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
        `${API_BASE_URL}/quotations`,
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

      if (data.status === 'success') {
        setQuotations(data.data || []);
      } else {
        setError(data.message || 'Failed to load quotations');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching quotations:', err);
        setError('Failed to load quotations. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchQuotations();
    }
  }, [isAuthenticated, user?.id, fetchQuotations]);

  const handleRefresh = useCallback(() => {
    fetchQuotations(true);
  }, [fetchQuotations]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'quoted':
        return '#3b82f6';
      case 'accepted':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'expired':
        return '#6b7280';
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

  const renderItem = useCallback(({ item }: { item: Quotation }) => (
    <View style={styles.quotationCard}>
      <View style={styles.quotationHeader}>
        <Text style={styles.productName} numberOfLines={1}>{item.productName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.quotationDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Quantity:</Text>
          <Text style={styles.detailValue}>{item.quantity} units</Text>
        </View>
        
        {item.requestedPrice !== undefined && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Requested Price:</Text>
            <Text style={styles.detailValue}>₦{item.requestedPrice.toLocaleString()}</Text>
          </View>
        )}
        
        {item.quotedPrice !== undefined && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quoted Price:</Text>
            <Text style={styles.priceValue}>₦{item.quotedPrice.toLocaleString()}</Text>
          </View>
        )}
      </View>
      
      {item.notes && (
        <Text style={styles.notes}>"{item.notes}"</Text>
      )}
      
      <Text style={styles.date}>Requested on {formatDate(item.createdAt)}</Text>
      {item.quotedAt && (
        <Text style={styles.date}>Quoted on {formatDate(item.quotedAt)}</Text>
      )}
      {item.expiresAt && (
        <Text style={styles.date}>Expires on {formatDate(item.expiresAt)}</Text>
      )}
    </View>
  ), [styles, colors]);

  const keyExtractor = useCallback((item: Quotation) => item._id, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Quotations" 
        showBack={true}
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading quotations...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchQuotations()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : quotations.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="chatbubble-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No quotations</Text>
          <Text style={styles.emptySubtitle}>
            Your price quotation requests will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={quotations}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.quotationsList}
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

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { API_BASE_URL } from '../constants/config';
import { spacing } from '../theme/spacing';

interface BrowsingHistoryItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    category: string;
    rating?: number;
  };
  interactionType: 'view' | 'cart_add' | 'wishlist_add' | 'purchase';
  timestamp: string;
}

export default function BrowsingHistoryScreen() {
  const { isAuthenticated } = useRequireAuth('Please sign in to view your browsing history');
  const router = useRouter();
  const { colors, fontSizes, fontWeights, borderRadius } = useTheme();
  const { user, token } = useAuth();
  
  const [history, setHistory] = useState<BrowsingHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
    shopButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
    },
    shopButtonText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    productsList: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      gap: spacing.lg,
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
    loadingMoreContainer: {
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
  });

  const fetchBrowsingHistory = useCallback(async (pageNum: number = 1, isRefresh: boolean = false) => {
    if (!user?._id || !token) return;

    try {
      if (pageNum === 1 && !isRefresh) {
        setLoading(true);
      } else if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(
        `${API_BASE_URL}/users/${user._id}/browsing-history?page=${pageNum}&limit=20&interactionType=view`,
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
        if (pageNum === 1) {
          setHistory(data.data.history);
        } else {
          setHistory(prev => [...prev, ...data.data.history]);
        }
        setHasMore(data.data.pagination.hasNext);
        setPage(pageNum);
      } else {
        setError(data.message || 'Failed to load browsing history');
      }
    } catch (err: any) {
      console.error('Error fetching browsing history:', err);
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection.');
      } else {
        setError('Failed to load browsing history. Please try again.');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [user?._id, token]);

  useEffect(() => {
    if (isAuthenticated && user?._id && token) {
      fetchBrowsingHistory(1);
    }
  }, [isAuthenticated, user?._id, token, fetchBrowsingHistory]);

  const handleProductPress = useCallback((productId: string) => {
    router.push(`/product-detail/${productId}`);
  }, [router]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      fetchBrowsingHistory(page + 1);
    }
  }, [loadingMore, hasMore, loading, page, fetchBrowsingHistory]);

  const handleRefresh = useCallback(() => {
    fetchBrowsingHistory(1, true);
  }, [fetchBrowsingHistory]);

  const renderItem = useCallback(({ item }: { item: BrowsingHistoryItem }) => {
    const product = item.productId;
    
    return (
      <ProductCard
        product={product}
        variant="list"
        onPress={() => handleProductPress(product._id)}
        showAddButton={true}
      />
    );
  }, [handleProductPress]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadingMoreContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }, [loadingMore, colors.primary, styles.loadingMoreContainer]);

  const keyExtractor = useCallback((item: BrowsingHistoryItem) => item._id, []);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 140, // Approximate height of ProductCard in list variant
    offset: 140 * index,
    index,
  }), []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Browsing History" 
        showBack={true}
      />

      {loading && history.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your browsing history...</Text>
        </View>
      ) : error && history.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchBrowsingHistory(1)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="time-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No browsing history yet</Text>
          <Text style={styles.emptySubtitle}>
            Products you view will appear here
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
          getItemLayout={getItemLayout}
        />
      )}
    </View>
  );
}

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
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useCart } from '../contexts/CartContext';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { API_BASE_URL } from '../constants/config';
import { spacing } from '../theme/spacing';
import { tokenManager } from '../services/api/tokenManager';

interface BrowsingHistoryItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    category: string;
    rating?: number;
    stock?: number;
    viewCount?: number;
    reviewCount?: number;
    description?: string;
    discount?: number;
    supplier?: {
      name: string;
      location?: string;
      rating?: number;
      verified?: boolean;
    };
    supplierId?: {
      name: string;
      location?: string;
      rating?: number;
      verified?: boolean;
    };
  };
  interactionType: 'view' | 'cart_add' | 'wishlist_add' | 'purchase';
  timestamp: string;
}

export default function BrowsingHistoryScreen() {
  const { isAuthenticated } = useRequireAuth('Please sign in to view your browsing history');
  const router = useRouter();
  const { colors, fontSizes, fontWeights, borderRadius } = useTheme();
  const { user } = useAuth();
  const { cartCount } = useCart();
  
  const [history, setHistory] = useState<BrowsingHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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
    lastUpdatedContainer: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    lastUpdatedText: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    floatingCart: {
      position: 'absolute',
      bottom: 24,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
    },
    floatingCartBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
      borderWidth: 1.5,
      borderColor: colors.background,
    },
    floatingCartBadgeText: {
      color: colors.text,
      fontSize: 10,
      fontWeight: fontWeights.bold,
    },
    dateDivider: {
      paddingHorizontal: spacing.xs,
      paddingTop: spacing.base,
      paddingBottom: spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    dateDividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.borderLight,
    },
    dateDividerText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });

  const fetchBrowsingHistory = useCallback(async (pageNum: number = 1, isRefresh: boolean = false) => {
    if (!user?.id) {
      console.log('❌ No user ID available for browsing history');
      return;
    }

    console.log(`🔍 Fetching browsing history for user ${user.id}, page ${pageNum}`);

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

      // Get the current token
      const token = await tokenManager.getAccessToken();
      if (!token) {
        console.error('❌ No access token available');
        setError('Authentication required. Please log in again.');
        return;
      }

      const url = `${API_BASE_URL}/users/${user.id}/browsing-history?page=${pageNum}&limit=20&interactionType=view&_t=${Date.now()}`;
      console.log(`📡 Making API call to: ${url}`);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`📊 API response status: ${response.status}`);
      
      const data = await response.json();
      console.log(`📋 API response data:`, data);

      if (data.status === 'success') {
        console.log(`✅ Found ${data.data.history.length} browsing history items`);
        if (pageNum === 1) {
          setHistory(data.data.history);
          setLastUpdated(new Date());
        } else {
          setHistory(prev => [...prev, ...data.data.history]);
        }
        setHasMore(data.data.pagination.hasNext);
        setPage(pageNum);
      } else {
        console.error('❌ API returned error:', data.message);
        setError(data.message || 'Failed to load browsing history');
      }
    } catch (err: any) {
      console.error('❌ Error fetching browsing history:', err);
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
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchBrowsingHistory(1);
    }
  }, [isAuthenticated, user?.id, fetchBrowsingHistory]);

  // Refresh data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Browsing history screen focused, refreshing data...');
      if (isAuthenticated && user?.id) {
        fetchBrowsingHistory(1, true); // Force refresh
      }
    }, [isAuthenticated, user?.id, fetchBrowsingHistory])
  );

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

  const formatDateDivider = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  type HistoryListItem =
    | { type: 'divider'; label: string; key: string }
    | { type: 'product'; data: BrowsingHistoryItem; key: string };

  const listItems: HistoryListItem[] = useMemo(() => {
    const items: HistoryListItem[] = [];
    let lastDateKey = '';
    for (const entry of history) {
      const dateKey = new Date(entry.timestamp).toDateString();
      if (dateKey !== lastDateKey) {
        lastDateKey = dateKey;
        items.push({ type: 'divider', label: formatDateDivider(entry.timestamp), key: `divider_${dateKey}` });
      }
      items.push({ type: 'product', data: entry, key: entry._id });
    }
    return items;
  }, [history]);

  const renderItem = useCallback(({ item }: { item: HistoryListItem }) => {
    if (item.type === 'divider') {
      return (
        <View style={styles.dateDivider}>
          <View style={styles.dateDividerLine} />
          <Text style={styles.dateDividerText}>{item.label}</Text>
          <View style={styles.dateDividerLine} />
        </View>
      );
    }

    const productData = item.data.productId;
    const product = {
      id: productData._id,
      name: productData.name,
      description: productData.description || '',
      price: productData.price,
      images: productData.images || [],
      category: productData.category,
      rating: productData.rating || 0,
      reviewCount: productData.reviewCount || 0,
      stock: productData.stock || 0,
      viewCount: productData.viewCount || 0,
      discount: productData.discount || 0,
      supplier: productData.supplier ? {
        name: productData.supplier.name,
        location: productData.supplier.location || '',
        rating: productData.supplier.rating || 0,
        verified: productData.supplier.verified || false,
      } : undefined,
      supplierId: productData.supplierId ? {
        name: productData.supplierId.name,
        location: productData.supplierId.location || '',
        rating: productData.supplierId.rating || 0,
        verified: productData.supplierId.verified || false,
      } : undefined,
    };
    
    return (
      <ProductCard
        product={product}
        variant="list"
        onPress={() => handleProductPress(product.id)}
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
    <View style={[styles.container, { position: 'relative' }]}>
      <Header 
        title="Browsing History" 
        showBack={true}
        rightAction={
          <TouchableOpacity
            onPress={() => handleRefresh()}
            style={{ padding: 8 }}
            disabled={refreshing}
          >
            <Ionicons 
              name="refresh" 
              size={24} 
              color={refreshing ? colors.textLight : colors.primary} 
            />
          </TouchableOpacity>
        }
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
          data={listItems}
          renderItem={renderItem}
          keyExtractor={item => item.key}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListHeaderComponent={
            lastUpdated ? (
              <View style={styles.lastUpdatedContainer}>
                <Text style={styles.lastUpdatedText}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </Text>
              </View>
            ) : null
          }
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

      {/* Floating cart button */}
      <TouchableOpacity
        style={styles.floatingCart}
        onPress={() => router.push('/cart')}
        activeOpacity={0.85}
      >
        <Ionicons name="cart" size={26} color={colors.textInverse} />
        {cartCount > 0 && (
          <View style={styles.floatingCartBadge}>
            <Text style={styles.floatingCartBadgeText}>
              {cartCount > 99 ? '99+' : cartCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

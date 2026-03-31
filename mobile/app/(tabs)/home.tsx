import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  StatusBar,
  Text,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Header } from '../../components/Header';
import { SearchBar } from '../../components/SearchBar';
import { ProductCard } from '../../components/ProductCard';
import { FeatureCard } from '../../components/FeatureCard';
import { SectionHeader } from '../../components/SectionHeader';
import { BrowseAllCard } from '../../components/BrowseAllCard';
import { ProductSectionSkeleton } from '../../components/ProductSectionSkeleton';
import { CameraSearchModal } from '../../components/CameraSearchModal';
import { categoryService } from '../../services/CategoryService';
import { collectionService } from '../../services/CollectionService';
import { productCacheService } from '../../services/ProductCacheService';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useRecommendations } from '../../hooks/useRecommendations';
import { Product, Collection } from '../../types/product';
import { NavigationSource } from '../../types/navigation';
import { testConnectionWithRetry, getConnectionErrorMessage } from '../../utils/connectionUtils';
import { spacing } from '../../theme';

// How many collections to reveal per "page" as user scrolls
const COLLECTIONS_PER_PAGE = 3;

type SectionItem =
  | { type: 'features' }
  | { type: 'collection'; collection: Collection }
  | { type: 'skeleton'; id: string }
  | { type: 'recommendations' }
  | { type: 'browse_all' };

export default function HomeTab() {
  const router = useRouter();
  const { fonts, fontSizes, colors, isDark } = useTheme();
  const { cartCount } = useCart();
  const { user } = useAuth();

  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [visibleCount, setVisibleCount] = useState(COLLECTIONS_PER_PAGE);
  const [collectionProducts, setCollectionProducts] = useState<Record<string, Product[]>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMoreCollections, setIsLoadingMoreCollections] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const { width: screenWidth } = Dimensions.get('window');
  const loadingCollectionIds = useRef<Set<string>>(new Set());

  const { recommendations, hasRecommendations, refreshRecommendations } = useRecommendations();

  // ─── Styles ────────────────────────────────────────────────────────────────
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    stickySection: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      zIndex: 1,
    },
    searchContainer: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
    },
    featureCardsRow: {
      marginHorizontal: 18,
      marginTop: spacing.md,
      marginBottom: spacing.md,
      gap: spacing.xs,
    },
    section: { marginBottom: spacing.xs },
    horizontalList: { paddingHorizontal: 3 },
    featuredCardWrapper: { width: 110, margin: 5 },
    emptyContainer: { padding: spacing.xl, alignItems: 'center' },
    emptyText: {
      fontSize: fontSizes.lg,
      fontFamily: fonts.medium,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    emptySubtext: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.regular,
      color: colors.textLight,
      textAlign: 'center',
    },
    listFooter: { paddingBottom: spacing.xl },
  });

  // ─── Data loading ──────────────────────────────────────────────────────────

  const loadCollectionProducts = useCallback(async (collections: Collection[]) => {
    for (const col of collections) {
      if (loadingCollectionIds.current.has(col.id)) continue;
      loadingCollectionIds.current.add(col.id);

      setLoadingStates(prev => ({ ...prev, [col.id]: true }));

      try {
        const cached = productCacheService.getCachedCollectionProducts(col.id);
        if (cached) {
          setCollectionProducts(prev => ({ ...prev, [col.id]: cached }));
        } else {
          const res = await collectionService.getCollectionProducts(col.id, 1, 10);
          if (res.success && res.data) {
            const products = res.data.products || [];
            setCollectionProducts(prev => ({ ...prev, [col.id]: products }));
            productCacheService.cacheCollectionProducts(col.id, products);
          }
        }
      } catch {
        // silently skip failed collections
      } finally {
        setLoadingStates(prev => ({ ...prev, [col.id]: false }));
      }
    }
  }, []);

  const loadInitialData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        productCacheService.clear();
        loadingCollectionIds.current.clear();
        setCollectionProducts({});
        setLoadingStates({});
        setVisibleCount(COLLECTIONS_PER_PAGE);
      }

      const connectionResult = await testConnectionWithRetry(3, 15000);
      if (!connectionResult.success && !isRefresh) {
        const errorMessage = getConnectionErrorMessage(connectionResult);
        Alert.alert('Connection Issue', errorMessage, [
          { text: 'Retry', onPress: () => loadInitialData(false) },
          { text: 'Continue Offline', style: 'cancel' },
        ]);
      }

      const [, collectionsResponse] = await Promise.all([
        categoryService.getCategories(),
        collectionService.getActiveCollections(),
      ]);

      if (collectionsResponse.success && collectionsResponse.data) {
        const cols = collectionsResponse.data;
        setAllCollections(cols);
        // Immediately start loading the first batch of collection products
        loadCollectionProducts(cols.slice(0, COLLECTIONS_PER_PAGE));
      }
    } catch {
      if (!isRefresh) Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setIsInitialLoading(false);
    }
  }, [loadCollectionProducts]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshRecommendations();
    }, [refreshRecommendations])
  );

  // ─── Lazy-load more collections when user nears the bottom ─────────────────
  const handleEndReached = useCallback(() => {
    if (isLoadingMoreCollections) return;
    const nextCount = visibleCount + COLLECTIONS_PER_PAGE;
    if (nextCount > allCollections.length) return;

    setIsLoadingMoreCollections(true);
    const nextBatch = allCollections.slice(visibleCount, nextCount);
    setVisibleCount(nextCount);
    loadCollectionProducts(nextBatch).finally(() => {
      setIsLoadingMoreCollections(false);
    });
  }, [isLoadingMoreCollections, visibleCount, allCollections, loadCollectionProducts]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadInitialData(true), refreshRecommendations()]);
    } finally {
      setRefreshing(false);
    }
  }, [loadInitialData, refreshRecommendations]);

  const handleProductPress = (product: Product) => {
    const productId = (product as any)._id || product.id;
    router.push({ pathname: '/product-detail/[id]', params: { id: productId } });
  };

  // ─── Build FlatList data ───────────────────────────────────────────────────

  const sections: SectionItem[] = React.useMemo(() => {
    const items: SectionItem[] = [{ type: 'features' }];

    const visibleCollections = allCollections.slice(0, visibleCount);

    for (const col of visibleCollections) {
      const isLoading = loadingStates[col.id];
      const products = collectionProducts[col.id];

      if (isLoading && !products) {
        // Show skeleton placeholder while loading
        items.push({ type: 'skeleton', id: col.id });
      } else if (products && products.length > 0) {
        items.push({ type: 'collection', collection: col });
      }
      // Skip collections with no products once loaded
    }

    // Skeleton rows for collections being loaded in the next batch
    if (isLoadingMoreCollections) {
      items.push({ type: 'skeleton', id: 'more_1' });
      items.push({ type: 'skeleton', id: 'more_2' });
    }

    // Recommendations
    if (user && hasRecommendations) {
      items.push({ type: 'recommendations' });
    }

    // Only show BrowseAll once all collections are loaded and visible
    const allLoaded = visibleCount >= allCollections.length &&
      !Object.values(loadingStates).some(Boolean);
    if (allLoaded && !isInitialLoading) {
      items.push({ type: 'browse_all' });
    }

    return items;
  }, [
    allCollections,
    visibleCount,
    collectionProducts,
    loadingStates,
    isLoadingMoreCollections,
    user,
    hasRecommendations,
    isInitialLoading,
  ]);

  // ─── Render each section ───────────────────────────────────────────────────

  const renderSection = useCallback(({ item }: { item: SectionItem }) => {
    if (item.type === 'features') {
      return (
        <FlatList
          data={[
            { key: 'verified-suppliers', iconName: 'shield-check', title: 'Verified', subtitle: 'Suppliers', color: colors.secondary, route: '/verified-suppliers' as const },
            { key: 'delivery', iconName: 'speedometer', title: 'Quick Delivery', subtitle: 'Make order', color: colors.accent, route: '/my-orders' as const },
            { key: 'categories', iconName: 'view-grid', title: 'All Categories', subtitle: 'Browse all', color: colors.primary, route: null },
            { key: 'get-quotes', iconName: 'file-document-edit', title: 'Get Quotes', subtitle: 'Request', color: colors.secondary, route: '/messages' as const },
          ]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={i => i.key}
          contentContainerStyle={styles.featureCardsRow}
          renderItem={({ item: fc }) => (
            <FeatureCard
              key={fc.key}
              iconName={fc.iconName}
              title={fc.title}
              subtitle={fc.subtitle}
              iconColor={fc.color}
              onPress={() => {
                if (fc.key === 'categories') {
                  router.push({ pathname: '/product-listing', params: { showCategories: 'true', title: 'Categories' } });
                } else if (fc.route) {
                  router.push(fc.route as any);
                }
              }}
            />
          )}
        />
      );
    }

    if (item.type === 'skeleton') {
      return (
        <ProductSectionSkeleton
          key={item.id}
          variant="horizontal"
          itemCount={4}
          showHeader={true}
        />
      );
    }

    if (item.type === 'collection') {
      const { collection } = item;
      const products = collectionProducts[collection.id] || [];
      return (
        <View style={styles.section}>
          <SectionHeader
            title={collection.name}
            actionText="See All"
            navigationSource={NavigationSource.HOME_COLLECTION}
            collectionType="custom"
            onActionPress={() =>
              router.push({
                pathname: '/product-listing',
                params: { collectionId: collection.id, title: collection.name },
              })
            }
          />
          <FlatList
            data={products}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={p => (p as any)._id || p.id}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item: product }) => (
              <View style={styles.featuredCardWrapper}>
                <ProductCard
                  product={product}
                  onPress={() => handleProductPress(product)}
                  showViewCount={true}
                />
              </View>
            )}
          />
        </View>
      );
    }

    if (item.type === 'recommendations') {
      return (
        <View style={styles.section}>
          <SectionHeader
            title="Recommended for You"
            subtitle="Based on your interests"
            actionText="See All"
            navigationSource={NavigationSource.HOME_RECOMMENDED}
            collectionType="recommended"
          />
          <FlatList
            data={recommendations}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={p => (p as any)._id || p.id}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item: product }) => (
              <View style={styles.featuredCardWrapper}>
                <ProductCard
                  product={product}
                  onPress={() => handleProductPress(product)}
                  showViewCount={true}
                />
              </View>
            )}
          />
        </View>
      );
    }

    if (item.type === 'browse_all') {
      return (
        <BrowseAllCard
          onPress={() =>
            router.push({
              pathname: '/product-listing',
              params: { title: 'All Products', showAll: 'true' },
            })
          }
        />
      );
    }

    return null;
  }, [collectionProducts, loadingStates, recommendations, colors, styles]);

  // ─── Initial skeleton screen ───────────────────────────────────────────────

  if (isInitialLoading) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={colors.surface} barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Header
          title="AfroChinaTrade"
          showLogo={true}
          showCart={user?.role !== 'admin'}
          cartCount={cartCount}
          onCartPress={() => router.push('/cart')}
        />
        <View style={styles.stickySection}>
          <View style={styles.searchContainer}>
            <SearchBar
              value=""
              onChangeText={() => {}}
              placeholder="Search products, suppliers..."
              onCameraPress={() => setShowCameraModal(true)}
              onPress={() => router.push('/search')}
              editable={false}
            />
          </View>
        </View>
        <FlatList
          data={[1, 2, 3, 4]}
          keyExtractor={i => String(i)}
          showsVerticalScrollIndicator={false}
          renderItem={() => (
            <ProductSectionSkeleton variant="horizontal" itemCount={4} showHeader={true} />
          )}
        />
      </View>
    );
  }

  // ─── Main render ───────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.surface} barStyle={isDark ? 'light-content' : 'dark-content'} />

      <Header
        title="AfroChinaTrade"
        showLogo={true}
        showCart={user?.role !== 'admin'}
        cartCount={cartCount}
        onCartPress={() => router.push('/cart')}
      />

      <View style={styles.stickySection}>
        <View style={styles.searchContainer}>
          <SearchBar
            value=""
            onChangeText={() => {}}
            placeholder="Search products, suppliers..."
            onCameraPress={() => setShowCameraModal(true)}
            onPress={() => router.push('/search')}
            editable={false}
          />
        </View>
      </View>

      <FlatList
        data={sections}
        keyExtractor={(item, index) => {
          if (item.type === 'collection') return `col_${item.collection.id}`;
          if (item.type === 'skeleton') return `skel_${item.id}`;
          return `${item.type}_${index}`;
        }}
        renderItem={renderSection}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No collections available</Text>
            <Text style={styles.emptySubtext}>Collections will appear here once they are created</Text>
          </View>
        }
        ListFooterComponent={<View style={styles.listFooter} />}
      />

      <CameraSearchModal
        visible={showCameraModal}
        onClose={() => setShowCameraModal(false)}
      />
    </View>
  );
}

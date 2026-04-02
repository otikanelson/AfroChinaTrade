import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  StatusBar,
  Text,
  ActivityIndicator,
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
import { AdCarousel } from '../../components/AdCarousel';
import { PromoTiles } from '../../components/PromoTiles';
import { adService, Ad } from '../../services/AdService';
import { pageLayoutService, LayoutBlock } from '../../services/PageLayoutService';

// Maps collection name keywords to an icon and accent color
const COLLECTION_ICON_MAP: { keywords: string[]; icon: string; color: string }[] = [
  { keywords: ['featured', 'top', 'best', 'popular'], icon: 'star', color: '#D4AF37' },
  { keywords: ['new', 'arrival', 'latest', 'recent', 'fresh'], icon: 'sparkles', color: '#16a34a' },
  { keywords: ['sale', 'discount', 'deal', 'offer', 'promo', 'cheap'], icon: 'pricetag', color: '#DC3545' },
  { keywords: ['trend', 'hot', 'viral', 'buzz'], icon: 'flame', color: '#f97316' },
  { keywords: ['recommend', 'for you', 'picked', 'curated'], icon: 'heart', color: '#e11d48' },
  { keywords: ['electronic', 'tech', 'gadget', 'phone', 'computer'], icon: 'phone-portrait', color: '#3b82f6' },
  { keywords: ['fashion', 'cloth', 'wear', 'apparel', 'style', 'dress'], icon: 'shirt', color: '#8b5cf6' },
  { keywords: ['food', 'grocery', 'snack', 'drink', 'beverage'], icon: 'fast-food', color: '#f59e0b' },
  { keywords: ['home', 'furniture', 'decor', 'kitchen', 'living'], icon: 'home', color: '#06b6d4' },
  { keywords: ['beauty', 'cosmetic', 'skin', 'hair', 'care'], icon: 'rose', color: '#ec4899' },
  { keywords: ['sport', 'fitness', 'gym', 'outdoor', 'exercise'], icon: 'barbell', color: '#10b981' },
  { keywords: ['toy', 'kid', 'child', 'baby', 'game'], icon: 'game-controller', color: '#f97316' },
  { keywords: ['book', 'education', 'school', 'stationery'], icon: 'book', color: '#6366f1' },
  { keywords: ['seller', 'supplier', 'vendor', 'merchant', 'pick', 'favorite'], icon: 'ribbon', color: '#C41E3A' },
  { keywords: ['health', 'medical', 'pharmacy', 'wellness'], icon: 'medkit', color: '#14b8a6' },
];

function getCollectionMeta(name: string): { icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap; color: string } {
  const lower = name.toLowerCase();
  for (const entry of COLLECTION_ICON_MAP) {
    if (entry.keywords.some(k => lower.includes(k))) {
      return { icon: entry.icon as any, color: entry.color };
    }
  }
  return { icon: 'grid', color: '#6C757D' };
}

// How many collections to reveal per "page" as user scrolls
const COLLECTIONS_PER_PAGE = 3;

type SectionItem =
  | { type: 'features' }
  | { type: 'ads' }
  | { type: 'promo_tiles' }
  | { type: 'collection'; collection: Collection }
  | { type: 'skeleton'; id: string }
  | { type: 'recommendations' };

export default function HomeTab() {
  const router = useRouter();
  const { fonts, fontSizes, colors, isDark } = useTheme();
  const { cartCount } = useCart();
  const { user } = useAuth();

  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [promoTiles, setPromoTiles] = useState<Ad[]>([]);
  const [pageLayout, setPageLayout] = useState<LayoutBlock[]>([]);
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
      flexDirection: 'row',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      gap: spacing.sm,
    },
    section: { marginBottom: spacing.xs },
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
    loadingMoreFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.lg,
      gap: spacing.sm,
    },
    loadingMoreText: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.regular,
      color: colors.textSecondary,
    },
    endOfFeedFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.xl,
      gap: spacing.sm,
    },
    endOfFeedLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.borderLight,
    },
    endOfFeedText: {
      fontSize: fontSizes.xs,
      fontFamily: fonts.regular,
      color: colors.textLight,
    },
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

      // Load ads (non-blocking)
      adService.getAds('home', 'carousel').then(res => {
        if (res.success && res.data) setAds(res.data);
      }).catch(() => {});
      adService.getAds('home', 'tile').then(res => {
        if (res.success && res.data) setPromoTiles(res.data);
      }).catch(() => {});
      // Load page layout (non-blocking)
      pageLayoutService.getLayout('home').then(res => {
        if (res.success && res.data) setPageLayout(res.data.blocks);
      }).catch(() => {});
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
      // Refresh page layout when screen comes into focus to ensure users see admin changes immediately
      pageLayoutService.getLayout('home').then(res => {
        if (res.success && res.data) setPageLayout(res.data.blocks);
      }).catch(() => {});
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
      await Promise.all([
        loadInitialData(true),
        refreshRecommendations(),
        // Refresh page layout to ensure users see admin changes
        pageLayoutService.getLayout('home').then(res => {
          if (res.success && res.data) setPageLayout(res.data.blocks);
        })
      ]);
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

    // If layout is loaded, use it to order sections; otherwise fall back to defaults
    const orderedBlocks = pageLayout.length > 0
      ? [...pageLayout].sort((a, b) => a.order - b.order).filter(b => b.enabled)
      : null;

    const addAds = () => {
      if (ads.length > 0) items.push({ type: 'ads' });
      if (promoTiles.length > 0) items.push({ type: 'promo_tiles' });
    };

    const addRecommendations = () => {
      if (user && hasRecommendations) items.push({ type: 'recommendations' });
    };

    if (orderedBlocks) {
      // Layout-driven rendering
      for (const block of orderedBlocks) {
        switch (block.type) {
          case 'ad_carousel':
            if (ads.length > 0) items.push({ type: 'ads' });
            break;
          case 'promo_tiles':
            if (promoTiles.length > 0) items.push({ type: 'promo_tiles' });
            break;
          case 'recommendations':
            addRecommendations();
            break;
          case 'collection': {
            // Specific collection by ID
            const colId = block.config?.collectionId;
            if (colId) {
              const col = allCollections.find(c => ((c as any)._id || c.id) === colId);
              if (col) {
                const isLoading = loadingStates[col.id];
                const products = collectionProducts[col.id];
                if (isLoading && !products) {
                  items.push({ type: 'skeleton', id: col.id });
                } else if (products && products.length > 0) {
                  items.push({ type: 'collection', collection: col });
                }
              }
            }
            break;
          }
          // featured/trending/new_arrivals/etc. — show all collections in order
          default:
            break;
        }
      }

      // Always append collections not explicitly in layout (lazy-loaded batch)
      const layoutCollectionIds = new Set(
        orderedBlocks.filter(b => b.type === 'collection').map(b => b.config?.collectionId).filter(Boolean)
      );
      const visibleCollections = allCollections.slice(0, visibleCount);
      for (const col of visibleCollections) {
        const colId = (col as any)._id || col.id;
        if (layoutCollectionIds.has(colId)) continue; // already added above
        const isLoading = loadingStates[col.id];
        const products = collectionProducts[col.id];
        if (isLoading && !products) {
          items.push({ type: 'skeleton', id: col.id });
        } else if (products && products.length > 0) {
          items.push({ type: 'collection', collection: col });
        }
      }
    } else {
      // Default order (no layout saved yet)
      addAds();
      const visibleCollections = allCollections.slice(0, visibleCount);
      for (const col of visibleCollections) {
        const isLoading = loadingStates[col.id];
        const products = collectionProducts[col.id];
        if (isLoading && !products) {
          items.push({ type: 'skeleton', id: col.id });
        } else if (products && products.length > 0) {
          items.push({ type: 'collection', collection: col });
        }
      }
      addRecommendations();
    }

    if (isLoadingMoreCollections) {
      items.push({ type: 'skeleton', id: 'more_1' });
      items.push({ type: 'skeleton', id: 'more_2' });
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
    ads,
    promoTiles,
    pageLayout,
  ]);

  // ─── Render each section ───────────────────────────────────────────────────

  const renderSection = useCallback(({ item }: { item: SectionItem }) => {
    if (item.type === 'ads') {
      if (!ads.length) return null;
      return <AdCarousel ads={ads} />;
    }

    if (item.type === 'promo_tiles') {
      if (!promoTiles.length) return null;
      return <PromoTiles ads={promoTiles} />;
    }

    if (item.type === 'features') {
      const featureItems = [
        { key: 'verified-suppliers', iconName: 'shield-check', title: 'Verified', subtitle: 'Suppliers', color: colors.secondary, route: '/verified-suppliers' as const },
        { key: 'delivery', iconName: 'speedometer', title: 'Quick Delivery', subtitle: 'Make order', color: colors.accent, route: '/my-orders' as const },
        { key: 'categories', iconName: 'view-grid', title: 'All Categories', subtitle: 'Browse all', color: colors.primary, route: null },
        { key: 'get-quotes', iconName: 'file-document-edit', title: 'Get Quotes', subtitle: 'Request', color: colors.secondary, route: '/messages' as const },
      ];
      // 4 cards, spacing.base padding on each side, spacing.sm gap between 4 cards (3 gaps)
      const cardWidth = (screenWidth - spacing.base * 2 - spacing.sm * 3) / 4;
      return (
        <View style={styles.featureCardsRow}>
          {featureItems.map(fc => (
            <FeatureCard
              key={fc.key}
              iconName={fc.iconName}
              title={fc.title}
              subtitle={fc.subtitle}
              iconColor={fc.color}
              cardWidth={cardWidth}
              onPress={() => {
                if (fc.key === 'categories') {
                  router.push('/shop-categories' as any);
                } else if (fc.route) {
                  router.push(fc.route as any);
                }
              }}
            />
          ))}
        </View>
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
      const meta = getCollectionMeta(collection.name);
      return (
        <View style={styles.section}>
          <SectionHeader
            title={collection.name}
            actionText="See All"
            navigationSource={NavigationSource.HOME_COLLECTION}
            collectionType="custom"
            icon={meta.icon}
            iconColor={meta.color}
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
            icon="heart"
            iconColor="#e11d48"
          />
          <FlatList
            data={recommendations}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={p => (p as any)._id || p.id}
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

    return null;
  }, [collectionProducts, loadingStates, recommendations, colors, styles, ads, promoTiles]);

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
        ListFooterComponent={
          isLoadingMoreCollections ? (
            <View style={styles.loadingMoreFooter}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingMoreText}>Loading more...</Text>
            </View>
          ) : isInitialLoading || Object.values(loadingStates).some(Boolean) || visibleCount < allCollections.length ? (
            <View style={styles.listFooter} />
          ) : (
            <View style={styles.endOfFeedFooter}>
              <View style={styles.endOfFeedLine} />
              <Text style={styles.endOfFeedText}>You're all caught up</Text>
              <View style={styles.endOfFeedLine} />
            </View>
          )
        }
      />

      <CameraSearchModal
        visible={showCameraModal}
        onClose={() => setShowCameraModal(false)}
      />
    </View>
  );
}

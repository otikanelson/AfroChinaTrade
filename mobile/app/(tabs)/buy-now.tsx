import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { Header } from '../../components/Header';
import { ProductCard } from '../../components/ProductCard';
import { SectionHeader } from '../../components/SectionHeader';
import { ProductSectionSkeleton } from '../../components/ProductSectionSkeleton';
import { SearchBar } from '../../components/SearchBar';
import { CameraSearchModal } from '../../components/CameraSearchModal';
import { AdCarousel } from '../../components/AdCarousel';
import { PromoTiles } from '../../components/PromoTiles';
import { adService, Ad } from '../../services/AdService';
import { pageLayoutService, LayoutBlock } from '../../services/PageLayoutService';
import { productService } from '../../services/ProductService';
import { productCacheService } from '../../services/ProductCacheService';
import { Product } from '../../types/product';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useRecommendations } from '../../hooks/useRecommendations';

export default function BuyNowTab() {
  const router = useRouter();
  const { colors, spacing, fontSizes, borderRadius, fontWeights } = useTheme();
  const { user } = useAuth();
  const { width: screenWidth } = Dimensions.get('window');
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [sellerFavorites, setSellerFavorites] = useState<Product[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [buyNowAds, setBuyNowAds] = useState<Ad[]>([]);
  const [buyNowTiles, setBuyNowTiles] = useState<Ad[]>([]);
  const [pageLayout, setPageLayout] = useState<LayoutBlock[]>([]);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({
    featured: true,
    trending: true,
    seller_favorites: true,
    discounted: true,
    all: true
  });

  // Use recommendations hook for personalized products
  const { recommendations, hasRecommendations } = useRecommendations();

  useEffect(() => {
    loadAllSectionsOptimized();
  }, []);

  // Refresh page layout when screen comes into focus to ensure users see admin changes immediately
  useFocusEffect(
    useCallback(() => {
      pageLayoutService.getLayout('buy-now').then(res => {
        if (res.success && res.data) setPageLayout(res.data.blocks);
      }).catch(() => {});
    }, [])
  );

  const loadAllSectionsOptimized = async () => {
    try {
      loadCachedData();
      await loadFreshData();
      // Load buy-now ads non-blocking
      adService.getAds('buy-now', 'carousel').then(res => {
        if (res.success && res.data) setBuyNowAds(res.data);
      }).catch(() => {});
      adService.getAds('buy-now', 'tile').then(res => {
        if (res.success && res.data) setBuyNowTiles(res.data);
      }).catch(() => {});
      // Load page layout
      pageLayoutService.getLayout('buy-now').then(res => {
        if (res.success && res.data) setPageLayout(res.data.blocks);
      }).catch(() => {});
    } catch (error) {
      Alert.alert('Error', 'Failed to load products');
    }
  };

  const loadCachedData = () => {
    // Load from cache for instant display
    const cachedFeatured = productCacheService.getCachedFeaturedProducts();
    if (cachedFeatured) {
      setFeaturedProducts(cachedFeatured);
      setLoadingStates(prev => ({ ...prev, featured: false }));
    }

    const cachedTrending = productCacheService.getCachedTrendingProducts();
    if (cachedTrending) {
      setTrendingProducts(cachedTrending);
      setLoadingStates(prev => ({ ...prev, trending: false }));
    }

    const cachedSellerFavorites = productCacheService.getCachedSellerFavorites();
    if (cachedSellerFavorites) {
      setSellerFavorites(cachedSellerFavorites);
      setLoadingStates(prev => ({ ...prev, seller_favorites: false }));
    }

    const cachedDiscounted = productCacheService.getCachedDiscountedProducts();
    if (cachedDiscounted) {
      setDiscountedProducts(cachedDiscounted);
      setLoadingStates(prev => ({ ...prev, discounted: false }));
    }

    const cachedAll = productCacheService.getCachedAllProducts({ limit: 50, sortBy: 'newest' });
    if (cachedAll) {
      setAllProducts(cachedAll);
      setLoadingStates(prev => ({ ...prev, all: false }));
    }
  };

  const loadFreshData = async () => {
    // Load sections progressively for better UX
    const sections = [
      {
        key: 'featured',
        loader: () => productService.getFeaturedProducts(12),
        setter: setFeaturedProducts,
        cacher: (data: Product[]) => productCacheService.cacheFeaturedProducts(data)
      },
      {
        key: 'trending',
        loader: () => productService.getTrendingProducts('7d', 1, 12),
        setter: setTrendingProducts,
        cacher: (data: Product[]) => productCacheService.cacheTrendingProducts(data),
        transformer: (response: any) => Array.isArray(response.data) ? response.data : response.data?.products || []
      },
      {
        key: 'seller_favorites',
        loader: () => productService.getSellerFavorites(1, 12),
        setter: setSellerFavorites,
        cacher: (data: Product[]) => productCacheService.cacheSellerFavorites(data),
        transformer: (response: any) => Array.isArray(response.data) ? response.data : response.data?.products || []
      },
      {
        key: 'discounted',
        loader: () => productService.getProducts({ limit: 12, minPrice: 1, sortBy: 'price_desc' as any }),
        setter: setDiscountedProducts,
        cacher: (data: Product[]) => productCacheService.cacheDiscountedProducts(data),
        transformer: (response: any) => {
          const products = Array.isArray(response.data) ? response.data : response.data || [];
          return products.filter((product: Product) => product.discount && product.discount > 0);
        }
      },
      {
        key: 'all',
        loader: () => productService.getProducts({ limit: 50, sortBy: 'newest' as any }),
        setter: setAllProducts,
        cacher: (data: Product[]) => productCacheService.cacheAllProducts(data, { limit: 50, sortBy: 'newest' }),
        transformer: (response: any) => Array.isArray(response.data) ? response.data : response.data || []
      }
    ];

    // Load sections in parallel but update UI as each completes
    const promises = sections.map(async (section) => {
      try {
        const response = await section.loader();
        if (response.success && response.data) {
          const data = section.transformer ? section.transformer(response) : response.data;
          section.setter(data);
          section.cacher(data);
        }
      } catch {
        // silently skip failed sections
      } finally {
        setLoadingStates(prev => ({ ...prev, [section.key]: false }));
      }
    });

    await Promise.all(promises);
  };

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/product-detail/[id]',
      params: { id: product.id }
    });
  };

  const handleSeeAll = (section: string) => {
    router.push({
      pathname: '/product-listing',
      params: { 
        collection: section,
        title: section === 'featured' ? 'Featured Products' : 
               section === 'trending' ? 'Trending Products' : 
               section === 'seller_favorites' ? 'Seller Favorites' :
               section === 'discounted' ? 'Discounted Products' :
               section === 'all' ? 'All Products' : 'Products'
      }
    });
  };

  const handleRefresh = useCallback(() => {
    productCacheService.clear();
    setLoadingStates({
      featured: true,
      trending: true,
      seller_favorites: true,
      discounted: true,
      all: true
    });
    loadAllSectionsOptimized();
    // Refresh page layout to ensure users see admin changes
    pageLayoutService.getLayout('buy-now').then(res => {
      if (res.success && res.data) setPageLayout(res.data.blocks);
    }).catch(() => {});
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    section: {
      marginBottom: spacing.md,
    },
    horizontalList: {
      paddingHorizontal: spacing.base,
      gap: spacing.xs,
    },
    productCardWrapper: {
      width: 140,
    },
    masonryContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.base,
      gap: spacing.sm,
    },
    masonryColumn: {
      flex: 1,
    },
    masonryItem: {
      marginBottom: spacing.sm,
    },
    quickActions: {
      paddingHorizontal: spacing.base,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xs,
      backgroundColor: colors.surface,
      gap: spacing.sm,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    searchBarWrapper: {
      flex: 1,
    },
    iconAction: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.md,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statCards: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: 15,
    },
    statCard: {
      flex: 1,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      minHeight: 72,
      justifyContent: 'space-between',
      overflow: 'hidden',
    },
    statCardIcon: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.base,
      backgroundColor: 'rgba(255,255,255,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statCardLabel: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.bold,
      color: '#fff',
      marginTop: spacing.xs,
    },
    statCardSub: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.8)',
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: spacing['2xl'],
      gap: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      marginTop: spacing.md,
    },
    emptyText: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: spacing.lg,
    },
    browseButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      marginTop: spacing.sm,
    },
    browseButtonText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    bottomSpacing: {
      height: spacing.xl,
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
      color: colors.textLight,
    },
    loadingMoreFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.lg,
      gap: spacing.sm,
    },
    loadingMoreText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
  });

  // Build FlatList sections data — empty sections are simply omitted
  type BuyNowSection =
    | { type: 'quick_actions' }
    | { type: 'section'; key: string; title: string; products: Product[]; badge?: string }
    | { type: 'skeleton'; key: string; variant: 'horizontal' | 'grid' }
    | { type: 'recommendations' }
    | { type: 'ads' }
    | { type: 'promo_tiles' }
    | { type: 'empty' }
    | { type: 'footer' };

  const listData: BuyNowSection[] = React.useMemo(() => {
    const items: BuyNowSection[] = [{ type: 'quick_actions' }];

    const addSection = (key: string, title: string, products: Product[], badge?: string, variant: 'horizontal' | 'grid' = 'horizontal') => {
      if (loadingStates[key] && products.length === 0) {
        items.push({ type: 'skeleton', key, variant });
      } else if (products.length > 0) {
        items.push({ type: 'section', key, title, products, badge });
      }
    };

    // Map block types to section data
    const SECTION_MAP: Record<string, () => void> = {
      featured_products:  () => addSection('featured', 'Featured Products', featuredProducts),
      seller_favorites:   () => addSection('seller_favorites', 'Seller Favorites', sellerFavorites, 'Seller Pick'),
      discounted_products:() => addSection('discounted', 'Special Discounts', discountedProducts),
      trending_products:  () => addSection('trending', 'Trending Products', trendingProducts),
      new_arrivals:       () => addSection('all', 'Browse All Products', allProducts, undefined, 'grid'),
      recommendations:    () => { if (user && hasRecommendations && recommendations.length > 0) items.push({ type: 'recommendations' }); },
      ad_carousel:        () => { if (buyNowAds.length > 0) items.push({ type: 'ads' }); },
      promo_tiles:        () => { if (buyNowTiles.length > 0) items.push({ type: 'promo_tiles' }); },
    };

    const orderedBlocks = pageLayout.length > 0
      ? [...pageLayout].sort((a, b) => a.order - b.order).filter(b => b.enabled)
      : null;

    // All block types present in the layout (enabled OR disabled)
    const allLayoutTypes = new Set(pageLayout.map(b => b.type));

    if (orderedBlocks) {
      const rendered = new Set<string>();
      for (const block of orderedBlocks) {
        const fn = SECTION_MAP[block.type];
        if (fn && !rendered.has(block.type)) { fn(); rendered.add(block.type); }
      }
      // Only render sections that have NO entry in the layout at all (truly unconfigured)
      for (const [key, fn] of Object.entries(SECTION_MAP)) {
        if (!allLayoutTypes.has(key as any)) fn();
      }
    } else {
      // Default order
      addSection('featured', 'Featured Products', featuredProducts);
      addSection('seller_favorites', 'Seller Favorites', sellerFavorites, 'Seller Pick');
      addSection('discounted', 'Special Discounts', discountedProducts);
      if (user && hasRecommendations && recommendations.length > 0) items.push({ type: 'recommendations' });
      addSection('trending', 'Trending Products', trendingProducts);
      if (buyNowAds.length > 0) items.push({ type: 'ads' });
      if (buyNowTiles.length > 0) items.push({ type: 'promo_tiles' });
      addSection('all', 'Browse All Products', allProducts, undefined, 'grid');
    }

    const allEmpty = featuredProducts.length === 0 && trendingProducts.length === 0 &&
      sellerFavorites.length === 0 && discountedProducts.length === 0 && allProducts.length === 0 &&
      (!user || !hasRecommendations || recommendations.length === 0) &&
      !Object.values(loadingStates).some(Boolean);

    if (allEmpty) items.push({ type: 'empty' });

    items.push({ type: 'footer' });
    return items;
  }, [featuredProducts, trendingProducts, sellerFavorites, discountedProducts, allProducts,
      loadingStates, user, hasRecommendations, recommendations, buyNowAds, buyNowTiles, pageLayout]);

  const renderItem = useCallback(({ item }: { item: BuyNowSection }) => {
    if (item.type === 'quick_actions') {
      return (
        <View style={styles.quickActions}>
          {/* Search bar + icon actions */}
          <View style={styles.searchRow}>
            <View style={styles.searchBarWrapper}>
              <SearchBar
                value=""
                onChangeText={() => {}}
                placeholder="Search products, s..."
                onCameraPress={() => setShowCameraModal(true)}
                onPress={() => router.push('/search')}
                editable={false}
              />
            </View>
            <TouchableOpacity style={styles.iconAction} onPress={() => router.push('/wishlist')}>
              <Ionicons name="heart-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconAction} onPress={() => router.push('/my-orders')}>
              <Ionicons name="receipt-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Stat cards */}
          <View style={styles.statCards}>
            <TouchableOpacity
              style={[styles.statCard, { backgroundColor: colors.secondary }]}
              onPress={() => handleSeeAll('featured')}
            >
              <View style={styles.statCardIcon}>
                <Ionicons name="star" size={16} color="#fff" />
              </View>
              <Text style={styles.statCardLabel}>Featured</Text>
              <Text style={styles.statCardSub}>{featuredProducts.length > 0 ? `${featuredProducts.length} items` : 'Top picks'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statCard, { backgroundColor: colors.primary }]}
              onPress={() => handleSeeAll('trending')}
            >
              <View style={styles.statCardIcon}>
                <Ionicons name="flame" size={16} color="#fff" />
              </View>
              <Text style={styles.statCardLabel}>Trending</Text>
              <Text style={styles.statCardSub}>{trendingProducts.length > 0 ? `${trendingProducts.length} items` : 'Hot now'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statCard, { backgroundColor: colors.accent }]}
              onPress={() => handleSeeAll('discounted')}
            >
              <View style={styles.statCardIcon}>
                <Ionicons name="pricetag" size={16} color="#fff" />
              </View>
              <Text style={styles.statCardLabel}>Deals</Text>
              <Text style={styles.statCardSub}>{discountedProducts.length > 0 ? `${discountedProducts.length} items` : 'Save big'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (item.type === 'ads') {
      return <AdCarousel ads={buyNowAds} />;
    }

    if (item.type === 'promo_tiles') {
      return <PromoTiles ads={buyNowTiles} />;
    }

    if (item.type === 'skeleton') {
      return (
        <ProductSectionSkeleton variant={item.variant} itemCount={4} showHeader={true} />
      );
    }

    if (item.type === 'section') {
      if (item.key === 'all') {
        return (
          <View style={styles.section}>
            <SectionHeader title={item.title} icon="grid" iconColor={colors.textSecondary} />
            <View style={styles.masonryContainer}>
              <View style={styles.masonryColumn}>
                {item.products.filter((_, i) => i % 2 === 0).map(p => (
                  <View key={(p as any)._id || p.id} style={styles.masonryItem}>
                    <ProductCard product={p} onPress={() => handleProductPress(p)} variant="grid" />
                  </View>
                ))}
              </View>
              <View style={styles.masonryColumn}>
                {item.products.filter((_, i) => i % 2 === 1).map(p => (
                  <View key={(p as any)._id || p.id} style={styles.masonryItem}>
                    <ProductCard product={p} onPress={() => handleProductPress(p)} variant="grid" />
                  </View>
                ))}
              </View>
            </View>
          </View>
        );
      }
      return (
        <View style={styles.section}>
          <SectionHeader title={item.title} actionText="See All" onActionPress={() => handleSeeAll(item.key)} />
          <FlatList
            data={item.products}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={p => (p as any)._id || p.id}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item: p }) => (
              <View style={styles.productCardWrapper}>
                <ProductCard product={p} onPress={() => handleProductPress(p)} badge={item.badge} />
              </View>
            )}
          />
        </View>
      );
    }

    if (item.type === 'recommendations') {
      return (
        <View style={styles.section}>
          <SectionHeader title="Recommended for You" actionText="See All" onActionPress={() => handleSeeAll('recommended')} />
          <FlatList
            data={recommendations}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={p => (p as any)._id || p.id}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item: p }) => (
              <View style={styles.productCardWrapper}>
                <ProductCard product={p} onPress={() => handleProductPress(p)} />
              </View>
            )}
          />
        </View>
      );
    }

    if (item.type === 'empty') {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="storefront-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No products available at the moment. Check back later!</Text>
          <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/(tabs)/home')}>
            <Text style={styles.browseButtonText}>Browse All Products</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (item.type === 'footer') {
      return (
        <View style={styles.endOfFeedFooter}>
          <View style={styles.endOfFeedLine} />
          <Text style={styles.endOfFeedText}>You're all caught up</Text>
          <View style={styles.endOfFeedLine} />
        </View>
      );
    }

    return null;
  }, [colors, styles, recommendations, featuredProducts, trendingProducts, discountedProducts, buyNowAds, buyNowTiles]);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Buy Now"
        subtitle="Get fast items for you"
        showRefresh={true}
        onRefreshPress={handleRefresh}
        showCart={true}
        onCartPress={() => router.push('/cart')}
      />
      <FlatList
        data={listData}
        keyExtractor={(item, index) => (item.type === 'section' || item.type === 'skeleton') ? item.key : `${item.type}_${index}`}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          Object.values(loadingStates).some(Boolean) ? (
            <View style={styles.loadingMoreFooter}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingMoreText}>Loading products...</Text>
            </View>
          ) : null
        }
      />
      <CameraSearchModal
        visible={showCameraModal}
        onClose={() => setShowCameraModal(false)}
      />
    </SafeAreaView>
  );
}
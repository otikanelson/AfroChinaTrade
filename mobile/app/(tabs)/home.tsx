import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
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
import { productService } from '../../services/ProductService';
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
// Delay between loading each section for progressive loading (in ms)
const SECTION_LOAD_DELAY = 300;

type SectionItem =
  | { type: 'features' }
  | { type: 'ads' }
  | { type: 'promo_tiles' }
  | { type: 'section'; key: string; title: string; products: Product[]; badge?: string }
  | { type: 'skeleton'; key: string; variant: 'horizontal' | 'grid' }
  | { type: 'recommendations' }
  | { type: 'collection'; collection: Collection }
  | { type: 'loading_more' };

export default function HomeTab() {
  const router = useRouter();
  const { fonts, fontSizes, colors, isDark } = useTheme();
  const { cartCount } = useCart();
  const { user } = useAuth();

  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [sellerFavorites, setSellerFavorites] = useState<Product[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [promoTiles, setPromoTiles] = useState<Ad[]>([]);
  const [pageLayout, setPageLayout] = useState<LayoutBlock[]>([]);
  const [visibleCount, setVisibleCount] = useState(COLLECTIONS_PER_PAGE);
  const [collectionProducts, setCollectionProducts] = useState<Record<string, Product[]>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({
    featured: true,
    trending: true,
    seller_favorites: true,
    discounted: true,
    new_arrivals: true
  });
  const [sectionsLoaded, setSectionsLoaded] = useState<Record<string, boolean>>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMoreCollections, setIsLoadingMoreCollections] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [layoutVersion, setLayoutVersion] = useState<string>('');
  const { width: screenWidth } = Dimensions.get('window');
  const loadingCollectionIds = useRef<Set<string>>(new Set());
  const sectionLoadTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

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

  const loadSectionProgressively = useCallback(async (
    sectionKey: string,
    loader: () => Promise<any>,
    setter: (data: Product[]) => void,
    cacher: (data: Product[]) => void,
    transformer?: (response: any) => Product[],
    delay: number = 0
  ) => {
    // Clear any existing timeout for this section
    if (sectionLoadTimeouts.current[sectionKey]) {
      clearTimeout(sectionLoadTimeouts.current[sectionKey]);
    }

    // Set loading state immediately
    setLoadingStates(prev => ({ ...prev, [sectionKey]: true }));

    // Load cached data first if available
    const getCachedData = () => {
      switch (sectionKey) {
        case 'featured': return productCacheService.getCachedFeaturedProducts();
        case 'trending': return productCacheService.getCachedTrendingProducts();
        case 'seller_favorites': return productCacheService.getCachedSellerFavorites();
        case 'discounted': return productCacheService.getCachedDiscountedProducts();
        default: return null;
      }
    };

    const cachedData = getCachedData();
    if (cachedData) {
      setter(cachedData);
      setLoadingStates(prev => ({ ...prev, [sectionKey]: false }));
      setSectionsLoaded(prev => ({ ...prev, [sectionKey]: true }));
    }

    // Load fresh data with delay for progressive loading
    sectionLoadTimeouts.current[sectionKey] = setTimeout(async () => {
      try {
        const response = await loader();
        if (response.success && response.data) {
          const data = transformer ? transformer(response) : response.data;
          setter(data);
          cacher(data);
        }
      } catch {
        // silently skip failed sections
      } finally {
        setLoadingStates(prev => ({ ...prev, [sectionKey]: false }));
        setSectionsLoaded(prev => ({ ...prev, [sectionKey]: true }));
      }
    }, delay);
  }, []);

  const loadInitialData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        // Clear all timeouts
        Object.values(sectionLoadTimeouts.current).forEach(timeout => clearTimeout(timeout));
        sectionLoadTimeouts.current = {};
        
        productCacheService.clear();
        loadingCollectionIds.current.clear();
        setCollectionProducts({});
        setSectionsLoaded({});
        setLoadingStates({
          featured: true,
          trending: true,
          seller_favorites: true,
          discounted: true,
          new_arrivals: true
        });
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

      // Load collections and layout first
      const [, collectionsResponse, layoutResponse] = await Promise.all([
        categoryService.getCategories(),
        collectionService.getActiveCollections(),
        pageLayoutService.getLayout('home'),
      ]);

      if (collectionsResponse.success && collectionsResponse.data) {
        const cols = collectionsResponse.data;
        setAllCollections(cols);
        // Load collection products for the first batch
        loadCollectionProducts(cols.slice(0, COLLECTIONS_PER_PAGE));
      }

      // Set page layout and track version for change detection
      if (layoutResponse.success && layoutResponse.data) {
        setPageLayout(layoutResponse.data.blocks);
        setLayoutVersion(layoutResponse.data.updatedAt);
        // Load only the product sections that are enabled in the layout
        loadEnabledProductSectionsProgressively(layoutResponse.data.blocks);
      } else {
        // No layout configured, load default sections
        loadProductSectionsProgressively();
      }

      // Load ads (non-blocking)
      adService.getAds('home', 'carousel').then(res => {
        if (res.success && res.data) setAds(res.data);
      }).catch(() => {});
      adService.getAds('home', 'tile').then(res => {
        if (res.success && res.data) setPromoTiles(res.data);
      }).catch(() => {});
    } catch {
      if (!isRefresh) Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setIsInitialLoading(false);
    }
  }, [loadCollectionProducts, loadSectionProgressively, loadEnabledProductSectionsProgressively]);

  const loadProductSectionsProgressively = async () => {
    const sections = [
      {
        key: 'featured',
        loader: () => productService.getFeaturedProducts(12),
        setter: setFeaturedProducts,
        cacher: (data: Product[]) => productCacheService.cacheFeaturedProducts(data),
        delay: 0
      },
      {
        key: 'trending',
        loader: () => productService.getTrendingProducts('7d', 1, 12),
        setter: setTrendingProducts,
        cacher: (data: Product[]) => productCacheService.cacheTrendingProducts(data),
        transformer: (response: any) => Array.isArray(response.data) ? response.data : response.data?.products || [],
        delay: SECTION_LOAD_DELAY
      },
      {
        key: 'seller_favorites',
        loader: () => productService.getSellerFavorites(1, 12),
        setter: setSellerFavorites,
        cacher: (data: Product[]) => productCacheService.cacheSellerFavorites(data),
        transformer: (response: any) => Array.isArray(response.data) ? response.data : response.data?.products || [],
        delay: SECTION_LOAD_DELAY * 2
      },
      {
        key: 'discounted',
        loader: () => productService.getProducts({ limit: 12, minPrice: 1, sortBy: 'price_desc' as any }),
        setter: setDiscountedProducts,
        cacher: (data: Product[]) => productCacheService.cacheDiscountedProducts(data),
        transformer: (response: any) => {
          const products = Array.isArray(response.data) ? response.data : response.data || [];
          return products.filter((product: Product) => product.discount && product.discount > 0);
        },
        delay: SECTION_LOAD_DELAY * 3
      },
      {
        key: 'new_arrivals',
        loader: () => productService.getProducts({ limit: 12, sortBy: 'newest' as any }),
        setter: setNewArrivals,
        cacher: (data: Product[]) => productCacheService.cacheAllProducts(data, { limit: 12, sortBy: 'newest' }),
        transformer: (response: any) => Array.isArray(response.data) ? response.data : response.data || [],
        delay: SECTION_LOAD_DELAY * 4
      }
    ];

    // Load sections progressively with delays
    sections.forEach(section => {
      loadSectionProgressively(
        section.key,
        section.loader,
        section.setter,
        section.cacher,
        section.transformer,
        section.delay
      );
    });
  };

  // Use a ref so useFocusEffect can call this without it being a dependency
  const loadEnabledRef = useRef<(blocks: LayoutBlock[]) => void>(() => {});

  const loadEnabledProductSectionsProgressively = useCallback(async (blocks: LayoutBlock[]) => {
    // Only load sections that are enabled in the layout
    const enabledSections = blocks.filter(block => block.enabled);
    const sectionsToLoad: string[] = [];
    
    for (const block of enabledSections) {
      switch (block.type) {
        case 'featured_products':
          sectionsToLoad.push('featured');
          break;
        case 'trending_products':
          sectionsToLoad.push('trending');
          break;
        case 'seller_favorites':
          sectionsToLoad.push('seller_favorites');
          break;
        case 'discounted_products':
          sectionsToLoad.push('discounted');
          break;
        case 'new_arrivals':
          sectionsToLoad.push('new_arrivals');
          break;
        case 'collection':
          if (block.config?.collectionId) {
            loadCollectionProducts([{ id: block.config.collectionId } as any]);
          }
          break;
      }
    }

    if (!sectionsToLoad.includes('featured')) setFeaturedProducts([]);
    if (!sectionsToLoad.includes('trending')) setTrendingProducts([]);
    if (!sectionsToLoad.includes('seller_favorites')) setSellerFavorites([]);
    if (!sectionsToLoad.includes('discounted')) setDiscountedProducts([]);
    if (!sectionsToLoad.includes('new_arrivals')) setNewArrivals([]);

    const sections = [
      {
        key: 'featured',
        loader: () => productService.getFeaturedProducts(12),
        setter: setFeaturedProducts,
        cacher: (data: Product[]) => productCacheService.cacheFeaturedProducts(data),
        delay: 0
      },
      {
        key: 'trending',
        loader: () => productService.getTrendingProducts('7d', 1, 12),
        setter: setTrendingProducts,
        cacher: (data: Product[]) => productCacheService.cacheTrendingProducts(data),
        transformer: (response: any) => Array.isArray(response.data) ? response.data : response.data?.products || [],
        delay: SECTION_LOAD_DELAY
      },
      {
        key: 'seller_favorites',
        loader: () => productService.getSellerFavorites(1, 12),
        setter: setSellerFavorites,
        cacher: (data: Product[]) => productCacheService.cacheSellerFavorites(data),
        transformer: (response: any) => Array.isArray(response.data) ? response.data : response.data?.products || [],
        delay: SECTION_LOAD_DELAY * 2
      },
      {
        key: 'discounted',
        loader: () => productService.getProducts({ limit: 12, minPrice: 1, sortBy: 'price_desc' as any }),
        setter: setDiscountedProducts,
        cacher: (data: Product[]) => productCacheService.cacheDiscountedProducts(data),
        transformer: (response: any) => {
          const products = Array.isArray(response.data) ? response.data : response.data || [];
          return products.filter((product: Product) => product.discount && product.discount > 0);
        },
        delay: SECTION_LOAD_DELAY * 3
      },
      {
        key: 'new_arrivals',
        loader: () => productService.getProducts({ limit: 12, sortBy: 'newest' as any }),
        setter: setNewArrivals,
        cacher: (data: Product[]) => productCacheService.cacheAllProducts(data, { limit: 12, sortBy: 'newest' }),
        transformer: (response: any) => Array.isArray(response.data) ? response.data : response.data || [],
        delay: SECTION_LOAD_DELAY * 4
      }
    ].filter(section => sectionsToLoad.includes(section.key));

    let delayIndex = 0;
    sections.forEach(section => {
      loadSectionProgressively(
        section.key,
        section.loader,
        section.setter,
        section.cacher,
        (section as any).transformer,
        delayIndex * SECTION_LOAD_DELAY
      );
      delayIndex++;
    });

    setLoadingStates(prev => ({
      ...prev,
      ...(sectionsToLoad.includes('featured') ? {} : { featured: false }),
      ...(sectionsToLoad.includes('trending') ? {} : { trending: false }),
      ...(sectionsToLoad.includes('seller_favorites') ? {} : { seller_favorites: false }),
      ...(sectionsToLoad.includes('discounted') ? {} : { discounted: false }),
      ...(sectionsToLoad.includes('new_arrivals') ? {} : { new_arrivals: false }),
    }));
  }, [loadCollectionProducts, loadSectionProgressively]);

  // Keep the ref in sync with the latest version of the function
  useEffect(() => {
    loadEnabledRef.current = loadEnabledProductSectionsProgressively;
  }, [loadEnabledProductSectionsProgressively]);

  useEffect(() => {
    loadInitialData();
    
    // Cleanup timeouts on unmount
    return () => {
      Object.values(sectionLoadTimeouts.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshRecommendations();
      // Check for layout changes using ref to avoid re-render loop
      pageLayoutService.getLayout('home').then(res => {
        if (res.success && res.data) {
          const newLayoutVersion = res.data.updatedAt;
          setLayoutVersion(prev => {
            if (prev && newLayoutVersion !== prev) {
              setPageLayout(res.data!.blocks);
              loadEnabledRef.current(res.data!.blocks);
            } else if (!prev) {
              setPageLayout(res.data!.blocks);
            }
            return newLayoutVersion;
          });
        }
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
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [loadInitialData, refreshRecommendations]);

  const handleProductPress = (product: Product) => {
    const productId = (product as any)._id || product.id;
    router.push({ pathname: '/product-detail/[id]', params: { id: productId } });
  };

  const handleSeeAll = (section: string) => {
    router.push({
      pathname: '/products',
      params: { 
        collection: section,
        title: section === 'featured' ? 'Featured Products' : 
               section === 'trending' ? 'Trending Products' : 
               section === 'seller_favorites' ? 'Seller Favorites' :
               section === 'discounted' ? 'Discounted Products' :
               section === 'new_arrivals' ? 'New Arrivals' : 'Products'
      }
    });
  };

  // ─── Build FlatList data ───────────────────────────────────────────────────

  const sections: SectionItem[] = React.useMemo(() => {
    const items: SectionItem[] = [{ type: 'features' }];

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
      new_arrivals:       () => addSection('new_arrivals', 'New Arrivals', newArrivals),
      recommendations:    () => { if (user && hasRecommendations && recommendations.length > 0) items.push({ type: 'recommendations' }); },
      ad_carousel:        () => { if (ads.length > 0) items.push({ type: 'ads' }); },
      promo_tiles:        () => { if (promoTiles.length > 0) items.push({ type: 'promo_tiles' }); },
    };

    const orderedBlocks = pageLayout.length > 0
      ? [...pageLayout].sort((a, b) => a.order - b.order).filter(b => b.enabled)
      : null;

    // All block types present in the layout (enabled OR disabled)
    const allLayoutTypes = new Set(pageLayout.map(b => b.type));

    if (orderedBlocks) {
      const rendered = new Set<string>();
      for (const block of orderedBlocks) {
        if (block.type === 'collection' && block.config?.collectionId) {
          // Handle specific collection blocks
          const colId = block.config.collectionId;
          const col = allCollections.find(c => ((c as any)._id || c.id) === colId);
          if (col) {
            const isLoading = loadingStates[col.id];
            const products = collectionProducts[col.id];
            if (isLoading && !products) {
              items.push({ type: 'skeleton', key: col.id, variant: 'horizontal' });
            } else if (products && products.length > 0) {
              items.push({ type: 'collection', collection: col });
            }
          }
        } else {
          const fn = SECTION_MAP[block.type];
          if (fn && !rendered.has(block.type)) { fn(); rendered.add(block.type); }
        }
      }
    } else {
      // Default order (only when no layout is configured at all)
      // Show a minimal set of sections
      if (ads.length > 0) items.push({ type: 'ads' });
      if (promoTiles.length > 0) items.push({ type: 'promo_tiles' });
      
      // Add collections as fallback only when no layout exists
      const visibleCollections = allCollections.slice(0, visibleCount);
      for (const col of visibleCollections) {
        const isLoading = loadingStates[col.id];
        const products = collectionProducts[col.id];
        if (isLoading && !products) {
          items.push({ type: 'skeleton', key: col.id, variant: 'horizontal' });
        } else if (products && products.length > 0) {
          items.push({ type: 'collection', collection: col });
        }
      }
    }

    if (isLoadingMoreCollections) {
      items.push({ type: 'skeleton', key: 'more_1', variant: 'horizontal' });
      items.push({ type: 'skeleton', key: 'more_2', variant: 'horizontal' });
    }

    // Add loading more indicator at the bottom when sections are still loading
    const stillLoading = Object.values(loadingStates).some(Boolean);
    if (stillLoading && !isInitialLoading) {
      items.push({ type: 'loading_more' });
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
    featuredProducts,
    trendingProducts,
    sellerFavorites,
    discountedProducts,
    newArrivals,
    recommendations,
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
          key={item.key}
          variant={item.variant}
          itemCount={4}
          showHeader={true}
        />
      );
    }

    if (item.type === 'section') {
      return (
        <View style={styles.section}>
          <SectionHeader
            title={item.title}
            actionText="See All"
            onActionPress={() => handleSeeAll(item.key)}
          />
          <FlatList
            data={item.products}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={p => (p as any)._id || p.id}
            renderItem={({ item: product }) => (
              <View style={styles.featuredCardWrapper}>
                <ProductCard
                  product={product}
                  onPress={() => handleProductPress(product)}
                  badge={item.badge}
                  showViewCount={true}
                />
              </View>
            )}
          />
        </View>
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
                pathname: '/products',
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

    if (item.type === 'loading_more') {
      return (
        <View style={styles.loadingMoreFooter}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingMoreText}>Loading more sections...</Text>
        </View>
      );
    }

    return null;
  }, [collectionProducts, loadingStates, recommendations, colors, styles, ads, promoTiles, handleSeeAll]);

  // ─── Initial skeleton screen ───────────────────────────────────────────────

  if (isInitialLoading) {
    return (
      <View style={styles.container}>
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
              onPress={() => router.push('/products')}
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
            onPress={() => router.push('/products')}
            editable={false}
          />
        </View>
      </View>

      <FlatList
        data={sections}
        keyExtractor={(item, index) => {
          if (item.type === 'collection') return `col_${item.collection.id}`;
          if (item.type === 'skeleton') return `skel_${item.key}`;
          if (item.type === 'section') return `sec_${item.key}`;
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
          ) : (
            <View style={styles.listFooter} />
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

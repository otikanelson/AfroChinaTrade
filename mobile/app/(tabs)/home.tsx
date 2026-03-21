import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Text, Image, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from '../../components/SearchBar';
import { CategoryTabs } from '../../components/CategoryTabs';
import { ProductCard } from '../../components/ProductCard';
import { FeatureCard } from '../../components/FeatureCard';
import { SectionHeader } from '../../components/SectionHeader';
import { productService } from '../../services/ProductService';
import { categoryService } from '../../services/CategoryService';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { Product, Category } from '../../types/product';

export default function HomeTab() {
  const router = useRouter();
  const { colors, fonts, fontSizes, spacing } = useTheme();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      backgroundColor: colors.background,
      paddingTop: 10,
      paddingBottom: spacing.sm,
      paddingHorizontal: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logoSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    logo: {
      width: 40,
      height: 40,
      marginRight: spacing.sm,
    },
    headerTextContainer: {},
    headerTitle: {
      fontSize: 18,
      fontFamily: fonts.bold,
      fontWeight: '700',
      marginBottom: 2,
    },
    afro: {
      color: colors.secondary,
    },
    china: {
      color: colors.primary,
    },
    trade: {
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: fontSizes.xs,
      fontFamily: fonts.regular,
      color: colors.textSecondary,
    },
    scrollView: {
      flex: 1,
    },
    searchContainer: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
    },
    featureCardsContainer: {
      paddingVertical: spacing.md,
      marginBottom: spacing.base,
    },
    featureCardsRow: {
      paddingHorizontal: spacing.base,
      gap: spacing.sm,
    },
    section: {
      marginBottom: spacing.lg,
    },
    horizontalList: {
      paddingHorizontal: spacing.base,
      gap: spacing.md,
    },
    featuredCardWrapper: {
      width: 160,
    },
    masonryContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.base,
      gap: spacing.md,
    },
    masonryColumn: {
      flex: 1,
    },
    masonryItem: {
      marginBottom: spacing.md,
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
      fontFamily: fonts.regular,
      color: colors.textSecondary,
    },
    productsLoadingContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.base,
      gap: spacing.sm,
    },
    emptyContainer: {
      padding: spacing.xl,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: fontSizes.lg,
      fontFamily: fonts.medium,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    emptySubtext: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.regular,
      color: colors.textLight,
      textAlign: 'center',
    },
    cartButton: {
      position: 'relative',
      padding: spacing.sm,
    },
    cartBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: colors.error,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cartBadgeText: {
      color: colors.textInverse,
      fontSize: 10,
      fontWeight: '600',
    },
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load products when category or search changes
  useEffect(() => {
    loadProducts();
  }, [activeCategory, searchQuery]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Load categories and featured products in parallel
      const [categoriesResponse, featuredResponse] = await Promise.all([
        categoryService.getCategories(),
        productService.getFeaturedProducts(10)
      ]);

      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }

      if (featuredResponse.success && featuredResponse.data) {
        setFeaturedProducts(featuredResponse.data);
      }

      // Load initial products
      await loadProducts();
    } catch (error) {
      console.error('Failed to load initial data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true);
      
      const params: any = {
        limit: 20,
        page: 1
      };

      // Add category filter if not "All"
      if (activeCategory !== 'All') {
        params.category = activeCategory;
      }

      // Add search query if provided
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await productService.getProducts(params);
      
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleProductPress = (product: Product) => {
    // Handle both _id and id fields from backend
    const productId = (product as any)._id || product.id;
    router.push({ pathname: '/product-detail/[id]', params: { id: productId } });
  };

  const categoryNames = ['All', ...categories.map(c => c.name)];

  // Filter featured products by category and search query
  const filteredFeaturedProducts = featuredProducts.filter(product => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Split products into two columns for masonry layout
  const getMasonryColumns = (productList: Product[]) => {
    const leftColumn: Product[] = [];
    const rightColumn: Product[] = [];
    productList.forEach((product, index) => {
      if (index % 2 === 0) leftColumn.push(product);
      else rightColumn.push(product);
    });
    return { leftColumn, rightColumn };
  };

  const { leftColumn, rightColumn } = getMasonryColumns(products);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoSection}>
            <Image
              source={require('../../assets/images/Logo_bg.png')}
              style={styles.logo}
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>
                <Text style={styles.afro}>Afro</Text>
                <Text style={styles.china}>China</Text>
                <Text style={styles.trade}>Trade</Text>
              </Text>
              <Text style={styles.headerSubtitle}>
                Connecting Africa and China through Trade
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/cart')}>
            <Ionicons name="cart-outline" size={24} color={colors.text} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products, suppliers..."
            onCameraPress={() => console.log('Camera pressed')}
            onSearchPress={() => console.log('Search pressed')}
          />
        </View>

        {/* Category Tabs */}
        <CategoryTabs
          categories={categoryNames}
          activeCategory={activeCategory}
          onCategoryPress={setActiveCategory}
        />

        {/* Feature Cards - Single Row */}
        <View style={styles.featureCardsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featureCardsRow}
          >
            <FeatureCard
              key="verified-suppliers"
              iconName="shield-check"
              title="Verified"
              subtitle="Suppliers"
              iconColor={colors.secondary}
            />
            <FeatureCard
              key="secure-trading"
              iconName="lock"
              title="Secure"
              subtitle="Trading"
              iconColor={colors.accent}
            />
            <FeatureCard
              key="categories"
              iconName="view-grid"
              title="Categories"
              subtitle="Browse all"
              iconColor={colors.primary}
            />
            <FeatureCard
              key="get-quotes"
              iconName="file-document-edit"
              title="Get Quotes"
              subtitle="Request"
              iconColor={colors.secondary}
            />
          </ScrollView>
        </View>

        {/* Featured Products */}
        {filteredFeaturedProducts.length > 0 && (
          <View style={styles.section}>
            <SectionHeader 
              title="Featured Products" 
              subtitle="Handpicked deals for you"
              actionText="See All"
              onActionPress={() => console.log('See all featured')} 
            />
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {filteredFeaturedProducts.map(product => {
                const productId = (product as any)._id || product.id;
                const badgeText = product.discount && product.discount > 0 ? 'Hot Deal' : product.isNew ? 'New' : undefined;
                return (
                  <View key={productId} style={styles.featuredCardWrapper}>
                    <ProductCard
                      product={product}
                      badge={badgeText}
                      onPress={() => handleProductPress(product)}
                    />
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Products Loading Indicator */}
        {isLoadingProducts && (
          <View style={styles.productsLoadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        )}

        {/* Masonry Product Grid */}
        <View style={styles.section}>
          <SectionHeader 
            title={activeCategory === 'All' ? 'All Products' : activeCategory}
            subtitle={`${products.length || 0} products`}
            actionText="See All"
            onActionPress={() => console.log('See all', activeCategory)} 
          />
          {products.length > 0 ? (
            <View style={styles.masonryContainer}>
              <View style={styles.masonryColumn}>
                {leftColumn.map(product => {
                  const productId = (product as any)._id || product.id;
                  const badgeText = product.discount && product.discount > 0 ? `${product.discount}% OFF` : product.isNew ? 'New' : undefined;
                  return (
                    <View key={productId} style={styles.masonryItem}>
                      <ProductCard
                        product={product}
                        badge={badgeText}
                        onPress={() => handleProductPress(product)}
                      />
                    </View>
                  );
                })}
              </View>
              <View style={styles.masonryColumn}>
                {rightColumn.map(product => {
                  const productId = (product as any)._id || product.id;
                  const badgeText = product.discount && product.discount > 0 ? `${product.discount}% OFF` : product.isNew ? 'New' : undefined;
                  return (
                    <View key={productId} style={styles.masonryItem}>
                      <ProductCard
                        product={product}
                        badge={badgeText}
                        onPress={() => handleProductPress(product)}
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or category filter</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
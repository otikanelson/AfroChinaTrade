import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from '../../components/SearchBar';
import { CategoryTabs } from '../../components/CategoryTabs';
import { ProductCard } from '../../components/ProductCard';
import { FeatureCard } from '../../components/FeatureCard';
import { SectionHeader } from '../../components/SectionHeader';
import { mockProducts, mockCategories, featuredProducts } from '../../data/mockData';
import { theme } from '../../theme';
import { Product } from '../../types/product';

export default function HomeTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...mockCategories.map(c => c.name)];

  // Filter products by category and search query
  const filteredProducts = mockProducts.filter(product => {
    // Filter by category
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    
    // Filter by search query (case-insensitive)
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Filter featured products by category and search query (same logic as all products)
  const filteredFeaturedProducts = featuredProducts.filter(product => {
    // Filter by category
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    
    // Filter by search query (case-insensitive)
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Split products into two columns for masonry layout
  const getMasonryColumns = (products: Product[]) => {
    const leftColumn: Product[] = [];
    const rightColumn: Product[] = [];
    
    products.forEach((product, index) => {
      if (index % 2 === 0) {
        leftColumn.push(product);
      } else {
        rightColumn.push(product);
      }
    });
    
    return { leftColumn, rightColumn };
  };

  const { leftColumn, rightColumn } = getMasonryColumns(filteredProducts);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/Logo_bg.png')}
            style={styles.logo}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              <Text style={styles.afro}>Afro</Text>
              <Text style={styles.china}>China</Text>
              <Text style={styles.trade}>Trade</Text>
            </Text>
            <Text style={styles.headerSubtitle}>Connecting Africa and China through Trade</Text>
          </View>
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
          categories={categories}
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
              iconName="shield-check"
              title="Verified"
              subtitle="Suppliers"
              iconColor={theme.colors.secondary}
            />
            <FeatureCard
              iconName="lock"
              title="Secure"
              subtitle="Trading"
              iconColor={theme.colors.accent}
            />
            <FeatureCard
              iconName="view-grid"
              title="Categories"
              subtitle="Browse all"
              iconColor={theme.colors.primary}
            />
            <FeatureCard
              iconName="file-document-edit"
              title="Get Quotes"
              subtitle="Request"
              iconColor={theme.colors.secondary}
            />
          </ScrollView>
        </View>

        {/* Featured Products */}
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
            {filteredFeaturedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                badge={product.discount ? 'Hot Deal' : product.isNew ? 'New' : undefined}
              />
            ))}
          </ScrollView>
        </View>

        {/* Masonry Product Grid */}
        <View style={styles.section}>
          <SectionHeader 
            title={activeCategory === 'All' ? 'All Products' : activeCategory}
            subtitle={`${filteredProducts.length} products`}
            actionText="See All"
            onActionPress={() => console.log('See all', activeCategory)} 
          />
          <View style={styles.masonryContainer}>
            <View style={styles.masonryColumn}>
              {leftColumn.map(product => (
                <View key={product.id} style={styles.masonryItem}>
                  <ProductCard
                    product={product}
                    badge={product.discount ? `${product.discount}% OFF` : product.isNew ? 'New' : undefined}
                  />
                </View>
              ))}
            </View>
            <View style={styles.masonryColumn}>
              {rightColumn.map(product => (
                <View key={product.id} style={styles.masonryItem}>
                  <ProductCard
                    product={product}
                    badge={product.discount ? `${product.discount}% OFF` : product.isNew ? 'New' : undefined}
                  />
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    backgroundColor: theme.colors.background,
    paddingTop: 0,
    paddingBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: theme.spacing.sm,
  },
  headerTextContainer: {},
  headerTitle: {
    fontSize: 18,
    fontWeight: theme.fontWeights.bold,
    marginBottom: 2,
  },
  afro: {
    color: theme.colors.secondary,
  },
  china: {
    color: theme.colors.primary,
  },
  trade: {
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
  },
  featureCardsContainer: {
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.base,
  },
  featureCardsRow: {
    paddingHorizontal: theme.spacing.base,
    gap: theme.spacing.sm,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  horizontalList: {
    paddingHorizontal: theme.spacing.base,
    gap: theme.spacing.md,
  },
  masonryContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.base,
    gap: theme.spacing.md,
  },
  masonryColumn: {
    flex: 1,
  },
  masonryItem: {
    marginBottom: theme.spacing.md,
  },
});

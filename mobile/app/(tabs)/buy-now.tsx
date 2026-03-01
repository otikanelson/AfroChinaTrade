import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { SearchBar } from '../../components/SearchBar';
import { CategoryTabs } from '../../components/CategoryTabs';
import { ProductCard } from '../../components/ProductCard';
import { SectionHeader } from '../../components/SectionHeader';
import { mockProducts, mockCategories } from '../../data/mockData';
import { theme } from '../../theme';
import { Product } from '../../types/product';

export default function BuyNowTab() {
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Buy Now</Text>
        <Text style={styles.headerSubtitle}>Browse all products</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products..."
            onSearchPress={() => console.log('Search')}
          />
        </View>

        {/* Category Tabs */}
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryPress={setActiveCategory}
        />

        {/* Products Grid */}
        <View style={styles.section}>
          <SectionHeader 
            title={activeCategory === 'All' ? 'All Products' : activeCategory}
            subtitle={`${filteredProducts.length} products`}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    backgroundColor: theme.colors.background,
    paddingTop: 40,
    paddingBottom: theme.spacing.base,
    paddingHorizontal: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  headerTitle: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.base,
  },
  section: {
    marginBottom: theme.spacing.lg,
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

import React, { useMemo, useCallback } from 'react';
import { 
  FlatList, 
  View, 
  StyleSheet, 
  Dimensions, 
  ListRenderItem,
  RefreshControl,
  ActivityIndicator,
  Text
} from 'react-native';
import { ProductCard } from './ProductCard';
import { Product } from '../types/product';
import { useTheme } from '../contexts/ThemeContext';
import { spacing } from '../theme/spacing';
import { colors } from '../theme/colors';
import { fontSizes } from '../theme/typography';

const { width: screenWidth } = Dimensions.get('window');

interface VirtualizedProductGridProps {
  products: Product[];
  onProductPress: (product: Product) => void;
  onEndReached?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
  loadingMore?: boolean;
  numColumns?: number;
  showViewCount?: boolean;
  trackViews?: boolean;
  variant?: 'grid' | 'list';
  ListEmptyComponent?: React.ComponentType | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType | React.ReactElement | null;
  contentContainerStyle?: any;
}

/**
 * VirtualizedProductGrid Component
 * 
 * A high-performance virtualized grid component for displaying large lists of products.
 * Optimized for memory efficiency and smooth scrolling with proper item layout calculations.
 * 
 * Features:
 * - Virtualized rendering for large datasets
 * - Optimized getItemLayout for better performance
 * - Configurable grid columns
 * - Pull-to-refresh support
 * - Loading states and pagination
 * - Memory efficient with removeClippedSubviews
 * - Optimized rendering batch sizes
 */
export const VirtualizedProductGrid: React.FC<VirtualizedProductGridProps> = ({
  products,
  onProductPress,
  onEndReached,
  onRefresh,
  refreshing = false,
  loading = false,
  loadingMore = false,
  numColumns = 2,
  showViewCount = true,
  trackViews = true,
  variant = 'grid',
  ListEmptyComponent,
  ListFooterComponent,
  contentContainerStyle,
}) => {
  const { colors: themeColors } = useTheme();

  // Calculate item dimensions for optimal layout
  const itemDimensions = useMemo(() => {
    const horizontalPadding = spacing.base * 2; // Left and right padding
    const itemSpacing = spacing.md; // Space between items
    const availableWidth = screenWidth - horizontalPadding;
    const itemWidth = (availableWidth - (itemSpacing * (numColumns - 1))) / numColumns;
    
    // For grid variant, use square aspect ratio
    // For list variant, use rectangular aspect ratio
    const itemHeight = variant === 'grid' 
      ? itemWidth + 120 // Square image + content height
      : 120; // Fixed height for list items

    return {
      width: itemWidth,
      height: itemHeight,
      spacing: itemSpacing,
    };
  }, [numColumns, variant]);

  // Optimized getItemLayout for better performance
  const getItemLayout = useCallback((data: any, index: number) => {
    const { height, spacing: itemSpacing } = itemDimensions;
    const rowIndex = Math.floor(index / numColumns);
    const itemHeight = height + itemSpacing;
    
    return {
      length: itemHeight,
      offset: rowIndex * itemHeight,
      index,
    };
  }, [itemDimensions, numColumns]);

  // Render individual product item
  const renderProduct: ListRenderItem<Product> = useCallback(({ item, index }) => {
    const isLastInRow = (index + 1) % numColumns === 0;
    const marginRight = isLastInRow ? 0 : itemDimensions.spacing;

    return (
      <View 
        style={[
          styles.productItem,
          {
            width: itemDimensions.width,
            marginRight,
            marginBottom: itemDimensions.spacing,
          }
        ]}
      >
        <ProductCard
          product={item}
          onPress={() => onProductPress(item)}
          showViewCount={showViewCount}
          trackViews={trackViews}
          variant={variant}
        />
      </View>
    );
  }, [itemDimensions, numColumns, onProductPress, showViewCount, trackViews, variant]);

  // Default empty component
  const defaultEmptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
        No products found
      </Text>
      <Text style={[styles.emptySubtext, { color: themeColors.textLight }]}>
        Try adjusting your filters or check back later
      </Text>
    </View>
  ), [themeColors]);

  // Default footer component with loading indicator
  const defaultFooterComponent = useCallback(() => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color={themeColors.primary} />
        <Text style={[styles.loadMoreText, { color: themeColors.textSecondary }]}>
          Loading more products...
        </Text>
      </View>
    );
  }, [loadingMore, themeColors]);

  // Key extractor for better performance
  const keyExtractor = useCallback((item: Product) => {
    return (item as any)._id || item.id || `product-${Math.random()}`;
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    productItem: {
      // Dynamic styles applied inline
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
      minHeight: 300,
    },
    emptyText: {
      fontSize: fontSizes.lg,
      fontWeight: '600',
      marginBottom: spacing.sm,
    },
    emptySubtext: {
      fontSize: fontSizes.sm,
      textAlign: 'center',
      lineHeight: 20,
    },
    loadMoreContainer: {
      padding: spacing.lg,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    loadMoreText: {
      fontSize: fontSizes.sm,
    },
  });

  return (
    <FlatList
      style={styles.container}
      data={products}
      numColumns={numColumns}
      keyExtractor={keyExtractor}
      renderItem={renderProduct}
      getItemLayout={getItemLayout}
      contentContainerStyle={[
        {
          padding: spacing.base,
          paddingBottom: spacing.xl, // Extra bottom padding
        },
        products.length === 0 && { flex: 1 },
        contentContainerStyle,
      ]}
      
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={8}
      windowSize={10}
      
      // Pagination and refresh
      onEndReached={onEndReached}
      onEndReachedThreshold={0.8}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themeColors.primary]}
            tintColor={themeColors.primary}
          />
        ) : undefined
      }
      
      // Empty and footer components
      ListEmptyComponent={ListEmptyComponent || defaultEmptyComponent}
      ListFooterComponent={ListFooterComponent || defaultFooterComponent}
      
      // Scroll optimizations
      showsVerticalScrollIndicator={false}
      bounces={true}
      scrollEventThrottle={16}
    />
  );
};

export default VirtualizedProductGrid;
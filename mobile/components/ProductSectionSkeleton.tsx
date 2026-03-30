import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { SectionHeaderSkeleton } from './SectionHeaderSkeleton';
import { spacing } from '../theme/spacing';

interface ProductSectionSkeletonProps {
  variant?: 'grid' | 'list' | 'horizontal';
  itemCount?: number;
  showHeader?: boolean;
}

export const ProductSectionSkeleton: React.FC<ProductSectionSkeletonProps> = ({
  variant = 'horizontal',
  itemCount = 4,
  showHeader = true
}) => {
  const styles = StyleSheet.create({
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
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: spacing.base,
      justifyContent: 'space-between',
    },
    gridItem: {
      width: '48%',
      marginBottom: spacing.sm,
    },
    listContainer: {
      paddingHorizontal: spacing.base,
      gap: spacing.sm,
    },
  });

  const renderSkeletons = () => {
    const skeletons = Array.from({ length: itemCount }, (_, index) => (
      <View key={index} style={variant === 'horizontal' ? styles.productCardWrapper : variant === 'grid' ? styles.gridItem : undefined}>
        <ProductCardSkeleton variant={variant === 'horizontal' ? 'grid' : variant} />
      </View>
    ));

    if (variant === 'horizontal') {
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {skeletons}
        </ScrollView>
      );
    }

    if (variant === 'grid') {
      return (
        <View style={styles.gridContainer}>
          {skeletons}
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        {skeletons}
      </View>
    );
  };

  return (
    <View style={styles.section}>
      {showHeader && <SectionHeaderSkeleton />}
      {renderSkeletons()}
    </View>
  );
};
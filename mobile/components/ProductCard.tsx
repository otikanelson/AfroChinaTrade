import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Product } from '../types/product';
import { theme } from '../theme';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  badge?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, badge }) => {
  const formatPrice = (price: number) => {
    return `${product.currency} ${price.toLocaleString()}`;
  };

  const imageHeight = product.imageHeight || 160;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.imageContainer, { height: imageHeight }]}>
        <Image
          source={{ uri: product.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.stats}>
          {product.reviewCount}+ {product.reviewCount > 1000 ? 'Heats' : 'Views'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  imageContainer: {
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    left: 0,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderTopRightRadius: theme.borderRadius.base,
    borderBottomRightRadius: theme.borderRadius.base,
  },
  badgeText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.semibold,
  },
  content: {
    padding: theme.spacing.md,
  },
  price: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  name: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    lineHeight: theme.lineHeights.normal * theme.fontSizes.sm,
  },
  stats: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textLight,
  },
});

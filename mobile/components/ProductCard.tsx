import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types/product';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useAlertContext } from '../contexts/AlertContext';
import { tokenManager } from '../services/api/tokenManager';
import { colors } from '../theme/colors';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { typography, fontSizes, fontWeights } from '../theme/typography';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  badge?: string;
  showAddButton?: boolean; // New prop to control add button visibility
  variant?: 'grid' | 'list'; // New prop to control layout variant
  showViewCount?: boolean; // New prop to show view count
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onPress, 
  badge, 
  showAddButton = false, 
  variant = 'grid',
  showViewCount = true
}) => {
  const { addToCart, isOperationPending } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const alert = useAlertContext();

  const isAdmin = user?.role === 'admin';
  const getProductId = () => (product as any)._id || product.id;
  const inWishlist = isInWishlist(getProductId());
  const addingToCart = isOperationPending(getProductId());

  const formatPrice = (price: number) => {
    try {
      const safePrice = Number(price) || 0;
      const formattedPrice = safePrice.toLocaleString();
      return `₦${formattedPrice}`;
    } catch (error) {
      return `₦${Number(price) || 0}`;
    }
  };

  const formatViewCount = (count: number): string => {
    const safeCount = Number(count) || 0;
    if (safeCount < 1000) return safeCount.toString();
    if (safeCount < 1000000) return `${(safeCount / 1000).toFixed(1)}K`;
    return `${(safeCount / 1000000).toFixed(1)}M`;
  };

  const getDiscountedPrice = () => {
    if (product.discount && product.discount > 0) {
      const discountAmount = (product.price * product.discount) / 100;
      return product.price - discountAmount;
    }
    return product.price;
  };

  const getSupplier = () => {
    // Handle both populated supplierId and direct supplier field
    if (product.supplier) return product.supplier;
    if (product.supplierId && typeof product.supplierId === 'object') return product.supplierId;
    return null;
  };

  const supplier = getSupplier();
  const hasDiscount = product.discount && product.discount > 0;

  const handleAddToCart = async (e: any) => {
    e.stopPropagation();
    
    if (isAdmin) {
      alert.showWarning('Admin Mode', 'Admins cannot add items to cart. This is for viewing purposes only.');
      return;
    }
    
    if (product.stock === 0) {
      alert.showWarning('Out of Stock', 'This product is currently out of stock');
      return;
    }

    // Handle both _id and id fields from backend
    const productId = (product as any)._id || product.id;
    const success = await addToCart(productId, 1);
    
    if (success) {
      alert.showSuccess('Added to Cart', `${product.name} has been added to your cart`);
    } else {
      alert.showError('Failed', 'Failed to add product to cart');
    }
  };

  const handleToggleWishlist = async (e: any) => {
    e.stopPropagation();
    
    if (isAdmin) {
      alert.showWarning('Admin Mode', 'Admins cannot manage wishlists. This is for viewing purposes only.');
      return;
    }
    
    setTogglingWishlist(true);
    
    // Handle both _id and id fields from backend
    const productId = (product as any)._id || product.id;
    let success;
    
    if (inWishlist) {
      success = await removeFromWishlist(productId);
      if (success) {
        alert.showSuccess('Removed', 'Removed from wishlist');
      } else {
        alert.showError('Failed', 'Failed to remove from wishlist');
      }
    } else {
      success = await addToWishlist(productId);
      if (success) {
        alert.showSuccess('Added', 'Added to wishlist');
      } else {
        alert.showError('Failed', 'Failed to add to wishlist');
      }
    }
    
    setTogglingWishlist(false);
  };

  // List variant layout
  if (variant === 'list') {
    return (
      <>
        <TouchableOpacity 
          style={[styles.listContainer, { backgroundColor: colors.background, borderRadius: borderRadius.md, ...shadows.sm }]} 
          onPress={onPress} 
          activeOpacity={0.85}
        >
        {/* Image */}
        <View style={styles.listImageContainer}>
          {product.images && product.images.length > 0 ? (
            <Image
              source={{ uri: product.images[0] }}
              style={styles.listImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.listImage, styles.placeholderImage, { backgroundColor: colors.surface }]}>
              <Text style={[styles.placeholderText, { fontSize: fontSizes.xs, color: colors.textLight }]}>No Image</Text>
            </View>
          )}
          
          {/* Wishlist Button */}
          <TouchableOpacity
            style={[styles.listWishlistButton, { backgroundColor: 'rgba(255, 255, 255, 0.9)', ...shadows.sm }]}
            onPress={handleToggleWishlist}
            disabled={togglingWishlist}
          >
            <Ionicons
              name={inWishlist ? 'heart' : 'heart-outline'}
              size={16}
              color={inWishlist ? colors.error : colors.textSecondary}
            />
          </TouchableOpacity>

          {hasDiscount && (
            <View style={[styles.listDiscountBadge, { backgroundColor: colors.error, paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: borderRadius.sm }]}>
              <Text style={[styles.discountText, { color: colors.textInverse, fontSize: fontSizes.xs, fontWeight: fontWeights.semibold }]}>{String(product.discount || 0)}% OFF</Text>
            </View>
          )}

          {product.stock === 0 && (
            <View style={[styles.listOutOfStockBadge, { backgroundColor: 'rgba(220, 53, 69, 0.9)', paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: borderRadius.sm }]}>
              <Text style={[styles.outOfStockText, { color: colors.textInverse, fontSize: fontSizes.xs, fontWeight: fontWeights.semibold }]}>Out of Stock</Text>
            </View>
          )}

          {/* View Count Badge */}
          {showViewCount && (
            <View style={[styles.listViewCountBadge, { backgroundColor: 'rgba(0, 0, 0, 0.7)', paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: borderRadius.sm }]}>
              <View style={styles.viewCountContent}>
                <Ionicons name="eye" size={10} color={colors.textInverse} style={styles.viewCountIcon} />
                <Text style={[styles.viewCountText, { color: colors.textInverse, fontSize: fontSizes.xs, fontWeight: fontWeights.medium, marginLeft: 2 }]}>
                  {formatViewCount(product.viewCount || 0)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={[styles.listContent, { padding: spacing.sm, flex: 1 }]}>
          {/* Name */}
          <Text style={[styles.listName, { ...typography.body, fontSize: fontSizes.sm, color: colors.text, lineHeight: 18 }]} numberOfLines={2}>
            {String(product.name || 'Unnamed Product')}
          </Text>

          {/* Supplier */}
          {supplier && supplier.name && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs }}>
              {supplier.verified && <Ionicons name='shield-checkmark-outline' size={12} color={colors.primary} style={{ marginRight: 4 }} />}
              <Text style={[styles.listSupplier, { fontSize: fontSizes.xs, color: colors.primary }]} numberOfLines={1}>
                {String(supplier.name || '')}
              </Text>
            </View>
          )}

          {/* Price and Stats Row */}
          <View style={[styles.listPriceRow, { marginTop: spacing.xs }]}>
            <View style={styles.listPriceContainer}>
              {hasDiscount ? (
                <>
                  <Text style={[styles.originalPrice, { fontSize: fontSizes.xs, color: colors.textSecondary, textDecorationLine: 'line-through' }]} numberOfLines={1}>
                    {formatPrice(product.price || 0)}
                  </Text>
                  <Text style={[styles.discountedPrice, { fontSize: fontSizes.base, fontWeight: fontWeights.bold, color: colors.error }]} numberOfLines={1}>
                    {formatPrice(getDiscountedPrice())}
                  </Text>
                </>
              ) : (
                <Text style={[styles.listPrice, { fontSize: fontSizes.sm, fontWeight: fontWeights.bold, color: colors.text }]} numberOfLines={1}>
                  {formatPrice(product.price || 0)}
                </Text>
              )}
            </View>
            
            {/* Stats and Add Button */}
            <View style={styles.listActionsContainer}>
              {product.reviewCount && product.reviewCount > 0 && (
                <Text style={[styles.listStats, { fontSize: fontSizes.xs, color: colors.textSecondary }]}>
                  {product.reviewCount > 999
                    ? `${(product.reviewCount / 1000).toFixed(1)}k+`
                    : `${product.reviewCount}+`}
                </Text>
              )}
              {showAddButton && (
                <TouchableOpacity
                  style={[
                    styles.listAddButton,
                    { 
                      backgroundColor: colors.surface, 
                      borderColor: colors.primary, 
                      borderRadius: borderRadius.full,
                      borderWidth: 1,
                      width: 24,
                      height: 24,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: spacing.xs
                    },
                    (product.stock === 0 || addingToCart) && { backgroundColor: colors.surface, borderColor: colors.border }
                  ]}
                  onPress={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                >
                  <Ionicons
                    name={addingToCart ? 'hourglass-outline' : 'add'}
                    size={12}
                    color={product.stock === 0 ? colors.textLight : colors.primary}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
      </>
    );
  }

  return (
    <>
    <TouchableOpacity style={[styles.container, { backgroundColor: colors.background, borderRadius: borderRadius.md, ...shadows.sm }]} onPress={onPress} activeOpacity={0.85}>
      {/* Image */}
      <View style={styles.imageContainer}>
        {product.images && product.images.length > 0 ? (
          <Image
            source={{ uri: product.images[0] }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage, { backgroundColor: colors.surface }]}>
            <Text style={[styles.placeholderText, { fontSize: fontSizes.sm, color: colors.textLight }]}>No Image</Text>
          </View>
        )}
        
        {/* Wishlist Button */}
        <TouchableOpacity
          style={[styles.wishlistButton, { backgroundColor: 'rgba(255, 255, 255, 0.9)', ...shadows.sm }]}
          onPress={handleToggleWishlist}
          disabled={togglingWishlist}
        >
          <Ionicons
            name={inWishlist ? 'heart' : 'heart-outline'}
            size={20}
            color={inWishlist ? colors.error : colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Custom Badge (like "Seller Pick") - positioned on the left */}
        {badge && (
          <View style={[styles.badge, { backgroundColor: colors.primary, paddingHorizontal: 4, paddingVertical: 2, borderTopRightRadius: borderRadius.sm, borderBottomRightRadius: borderRadius.sm }]}>
            <Text style={[styles.badgeText, { color: colors.textInverse, fontSize: 10, fontWeight: fontWeights.semibold }]}>{String(badge)}</Text>
          </View>
        )}

        {/* Discount Badge - always positioned at top-left */}
        {hasDiscount && (
          <View style={[styles.discountBadge, { backgroundColor: colors.error, paddingHorizontal: 4, paddingVertical: 2, borderRadius: borderRadius.sm }]}>
            <Text style={[styles.discountText, { color: colors.textInverse, fontSize: 10, fontWeight: fontWeights.semibold }]}>{String(product.discount || 0)}% OFF</Text>
          </View>
        )}

        {product.stock === 0 && (
          <View style={[styles.outOfStockBadge, { backgroundColor: 'rgba(220, 53, 69, 0.9)', paddingHorizontal: 4, paddingVertical: 2, borderRadius: borderRadius.sm }]}>
            <Text style={[styles.outOfStockText, { color: colors.textInverse, fontSize: 10, fontWeight: fontWeights.semibold }]}>Out of Stock</Text>
          </View>
        )}

        {/* View Count Badge */}
        {showViewCount && (
          <View style={[styles.viewCountBadge, { backgroundColor: 'rgba(0, 0, 0, 0.7)', paddingHorizontal: 4, paddingVertical: 2, borderRadius: borderRadius.sm }]}>
            <View style={styles.viewCountContent}>
              <Ionicons name="eye" size={10} color={colors.textInverse} style={styles.viewCountIcon} />
              <Text style={[styles.viewCountText, { color: colors.textInverse, fontSize: 10, fontWeight: fontWeights.medium, marginLeft: 2 }]}>
                {formatViewCount(product.viewCount || 0)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={[styles.content, { paddingHorizontal: spacing.xs, paddingVertical: spacing.xs, gap: spacing.xs }]}>
        {/* Name — fixed 2-line height so price always aligns */}
        <Text style={[styles.name, { ...typography.body, fontSize: fontSizes.xs, color: colors.text, lineHeight: 18 }]} numberOfLines={2}>
          {String(product.name || 'Unnamed Product')}
        </Text>

        {/* Price and Add to Cart */}
        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            {hasDiscount ? (
              <>
                <Text style={[styles.originalPrice, { fontSize: fontSizes.xs, color: colors.textSecondary, textDecorationLine: 'line-through' }]} numberOfLines={1}>
                  {formatPrice(product.price || 0)}
                </Text>
                <Text style={[styles.discountedPrice, { fontSize: fontSizes.sm, fontWeight: fontWeights.bold, color: colors.error }]} numberOfLines={1}>
                  {formatPrice(getDiscountedPrice())}
                </Text>
              </>
            ) : (
              <Text style={[styles.price, { fontSize: fontSizes.md, fontWeight: fontWeights.bold, color: colors.text }]} numberOfLines={1}>
                {formatPrice(product.price || 0)}
              </Text>
            )}
          </View>
          {showAddButton && (
            <TouchableOpacity
              style={[
                styles.addButton,
                { 
                  backgroundColor: colors.surface, 
                  borderColor: colors.primary, 
                  borderRadius: borderRadius.full,
                  borderWidth: 1,
                  width: 28,
                  height: 28,
                  justifyContent: 'center',
                  alignItems: 'center'
                },
                (product.stock === 0 || addingToCart) && { backgroundColor: colors.surface, borderColor: colors.border }
              ]}
              onPress={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
            >
              <Ionicons
                name={addingToCart ? 'hourglass-outline' : 'add'}
                size={16}
                color={product.stock === 0 ? colors.textLight : colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Supplier / stats row */}
        <View style={[styles.footer, { marginTop: spacing.xs }]}>
          {supplier && supplier.name && (
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              {supplier.verified && <Ionicons name='shield-checkmark-outline' size={10} color={colors.primary} style={{ marginRight: 2 }} />}
              <Text style={[styles.supplier, { fontSize: 10, color: colors.primary }]} numberOfLines={1}>
                {String(supplier.name || '')}
              </Text>
            </View>
          )}
          {product.reviewCount && product.reviewCount > 0 && (
            <Text style={[styles.stats, { fontSize: 10, color: colors.textSecondary, marginLeft: spacing.xs }]}>
              {product.reviewCount > 999
                ? `${(product.reviewCount / 1000).toFixed(1)}k+`
                : `${product.reviewCount}+`}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    marginBottom: 5,
  },
  // List variant styles
  listContainer: {
    width: '100%',
    flexDirection: 'row',
    overflow: 'hidden',
    minHeight: 120,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  listImageContainer: {
    width: 100,
    height: 100,
    position: 'relative',
    alignSelf: 'center',
  },
  listWishlistButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listDiscountBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
  },
  listOutOfStockBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
  },
  listContent: {
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  listName: {
    // Styles applied inline
  },
  listSupplier: {
    // Styles applied inline
  },
  listPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  listPriceContainer: {
    flex: 1,
  },
  listPrice: {
    // Styles applied inline
  },
  listActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listStats: {
    // Styles applied inline
  },
  listAddButton: {
    // Styles applied inline
  },
  // Grid variant styles (existing)
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  wishlistButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 30,
    height: 30,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    // Styles applied inline
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
  },
  discountText: {
    // Styles applied inline
  },
  outOfStockBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
  },
  outOfStockText: {
    // Styles applied inline
  },
  viewCountBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
  },
  listViewCountBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
  },
  viewCountContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCountIcon: {
    opacity: 0.8,
  },
  viewCountText: {
    // Styles applied inline
  },
  content: {
    // Styles applied inline
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 4,
  },
  name: {
    // Styles applied inline
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    // Styles applied inline
  },
  originalPrice: {
    // Styles applied inline
  },
  discountedPrice: {
    // Styles applied inline
  },
  addButton: {
    // Styles applied inline
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  supplier: {
    flex: 1,
  },
  stats: {
    // Styles applied inline
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    // Styles applied inline
  },
  listImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
});

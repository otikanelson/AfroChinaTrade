import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types/product';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useAlertContext } from '../contexts/AlertContext';
import { colors } from '../theme/colors';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { typography, fontSizes, fontWeights } from '../theme/typography';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  badge?: string;
  showAddButton?: boolean;
  variant?: 'grid' | 'list';
  showViewCount?: boolean;
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

  // Safe data extraction
  const isAdmin = user?.role === 'admin';
  const productId = (product as any)._id || product.id || '';
  const productName = product.name || 'Unnamed Product';
  const productPrice = product.price || 0;
  const productStock = product.stock || 0;
  const productDiscount = product.discount || 0;
  const productViewCount = product.viewCount || 0;
  const productReviewCount = product.reviewCount || 0;
  const productImages = product.images || [];
  
  const inWishlist = isInWishlist(productId);
  const addingToCart = isOperationPending(productId);
  const hasDiscount = productDiscount > 0;
  const isOutOfStock = productStock === 0;

  // Safe formatting functions
  const formatPrice = (price: number): string => {
    const safePrice = Number(price) || 0;
    return `₦${safePrice.toLocaleString()}`;
  };

  const formatViewCount = (count: number): string => {
    const safeCount = Number(count) || 0;
    if (safeCount < 1000) return String(safeCount);
    if (safeCount < 1000000) return `${(safeCount / 1000).toFixed(1)}K`;
    return `${(safeCount / 1000000).toFixed(1)}M`;
  };

  const getDiscountedPrice = (): number => {
    if (hasDiscount) {
      const discountAmount = (productPrice * productDiscount) / 100;
      return productPrice - discountAmount;
    }
    return productPrice;
  };

  const getSupplier = () => {
    if (product.supplier) return product.supplier;
    if (product.supplierId && typeof product.supplierId === 'object') return product.supplierId;
    return null;
  };

  const supplier = getSupplier();

  const handleAddToCart = async (e: any) => {
    e.stopPropagation();
    
    if (isAdmin) {
      alert.showWarning('Admin Mode', 'Admins cannot add items to cart. This is for viewing purposes only.');
      return;
    }
    
    if (isOutOfStock) {
      alert.showWarning('Out of Stock', 'This product is currently out of stock');
      return;
    }

    const success = await addToCart(productId, 1);
    
    if (success) {
      alert.showSuccess('Added to Cart', `${productName} has been added to your cart`);
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

  // List variant
  if (variant === 'list') {
    return (
      <TouchableOpacity 
        style={[
          styles.listContainer, 
          { 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.md, 
            ...shadows.sm 
          }
        ]} 
        onPress={onPress} 
        activeOpacity={0.85}
      >
        {/* Image Section */}
        <View style={styles.listImageContainer}>
          {productImages.length > 0 ? (
            <Image
              source={{ uri: productImages[0] }}
              style={styles.listImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.listImage, styles.placeholderImage, { backgroundColor: colors.surface }]}>
              <Text style={[styles.placeholderText, { fontSize: fontSizes.xs, color: colors.textLight }]}>
                No Image
              </Text>
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

          {/* Discount Badge */}
          {hasDiscount && (
            <View style={[styles.listDiscountBadge, { backgroundColor: colors.error, paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: borderRadius.sm }]}>
              <Text style={[styles.discountText, { color: colors.textInverse, fontSize: fontSizes.xs, fontWeight: fontWeights.semibold }]}>
                {String(productDiscount)}% OFF
              </Text>
            </View>
          )}

          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <View style={[styles.listOutOfStockBadge, { backgroundColor: 'rgba(220, 53, 69, 0.9)', paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: borderRadius.sm }]}>
              <Text style={[styles.outOfStockText, { color: colors.textInverse, fontSize: fontSizes.xs, fontWeight: fontWeights.semibold }]}>
                Out of Stock
              </Text>
            </View>
          )}

          {/* View Count Badge */}
          {showViewCount && (
            <View style={[styles.listViewCountBadge, { backgroundColor: 'rgba(0, 0, 0, 0.7)', paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: borderRadius.sm }]}>
              <View style={styles.viewCountContent}>
                <Ionicons name="eye" size={10} color={colors.textInverse} style={styles.viewCountIcon} />
                <Text style={[styles.viewCountText, { color: colors.textInverse, fontSize: fontSizes.xs, fontWeight: fontWeights.medium, marginLeft: 2 }]}>
                  {formatViewCount(productViewCount)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={[styles.listContent, { padding: spacing.sm, flex: 1 }]}>
          {/* Product Name */}
          <Text 
            style={[
              styles.listName, 
              { 
                ...typography.body, 
                fontSize: fontSizes.sm, 
                color: colors.text, 
                lineHeight: 18 
              }
            ]} 
            numberOfLines={2}
          >
            {String(productName)}
          </Text>

          {/* Supplier Info */}
          {supplier && supplier.name && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs }}>
              {supplier.verified && (
                <Ionicons name='shield-checkmark-outline' size={12} color={colors.primary} style={{ marginRight: 4 }} />
              )}
              {supplier.logo && (
                <Image 
                  source={{ uri: supplier.logo }} 
                  style={{ width: 14, height: 14, borderRadius: 7, marginRight: 4 }} 
                  resizeMode="cover"
                />
              )}
              <Text style={[styles.listSupplier, { fontSize: fontSizes.xs, color: colors.primary }]} numberOfLines={1}>
                {String(supplier.name)}
              </Text>
            </View>
          )}

          {/* Price and Actions Row */}
          <View style={[styles.listPriceRow, { marginTop: spacing.xs }]}>
            <View style={styles.listPriceContainer}>
              {hasDiscount ? (
                <>
                  <Text style={[styles.originalPrice, { fontSize: fontSizes.xs, color: colors.textSecondary, textDecorationLine: 'line-through' }]} numberOfLines={1}>
                    {formatPrice(productPrice)}
                  </Text>
                  <Text style={[styles.discountedPrice, { fontSize: fontSizes.base, fontWeight: fontWeights.bold, color: colors.error }]} numberOfLines={1}>
                    {formatPrice(getDiscountedPrice())}
                  </Text>
                </>
              ) : (
                <Text style={[styles.listPrice, { fontSize: fontSizes.sm, fontWeight: fontWeights.bold, color: colors.text }]} numberOfLines={1}>
                  {formatPrice(productPrice)}
                </Text>
              )}
            </View>
            
            {/* Stats and Add Button */}
            <View style={styles.listActionsContainer}>
              {productReviewCount > 0 && (
                <Text style={[styles.listStats, { fontSize: fontSizes.xs, color: colors.textSecondary }]}>
                  {productReviewCount > 999 ? `${(productReviewCount / 1000).toFixed(1)}k+` : `${productReviewCount}+`}
                </Text>
              )}
              {showAddButton && (
                <TouchableOpacity
                  style={[
                    styles.listAddButton,
                    { 
                      backgroundColor: colors.surface, 
                      borderColor: isOutOfStock ? colors.border : colors.primary, 
                      borderRadius: borderRadius.full,
                      borderWidth: 1,
                      width: 24,
                      height: 24,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: spacing.xs
                    }
                  ]}
                  onPress={handleAddToCart}
                  disabled={isOutOfStock || addingToCart}
                >
                  <Ionicons
                    name={addingToCart ? 'hourglass-outline' : 'add'}
                    size={12}
                    color={isOutOfStock ? colors.textLight : colors.primary}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Grid variant (default)
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.background, 
          borderRadius: borderRadius.md, 
          ...shadows.sm 
        }
      ]} 
      onPress={onPress} 
      activeOpacity={0.85}
    >
      {/* Image Section */}
      <View style={styles.imageContainer}>
        {productImages.length > 0 ? (
          <Image
            source={{ uri: productImages[0] }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage, { backgroundColor: colors.surface }]}>
            <Text style={[styles.placeholderText, { fontSize: fontSizes.sm, color: colors.textLight }]}>
              No Image
            </Text>
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

        {/* Custom Badge */}
        {badge && typeof badge === 'string' && badge.trim() && (
          <View style={[
            styles.badge, 
            { 
              backgroundColor: colors.primary, 
              paddingHorizontal: 4, 
              paddingVertical: 2, 
              borderTopRightRadius: borderRadius.sm, 
              borderBottomRightRadius: borderRadius.sm 
            }
          ]}>
            <Text style={[
              styles.badgeText, 
              { 
                color: colors.textInverse, 
                fontSize: 10, 
                fontWeight: fontWeights.semibold 
              }
            ]}>
              {String(badge)}
            </Text>
          </View>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <View style={[styles.discountBadge, { backgroundColor: colors.error, paddingHorizontal: 4, paddingVertical: 2, borderRadius: borderRadius.sm }]}>
            <Text style={[styles.discountText, { color: colors.textInverse, fontSize: 10, fontWeight: fontWeights.semibold }]}>
              {String(productDiscount)}% OFF
            </Text>
          </View>
        )}

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <View style={[styles.outOfStockBadge, { backgroundColor: 'rgba(220, 53, 69, 0.9)', paddingHorizontal: 4, paddingVertical: 2, borderRadius: borderRadius.sm }]}>
            <Text style={[styles.outOfStockText, { color: colors.textInverse, fontSize: 10, fontWeight: fontWeights.semibold }]}>
              Out of Stock
            </Text>
          </View>
        )}

        {/* View Count Badge */}
        {showViewCount && (
          <View style={[styles.viewCountBadge, { backgroundColor: 'rgba(0, 0, 0, 0.7)', paddingHorizontal: 4, paddingVertical: 2, borderRadius: borderRadius.sm }]}>
            <View style={styles.viewCountContent}>
              <Ionicons name="eye" size={10} color={colors.textInverse} style={styles.viewCountIcon} />
              <Text style={[styles.viewCountText, { color: colors.textInverse, fontSize: 10, fontWeight: fontWeights.medium, marginLeft: 2 }]}>
                {formatViewCount(productViewCount)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={[styles.content, { paddingHorizontal: spacing.xs, paddingVertical: spacing.xs, gap: spacing.xs }]}>
        {/* Product Name */}
        <Text 
          style={[
            styles.name, 
            { 
              ...typography.body, 
              fontSize: fontSizes.xs, 
              color: colors.text, 
              lineHeight: 18 
            }
          ]} 
          numberOfLines={2}
        >
          {String(productName)}
        </Text>

        {/* Price and Add Button Row */}
        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            {hasDiscount ? (
              <>
                <Text style={[styles.originalPrice, { fontSize: fontSizes.xs, color: colors.textSecondary, textDecorationLine: 'line-through' }]} numberOfLines={1}>
                  {formatPrice(productPrice)}
                </Text>
                <Text style={[styles.discountedPrice, { fontSize: fontSizes.md, fontWeight: fontWeights.bold, color: colors.error }]} numberOfLines={1}>
                  {formatPrice(getDiscountedPrice())}
                </Text>
              </>
            ) : (
              <Text style={[styles.price, { fontSize: fontSizes.md, fontWeight: fontWeights.bold, color: colors.text }]} numberOfLines={1}>
                {formatPrice(productPrice)}
              </Text>
            )}
          </View>
          {showAddButton && (
            <TouchableOpacity
              style={[
                styles.addButton,
                { 
                  backgroundColor: colors.surface, 
                  borderColor: isOutOfStock ? colors.border : colors.primary, 
                  borderRadius: borderRadius.full,
                  borderWidth: 1,
                  width: 28,
                  height: 28,
                  justifyContent: 'center',
                  alignItems: 'center'
                }
              ]}
              onPress={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
            >
              <Ionicons
                name={addingToCart ? 'hourglass-outline' : 'add'}
                size={16}
                color={isOutOfStock ? colors.textLight : colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Supplier and Stats Row */}
        <View style={[styles.footer, { marginTop: spacing.xs }]}>
          {supplier && supplier.name && (
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              {supplier.verified && (
                <Ionicons name='shield-checkmark-outline' size={10} color={colors.primary} style={{ marginRight: 2 }} />
              )}
              {supplier.logo && (
                <Image 
                  source={{ uri: supplier.logo }} 
                  style={{ width: 12, height: 12, borderRadius: 6, marginRight: 2 }} 
                  resizeMode="cover"
                />
              )}
              <Text style={[styles.supplier, { fontSize: 10, color: colors.primary }]} numberOfLines={1}>
                {String(supplier.name)}
              </Text>
            </View>
          )}
          {productReviewCount > 0 && (
            <Text style={[styles.stats, { fontSize: 10, color: colors.textSecondary, marginLeft: spacing.xs }]}>
              {productReviewCount > 999 ? `${(productReviewCount / 1000).toFixed(1)}k+` : `${productReviewCount}+`}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 200,
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
  listImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
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
  listViewCountBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
  },
  listContent: {
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  listName: {},
  listSupplier: {},
  listPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  listPriceContainer: {
    flex: 1,
  },
  listPrice: {},
  listActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listStats: {},
  listAddButton: {},
  // Grid variant styles
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
  badgeText: {},
  discountBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
  },
  discountText: {},
  outOfStockBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
  },
  outOfStockText: {},
  viewCountBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
  },
  viewCountContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCountIcon: {
    opacity: 0.8,
  },
  viewCountText: {},
  content: {},
  name: {},
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  price: {},
  originalPrice: {},
  discountedPrice: {},
  addButton: {},
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  supplier: {
    flex: 1,
  },
  stats: {},
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {},
});
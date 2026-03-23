import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Product } from '../../types/product';
import { productService } from '../../services/ProductService';
import { messageService } from '../../services/MessageService';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { useModal } from '../../hooks/useModal';
import { Header } from '../../components/Header';
import { ViewTracker } from '../../components/ViewTracker';
import { ChatOptionsModal } from '../../components/ChatOptionsModal';
import { Toast } from '../../components/ui/Toast';
import { tokenManager } from '../../services/api/tokenManager';
import { spacing } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();
  const router = useRouter();
  const { colors: themeColors, spacing: themeSpacing, fontSizes, fontWeights, borderRadius, shadows } = useTheme();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart, isOperationPending } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const toast = useToast();
  const chatModal = useModal();

  const isAdmin = user?.role === 'admin';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: themeColors.background,
    },
    scrollView: {
      flex: 1,
    },
    imageContainer: {
      height: screenWidth * 1.1,
      backgroundColor: themeColors.surface,
      position: 'relative',
    },
    productImage: {
      width: '100%',
      height: '100%',
    },
    imageNavigation: {
      position: 'absolute',
      bottom: themeSpacing.lg,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: themeSpacing.xs,
    },
    imageDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.6)',
    },
    activeDot: {
      backgroundColor: 'white',
      width: 24,
      borderRadius: 5,
    },
    contentContainer: {
      padding: spacing.base,
    },
    productName: {
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.bold,
      color: themeColors.text,
      marginBottom: themeSpacing.sm,
      lineHeight: 32,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: themeSpacing.base,
      flexWrap: 'wrap',
    },
    price: {
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.bold,
      color: themeColors.primary,
    },
    originalPrice: {
      fontSize: fontSizes.lg,
      color: themeColors.textSecondary,
      textDecorationLine: 'line-through',
      marginRight: themeSpacing.sm,
    },
    discountBadge: {
      backgroundColor: themeColors.error,
      paddingHorizontal: themeSpacing.base,
      paddingVertical: themeSpacing.xs,
      borderRadius: borderRadius.full,
      marginLeft: themeSpacing.sm,
    },
    discountText: {
      color: themeColors.textInverse,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.bold,
    },
    supplierContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: themeSpacing.base,
      padding: themeSpacing.sm,
      backgroundColor: themeColors.surface,
      borderRadius: borderRadius.base,
    },
    supplierInfo: {
      flex: 1,
    },
    supplierName: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: themeColors.text,
      marginBottom: 4,
    },
    supplierLocation: {
      fontSize: fontSizes.sm,
      color: themeColors.textSecondary,
      marginTop: 2,
    },
    section: {
      marginBottom: themeSpacing.base,
      backgroundColor: themeColors.surface,
      borderRadius: borderRadius.lg,
      padding: themeSpacing.base,
      ...shadows.sm,
    },
    sectionTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: themeColors.text,
      marginBottom: themeSpacing.sm,
    },
    description: {
      fontSize: fontSizes.base,
      color: themeColors.textSecondary,
      lineHeight: 24,
    },
    specRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: themeSpacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderLight,
    },
    specLabel: {
      fontSize: fontSizes.base,
      color: themeColors.textSecondary,
      flex: 1,
    },
    specValue: {
      fontSize: fontSizes.base,
      color: themeColors.text,
      fontWeight: fontWeights.semibold,
      flex: 1,
      textAlign: 'right',
    },
    stockInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: themeSpacing.base,
    },
    stockText: {
      fontSize: fontSizes.base,
      color: themeColors.textSecondary,
      marginRight: themeSpacing.sm,
    },
    stockCount: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
      color: themeColors.success,
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: themeColors.surface,
      borderRadius: borderRadius.lg,
      paddingHorizontal: themeSpacing['2xl'],
      paddingVertical: themeSpacing.sm,
      alignSelf: 'flex-start',
      ...shadows.sm,
    },
    quantityLabel: {
      fontSize: fontSizes.sm,
      color: themeColors.text,
      fontWeight: fontWeights.semibold,
      marginRight: themeSpacing.sm,
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: themeSpacing.xs,
    },
    quantityButton: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: themeColors.background,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    quantityButtonText: {
      fontSize: fontSizes.lg,
      color: themeColors.text,
    },
    quantityInput: {
      width: 60,
      height: 40,
      textAlign: 'center',
      fontSize: fontSizes.base,
      color: themeColors.text,
      backgroundColor: themeColors.background,
    },
    bottomContainer: {
      flexDirection: 'row',
      padding: themeSpacing.base,
      backgroundColor: themeColors.background,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
      gap: themeSpacing.sm,
      ...shadows.md,
    },
    addToCartButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: themeSpacing.xs,
      backgroundColor: themeColors.background,
      borderRadius: borderRadius.lg,
      borderWidth: 2,
      borderColor: themeColors.primary,
      gap: themeSpacing.xs,
      ...shadows.sm,
    },
    addToCartText: {
      fontSize: fontSizes.sm,
      color: themeColors.primary,
      fontWeight: fontWeights.bold,
    },
    buyNowButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: themeSpacing.xs,
      backgroundColor: themeColors.primary,
      borderRadius: borderRadius.lg,
      ...shadows.md,
    },
    buyNowText: {
      fontSize: fontSizes.sm,
      color: themeColors.textInverse,
      fontWeight: fontWeights.bold,
    },
    loadingText: {
      marginTop: themeSpacing.sm,
      fontSize: fontSizes.base,
      color: themeColors.textSecondary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: themeSpacing.xl,
    },
    errorText: {
      fontSize: fontSizes.base,
      color: themeColors.error,
      textAlign: 'center',
    },
    imageIndicator: {
      position: 'absolute',
      top: themeSpacing.base,
      right: themeSpacing.base,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: themeSpacing.base,
      paddingVertical: themeSpacing.xs,
      borderRadius: borderRadius.full,
      ...shadows.md,
    },
    imageIndicatorText: {
      color: 'white',
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
    },
    placeholderImage: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: themeColors.surface,
    },
    placeholderText: {
      fontSize: fontSizes.base,
      color: themeColors.textSecondary,
      marginTop: themeSpacing.sm,
    },
    productInfo: {
      padding: themeSpacing.lg,
    },
    discountedPrice: {
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.bold,
      color: themeColors.error,
    },
    discountBadgeText: {
      color: themeColors.textInverse,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.bold,
    },
    productPrice: {
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.bold,
      color: themeColors.primary,
    },
    metaInfo: {
      flexDirection: 'row',
      marginTop: themeSpacing.base,
      marginBottom: themeSpacing.lg,
      gap: themeSpacing.lg,
      flexWrap: 'wrap',
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.surface,
      paddingHorizontal: themeSpacing.base,
      paddingVertical: themeSpacing.sm,
      borderRadius: borderRadius.full,
      gap: themeSpacing.xs,
    },
    metaText: {
      fontSize: fontSizes.sm,
      color: themeColors.text,
      fontWeight: fontWeights.medium,
    },
    supplierDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: themeSpacing.base,
    },
    supplierMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: themeSpacing.xs,
    },
    supplierRating: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.background,
      paddingHorizontal: themeSpacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.full,
      gap: 4,
    },
    specKey: {
      fontSize: fontSizes.base,
      color: themeColors.textSecondary,
      flex: 1,
    },
    bottomActions: {
      flexDirection: 'column',
      padding: themeSpacing.base,
      paddingBottom: themeSpacing.lg,
      backgroundColor: themeColors.background,
      borderTopWidth: 1,
      borderTopColor: themeColors.borderLight,
      gap: themeSpacing.base,
      ...shadows.lg,
    },
    quantityText: {
      fontSize: fontSizes.lg,
      color: themeColors.text,
      fontWeight: fontWeights.bold,
      minWidth: 40,
      textAlign: 'center',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: themeSpacing.sm,
    },
    chatButton: {
      width: 52,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: themeColors.background,
      borderRadius: borderRadius.lg,
      borderWidth: 2,
      borderColor: themeColors.primary,
      ...shadows.sm,
    },
    adminModeIndicator: {
      backgroundColor: themeColors.surface,
      padding: themeSpacing.base,
      borderRadius: borderRadius.lg,
      flex: 1,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    adminModeText: {
      color: themeColors.textSecondary,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
    },
    wishlistButton: {
      position: 'absolute',
      top: themeSpacing.base,
      left: themeSpacing.base,
      width: 44,
      height: 44,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      ...shadows.md,
    },
    ratingText: {
      fontSize: fontSizes.sm,
      color: themeColors.text,
      fontWeight: fontWeights.semibold,
    },
  });

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      console.log('Loading product with ID:', id);
      const response = await productService.getProductById(id);
      
      console.log('Product API response:', response);
      
      if (response.success && response.data) {
        console.log('Product loaded:', {
          id: response.data.id,
          name: response.data.name,
          images: response.data.images,
          imagesCount: response.data.images?.length || 0
        });
        setProduct(response.data);
      } else {
        console.error('Product not found or API error:', response.error);
        Alert.alert('Error', 'Product not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (isAdmin) {
      return;
    }
    
    try {
      // Check if user is authenticated
      const token = await tokenManager.getAccessToken();
      if (!token) {
        toast.warning('Please log in to add items to your cart.');
        return;
      }
      
      // Show immediate feedback
      setAddingToCart(true);
      
      // Call add to cart - it will update UI immediately with optimistic update
      const success = await addToCart(product.id, quantity);
      
      if (success) {
        toast.success(`${product.name} has been added to your cart`);
      } else {
        toast.error('Failed to add item to cart. Please try again.');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add item to cart. Please check your connection and try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    if (isAdmin) {
      return;
    }
    
    // Add to cart first, then navigate to checkout
    await handleAddToCart();
    router.push('/checkout');
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    
    if (isAdmin) {
      return;
    }
    
    const productId = product.id;
    const inWishlist = isInWishlist(productId);
    
    if (inWishlist) {
      const success = await removeFromWishlist(productId);
      if (!success) {
        Alert.alert('Error', 'Failed to remove from wishlist');
      }
    } else {
      const success = await addToWishlist(productId);
      if (!success) {
        Alert.alert('Error', 'Failed to add to wishlist');
      }
    }
  };

  const handleContactSupplier = () => {
    if (!product) return;
    
    // Check if user is authenticated first
    const checkAuthAndShowModal = async () => {
      const token = await tokenManager.getAccessToken();
      if (!token) {
        toast.warning('Please log in to contact support.');
        return;
      }
      
      chatModal.openModal({
        title: 'Contact Supplier',
      });
    };
    
    checkAuthAndShowModal();
  };

  const createProductThread = async (threadType: 'product_inquiry' | 'quote_request') => {
    if (!product) return;
    
    const prefilledMessage = threadType === 'quote_request' 
      ? `I'm interested in getting a quote for ${product.name}. Please provide pricing details and availability information.`
      : `I have a question about ${product.name}. Can you help me with more information?`;
    
    // Navigate to message thread with product info and a temporary thread ID
    // The thread will be created when the user sends the first message
    const tempThreadId = `temp_${product.id}_${Date.now()}`;
    
    router.push({
      pathname: `/message-thread/${tempThreadId}`,
      params: {
        prefilledMessage: prefilledMessage,
        productImage: product.images?.[0] || '',
        productName: product.name,
        productId: product.id,
        threadType: threadType,
        isNewProductThread: 'true'
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="Product Details"
          showBack={true}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Header
          title="Product Details"
          showBack={true}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ViewTracker component for analytics - invisible component that tracks product views */}
      {product && (
        <ViewTracker
          productId={product.id}
          onViewTracked={(newViewCount) => {
            console.log('Product view tracked, new count:', newViewCount);
            // Update the product's view count in the local state
            setProduct(prev => prev ? { ...prev, viewCount: newViewCount } : null);
          }}
          source={source || 'product_detail'}
        />
      )}
      
      <Header
        title="Product Details"
        showBack={true}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {product.images && product.images.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                  setCurrentImageIndex(index);
                }}
              >
                {product.images.map((image, index) => {
                  // Check if image URL is valid
                  const isValidUrl = image && (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('file://'));
                  
                  return (
                    <View key={index} style={{ width: screenWidth }}>
                      {isValidUrl ? (
                        <Image
                          source={{ uri: image }}
                          style={styles.productImage}
                          resizeMode="cover"
                          onError={(error) => {
                            console.log('Image load error:', error.nativeEvent.error);
                            console.log('Image URL:', image);
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', image);
                          }}
                        />
                      ) : (
                        <View style={[styles.productImage, styles.placeholderImage]}>
                          <Ionicons name="image-outline" size={64} color={themeColors.textSecondary} />
                          <Text style={styles.placeholderText}>Invalid Image URL</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
              
              {!isAdmin && (
                <TouchableOpacity 
                  style={styles.wishlistButton}
                  onPress={handleToggleWishlist}
                >
                  <Ionicons 
                    name={isInWishlist(product.id) ? "heart" : "heart-outline"} 
                    size={24} 
                    color={isInWishlist(product.id) ? themeColors.error : themeColors.text}
                  />
                </TouchableOpacity>
              )}
              
              {product.images.length > 1 && (
                <>
                  <View style={styles.imageIndicator}>
                    <Text style={styles.imageIndicatorText}>
                      {currentImageIndex + 1}/{product.images.length}
                    </Text>
                  </View>
                  <View style={styles.imageNavigation}>
                    {product.images.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.imageDot,
                          index === currentImageIndex && styles.activeDot
                        ]}
                      />
                    ))}
                  </View>
                </>
              )}
            </>
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={64} color={themeColors.textSecondary} />
              <Text style={styles.placeholderText}>No Image Available</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          
          {product.discount && product.discount > 0 ? (
            <View style={styles.priceContainer}>
              <Text style={styles.discountedPrice}>
                ₦{Math.round(product.price * (1 - product.discount / 100)).toLocaleString()}
              </Text>
              <Text style={styles.originalPrice}>
                ₦{product.price.toLocaleString()}
              </Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>{product.discount}% OFF</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.productPrice}>
              ₦{product.price.toLocaleString()}
            </Text>
          )}

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={styles.metaText}>
                {product.rating.toFixed(1)}
              </Text>
              <Text style={[styles.metaText, { color: themeColors.textSecondary }]}>
                ({product.reviewCount})
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="cube-outline" size={18} color={product.stock > 10 ? themeColors.success : themeColors.warning} />
              <Text style={[styles.metaText, { color: product.stock > 10 ? themeColors.success : themeColors.warning }]}>
                {product.stock} in stock
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="pricetag-outline" size={18} color={themeColors.primary} />
              <Text style={styles.metaText}>{product.category}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {(product.supplier || product.supplierId) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Supplier Information</Text>
              <View style={styles.supplierDetails}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.supplierName}>
                    {(product.supplier?.name || (product.supplierId as any)?.name) || 'Unknown Supplier'}
                  </Text>
                  <Text style={styles.supplierLocation}>
                    <Ionicons name="location-outline" size={14} color={themeColors.textSecondary} />
                    {' '}{(product.supplier?.location || (product.supplierId as any)?.location) || 'Location not specified'}
                  </Text>
                </View>
                <View style={styles.supplierRating}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.ratingText}>
                    {(product.supplier?.rating || (product.supplierId as any)?.rating)?.toFixed(1) || '0.0'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specifications</Text>
              {Object.entries(product.specifications).map(([key, value], index, array) => (
                <View 
                  key={key} 
                  style={[
                    styles.specRow,
                    index === array.length - 1 && { borderBottomWidth: 0 }
                  ]}
                >
                  <Text style={styles.specKey}>{key}</Text>
                  <Text style={styles.specValue}>{String(value)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        {!isAdmin && (
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Ionicons 
                  name="remove" 
                  size={20} 
                  color={quantity <= 1 ? themeColors.textSecondary : themeColors.primary}
                />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(1)}
                disabled={quantity >= (product.stock || 1)}
              >
                <Ionicons 
                  name="add" 
                  size={20} 
                  color={quantity >= (product.stock || 1) ? themeColors.textSecondary : themeColors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.actionButtons}>
          {!isAdmin && (
            <>
              <TouchableOpacity style={styles.chatButton} onPress={handleContactSupplier}>
                <Ionicons name="chatbubble-outline" size={22} color={themeColors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.addToCartButton, addingToCart && { opacity: 0.6 }]} 
                onPress={handleAddToCart}
                disabled={addingToCart}
              >
                <Ionicons 
                  name={addingToCart ? "checkmark-circle" : "cart-outline"} 
                  size={22} 
                  color={themeColors.primary} 
                />
                <Text style={styles.addToCartText}>
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.buyNowButton} 
                onPress={handleBuyNow} 
                disabled={addingToCart}
              >
                <Text style={styles.buyNowText}>Buy Now</Text>
              </TouchableOpacity>
            </>
          )}
          {isAdmin && (
            <View style={styles.adminModeIndicator}>
              <Ionicons name="shield-checkmark-outline" size={20} color={themeColors.textSecondary} />
              <Text style={styles.adminModeText}>
                Admin View Mode - Shopping Disabled
              </Text>
            </View>
          )}
        </View>
      </View>

      <ChatOptionsModal
        visible={chatModal.visible}
        onClose={chatModal.closeModal}
        onAskQuestion={() => createProductThread('product_inquiry')}
        onRequestQuote={() => createProductThread('quote_request')}
        productName={product?.name}
      />

      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        autoClose={toast.autoClose}
        onClose={toast.hideToast}
      />
    </View>
  );
}
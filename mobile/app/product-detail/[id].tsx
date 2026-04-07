import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
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
import { ProductReviews } from '../../components/ProductReviews';
import { SectionHeader } from '../../components/SectionHeader';
import { ProductCard } from '../../components/ProductCard';
import { AdCarousel } from '../../components/AdCarousel';
import { PromoTiles } from '../../components/PromoTiles';
import { Toast } from '../../components/ui/Toast';
import { spacing } from '../../theme/spacing';
import { collectionService } from '../../services/CollectionService';
import { adService, Ad } from '../../services/AdService';
import { Collection } from '../../types/product';

const formatDiscountExpiry = (discountExpiresAt: string | undefined): { text: string; isUrgent: boolean } | null => {
  if (!discountExpiresAt) return null;
  
  const expiryDate = new Date(discountExpiresAt);
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  
  if (diffMs <= 0) return null; // Expired
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMinutes < 60) {
    return { text: `Ends in ${diffMinutes}m`, isUrgent: true };
  } else if (diffHours < 24) {
    return { text: `Ends in ${diffHours}h`, isUrgent: diffHours <= 6 };
  } else if (diffDays <= 7) {
    return { text: `Ends in ${diffDays}d`, isUrgent: diffDays <= 2 };
  } else {
    const formattedDate = expiryDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    return { text: `Ends ${formattedDate}`, isUrgent: false };
  }
};

const { width: screenWidth } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();
  const router = useRouter();
  const { colors: themeColors, spacing: themeSpacing, fontSizes, fontWeights, borderRadius, shadows } = useTheme();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const toast = useToast();
  const chatModal = useModal();

  // Related collections + ads
  const [relatedCollections, setRelatedCollections] = useState<{ collection: Collection; products: any[] }[]>([]);
  const [detailAds, setDetailAds] = useState<Ad[]>([]);
  const [detailTiles, setDetailTiles] = useState<Ad[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);

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
    discountExpiryBadge: {
      paddingHorizontal: themeSpacing.sm,
      paddingVertical: themeSpacing.xs,
      borderRadius: borderRadius.full,
      marginLeft: themeSpacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    discountExpiryBadgeUrgent: {
      backgroundColor: '#FF4444',
      shadowColor: '#FF4444',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    discountExpiryBadgeNormal: {
      backgroundColor: '#FF8C00',
    },
    discountExpiryText: {
      color: themeColors.textInverse,
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.bold,
    },
    discountExpirySection: {
      backgroundColor: themeColors.surface,
      borderRadius: borderRadius.lg,
      padding: themeSpacing.base,
      marginBottom: themeSpacing.base,
      borderLeftWidth: 4,
      borderLeftColor: '#FF4444',
      ...shadows.sm,
    },
    discountExpirySectionTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
      color: '#FF4444',
      marginBottom: themeSpacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: themeSpacing.xs,
    },
    discountExpiryDetails: {
      fontSize: fontSizes.sm,
      color: themeColors.textSecondary,
      lineHeight: 20,
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
    // Checkout preview
    checkoutPreview: {
      backgroundColor: themeColors.surface,
      borderRadius: borderRadius.lg,
      padding: themeSpacing.base,
      marginBottom: themeSpacing.base,
      ...shadows.sm,
    },
    checkoutPreviewTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
      color: themeColors.text,
      marginBottom: themeSpacing.sm,
    },
    checkoutPreviewRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: themeSpacing.xs,
    },
    checkoutPreviewLabel: {
      fontSize: fontSizes.sm,
      color: themeColors.textSecondary,
    },
    checkoutPreviewValue: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      color: themeColors.text,
    },
    checkoutPreviewTotal: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
      color: themeColors.primary,
    },
    checkoutDivider: {
      height: 1,
      backgroundColor: themeColors.borderLight,
      marginVertical: themeSpacing.sm,
    },
    checkoutButton: {
      backgroundColor: themeColors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: themeSpacing.sm,
      alignItems: 'center',
      marginTop: themeSpacing.sm,
    },
    checkoutButtonText: {
      color: themeColors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
    },
    // Section divider
    sectionDivider: {
      height: 1,
      backgroundColor: themeColors.border,
      marginVertical: themeSpacing.lg,
      marginHorizontal: -spacing.base,
    },
    // Horizontal product scroll
    horizontalProductScroll: {
      paddingHorizontal: themeSpacing.base,
      gap: themeSpacing.sm,
    },
    horizontalProductItem: {
      width: 140,
    },
  });

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  // Load 3 random collections + product-detail ads non-blocking
  useEffect(() => {
    collectionService.getActiveCollections().then(async res => {
      if (!res.success || !res.data?.length) return;
      const shuffled = [...res.data].sort(() => Math.random() - 0.5).slice(0, 3);
      const loaded: { collection: any; products: any[] }[] = [];
      for (const col of shuffled) {
        const colId = (col as any)._id || col.id;
        try {
          const pr = await collectionService.getCollectionProducts(colId, 1, 8);
          const products = pr.data?.products ?? [];
          loaded.push({ collection: col, products });
        } catch {
          loaded.push({ collection: col, products: [] });
        }
      }
      setRelatedCollections(loaded);
    }).catch(() => {});

    adService.getAds('product-detail', 'carousel').then(res => {
      if (res.success && res.data) setDetailAds(res.data);
    }).catch(() => {});
    adService.getAds('product-detail', 'tile').then(res => {
      if (res.success && res.data) setDetailTiles(res.data);
    }).catch(() => {});

    // Trending products
    productService.getTrendingProducts('7d', 1, 10).then(res => {
      if (res.success && res.data) {
        const products = Array.isArray(res.data) ? res.data : (res.data as any)?.products || [];
        setTrendingProducts(products);
      }
    }).catch(() => {});
  }, []);

  // Load category products + recently viewed once product is known
  useEffect(() => {
    if (!product) return;

    // Same category
    if (product.category) {
      productService.getProductsByCategory(product.category, { limit: 10 }).then(res => {
        if (res.success && res.data) {
          const others = (Array.isArray(res.data) ? res.data : [])
            .filter((p: any) => (p._id || p.id) !== (product as any)._id && p.id !== product.id);
          setCategoryProducts(others.slice(0, 10));
        }
      }).catch(() => {});
    }

    // Recently viewed — fetch from browsing history API
    if (user?.id) {
      const { API_BASE_URL } = require('../../constants/config');
      const { tokenManager } = require('../../services/api/tokenManager');
      tokenManager.getAccessToken().then((token: string | null) => {
        if (!token) return;
        fetch(`${API_BASE_URL}/users/${user.id}/browsing-history?page=1&limit=10&interactionType=view`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(r => r.json())
          .then(data => {
            const items: any[] = data?.data?.history || data?.data || [];
            const products = items
              .map((item: any) => item.productId)
              .filter((p: any) => p && (p._id || p.id) !== (product as any)._id && p.id !== product.id)
              .slice(0, 10);
            setRecentlyViewed(products);
          })
          .catch(() => {});
      });
    }
  }, [product, user?.id]);

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
      // Show immediate feedback
      setAddingToCart(true);
      
      // Pass product data for instant optimistic update
      const productData = {
        name: product.name,
        price: product.discount && product.discount > 0 
          ? Math.round(product.price * (1 - product.discount / 100))
          : product.price,
        images: product.images || []
      };
      
      // Call add to cart with product data for instant UI update
      const success = await addToCart(product.id, quantity, undefined, productData);
      
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
      if (success) {
        toast.success('Removed from wishlist');
      } else {
        toast.error('Failed to remove from wishlist');
      }
    } else {
      const success = await addToWishlist(productId);
      if (success) {
        toast.success('Added to wishlist');
      } else {
        toast.error('Failed to add to wishlist');
      }
    }
  };

  const handleContactSupplier = () => {
    if (!product) return;
    
    // Show modal directly - auth check will happen when user tries to send message
    chatModal.openModal({
      title: 'Contact Supplier',
    });
  };

  const createProductThread = async (threadType: 'product_inquiry' | 'quote_request') => {
    if (!product) return;
    
    const prefilledMessage = threadType === 'quote_request' 
      ? `I'm interested in getting a quote for ${product.name}. Please provide pricing details and availability information.`
      : `I have a question about ${product.name}. Can you help me with more information?`;
    
    // Close the modal first
    chatModal.closeModal();
    
    // Navigate to new message screen with prefilled content
    router.push({
      pathname: '/new-message',
      params: {
        prefilledMessage: prefilledMessage,
        productImage: product.images?.[0] || '',
        productName: product.name,
        productId: product.id,
        threadType: threadType,
        isProductMessage: 'true'
      }
    });
  };

  const isSharingRef = React.useRef(false);
  const cachedImageUriRef = React.useRef<string | null>(null);

  const handleShare = async () => {
    if (!product || isSharingRef.current) return;
    isSharingRef.current = true;
    setIsSharing(true);

    const price = product.discount && product.discount > 0
      ? `₦${Math.round(product.price * (1 - product.discount / 100)).toLocaleString()} (${product.discount}% OFF)`
      : `₦${product.price.toLocaleString()}`;
    const message = `Check out ${product.name} on AfroChinaTrade!\n\nPrice: ${price}\nCategory: ${product.category}\n\n${product.description?.slice(0, 120) || ''}`;

    const imageUrl = product.images?.[0];

    if (imageUrl && imageUrl.startsWith('http')) {
      try {
        const localUri = `${FileSystem.cacheDirectory}afrochinatrade_product_${product.id}.jpg`;
        const info = await FileSystem.getInfoAsync(localUri);
        if (!info.exists) {
          await FileSystem.downloadAsync(imageUrl, localUri);
        }

        // Copy caption to clipboard before opening share sheet.
        // WhatsApp blocks programmatic captions, so the user can paste it manually.
        Clipboard.setString(message);
        toast.info('Caption copied — paste it as your message after sharing the image');

        await Sharing.shareAsync(localUri, {
          mimeType: 'image/jpeg',
          dialogTitle: product.name,
          UTI: 'public.jpeg',
        });
        isSharingRef.current = false;
        setIsSharing(false);
        return;
      } catch (err) {
        console.warn('Image share failed, falling back to text share:', err);
      }
    }

    // Fallback: text-only
    try {
      await Share.share({ title: product.name, message });
    } catch {
      // user cancelled
    }
    isSharingRef.current = false;
    setIsSharing(false);
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
        rightAction={
          <TouchableOpacity
            onPress={handleShare}
            disabled={isSharing}
            style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isSharing
              ? <ActivityIndicator size="small" color={themeColors.primary} />
              : <Ionicons name="share-social-outline" size={22} color={themeColors.primary} />
            }
          </TouchableOpacity>
        }
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
              {(() => {
                const expiryInfo = formatDiscountExpiry(product.discountExpiresAt);
                if (!expiryInfo) return null;
                
                return (
                  <View style={[
                    styles.discountExpiryBadge,
                    expiryInfo.isUrgent ? styles.discountExpiryBadgeUrgent : styles.discountExpiryBadgeNormal
                  ]}>
                    <Ionicons 
                      name={expiryInfo.isUrgent ? "time" : "time-outline"} 
                      size={12} 
                      color="white" 
                    />
                    <Text style={styles.discountExpiryText}>
                      {expiryInfo.text}
                    </Text>
                  </View>
                );
              })()}
            </View>
          ) : (
            <Text style={styles.productPrice}>
              ₦{product.price.toLocaleString()}
            </Text>
          )}

          {/* Enhanced Discount Expiry Section */}
          {(() => {
            const expiryInfo = formatDiscountExpiry(product.discountExpiresAt);
            if (!expiryInfo || !product.discount || product.discount <= 0) return null;
            
            const savings = Math.round(product.price * (product.discount / 100));
            const expiryDate = new Date(product.discountExpiresAt!);
            const formattedDate = expiryDate.toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            
            return (
              <View style={styles.discountExpirySection}>
                <View style={styles.discountExpirySectionTitle}>
                  <Ionicons name="flash" size={18} color="#FF4444" />
                  <Text style={styles.discountExpirySectionTitle}>
                    {expiryInfo.isUrgent ? 'Limited Time Offer!' : 'Special Discount'}
                  </Text>
                </View>
                <Text style={styles.discountExpiryDetails}>
                  Save ₦{savings.toLocaleString()} ({product.discount}% off) • {expiryInfo.text.charAt(0).toUpperCase() + expiryInfo.text.slice(1)} on {formattedDate}
                  {expiryInfo.isUrgent && ' ⚡ Hurry up!'}
                </Text>
              </View>
            );
          })()}

          <View style={styles.metaInfo}>
            <TouchableOpacity 
              style={styles.metaItem}
              onPress={() => router.push({
                pathname: `/product-reviews/${product.id}`,
                params: { productName: product.name }
              })}
            >
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={styles.metaText}>
                {product.rating.toFixed(1)}
              </Text>
              <Text style={[styles.metaText, { color: themeColors.textSecondary }]}>
                ({product.reviewCount})
              </Text>
              <Ionicons name="chevron-forward" size={16} color={themeColors.textSecondary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
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
                {(() => {
                  const logo = (product.supplier?.logo || (product.supplierId as any)?.logo);
                  return logo ? (
                    <Image
                      source={{ uri: logo }}
                      style={{ width: 48, height: 48, borderRadius: borderRadius.base, marginRight: themeSpacing.base, backgroundColor: '#FFFFFF', padding: 4 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={{ width: 48, height: 48, borderRadius: borderRadius.base, marginRight: themeSpacing.base, backgroundColor: themeColors.surface, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="storefront-outline" size={24} color={themeColors.textSecondary} />
                    </View>
                  );
                })()}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {(product.supplier?.verified || (product.supplierId as any)?.verified) && (
                      <Ionicons name="shield-checkmark" size={16} color={themeColors.primary} />
                    )}
                    <Text style={[styles.supplierName, { marginLeft: (product.supplier?.verified || (product.supplierId as any)?.verified) ? -2 : 0 }]}>
                      {(product.supplier?.name || (product.supplierId as any)?.name) || 'Unknown Supplier'}
                    </Text>
                  </View>
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

          {/* Checkout Preview — non-admin only */}
          {!isAdmin && (
            <View style={styles.checkoutPreview}>
              <Text style={styles.checkoutPreviewTitle}>Order Summary</Text>
              <View style={styles.checkoutPreviewRow}>
                <Text style={styles.checkoutPreviewLabel}>Unit price</Text>
                <Text style={styles.checkoutPreviewValue}>
                  ₦{product.discount && product.discount > 0
                    ? Math.round(product.price * (1 - product.discount / 100)).toLocaleString()
                    : product.price.toLocaleString()}
                </Text>
              </View>
              <View style={styles.checkoutPreviewRow}>
                <Text style={styles.checkoutPreviewLabel}>Quantity</Text>
                <Text style={styles.checkoutPreviewValue}>{quantity}</Text>
              </View>
              <View style={styles.checkoutDivider} />
              <View style={styles.checkoutPreviewRow}>
                <Text style={styles.checkoutPreviewLabel}>Subtotal</Text>
                <Text style={styles.checkoutPreviewTotal}>
                  ₦{(
                    (product.discount && product.discount > 0
                      ? Math.round(product.price * (1 - product.discount / 100))
                      : product.price) * quantity
                  ).toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleBuyNow}
                disabled={addingToCart}
              >
                <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Product Reviews */}
          <ProductReviews productId={product.id} productName={product.name} />

          {/* ── Post-reviews sections ── */}
          <View style={styles.sectionDivider} />

          {/* 1. Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <View style={{ marginBottom: themeSpacing.lg, marginHorizontal: -spacing.base }}>
              <SectionHeader
                title="Recently Viewed"
                actionText="See All"
                icon="time-outline"
                onActionPress={() => router.push('/browsing-history')}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalProductScroll}>
                {recentlyViewed.map((p: any) => (
                  <View key={p._id || p.id} style={styles.horizontalProductItem}>
                    <ProductCard
                      product={p}
                      onPress={() => router.push({ pathname: '/product-detail/[id]', params: { id: p._id || p.id } })}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 2. Same Category */}
          {categoryProducts.length > 0 && (
            <View style={{ marginBottom: themeSpacing.lg, marginHorizontal: -spacing.base }}>
              <SectionHeader
                title={`More in ${product.category}`}
                actionText="See All"
                icon="pricetag-outline"
                onActionPress={() => router.push({
                  pathname: '/products',
                  params: { category: product.category, title: `More in ${product.category}` },
                })}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalProductScroll}>
                {categoryProducts.map((p: any) => (
                  <View key={p._id || p.id} style={styles.horizontalProductItem}>
                    <ProductCard
                      product={p}
                      onPress={() => router.push({ pathname: '/product-detail/[id]', params: { id: p._id || p.id } })}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 3. Ad Carousel */}
          {detailAds.length > 0 && (
            <View style={{ marginHorizontal: -spacing.base }}>
              <AdCarousel ads={detailAds} />
            </View>
          )}

          {/* 3b. Promo Tiles */}
          {detailTiles.length > 0 && (
            <View style={{ marginBottom: themeSpacing.md, marginHorizontal: -spacing.base }}>
              <PromoTiles ads={detailTiles} />
            </View>
          )}

          {/* 4. Same Collection (first relatedCollection) */}
          {relatedCollections.slice(0, 1).map((item) =>
            item.products.length > 0 ? (
              <View key={(item.collection as any)._id || item.collection.id}
                style={{ marginBottom: themeSpacing.lg, marginHorizontal: -spacing.base }}>
                <SectionHeader
                  title={item.collection.name}
                  actionText="See All"
                  icon="grid-outline"
                  onActionPress={() => router.push({
                    pathname: '/products',
                    params: { collectionId: (item.collection as any)._id || item.collection.id, title: item.collection.name },
                  })}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalProductScroll}>
                  {item.products.map((p: any) => (
                    <View key={p._id || p.id} style={styles.horizontalProductItem}>
                      <ProductCard
                        product={p}
                        onPress={() => router.push({ pathname: '/product-detail/[id]', params: { id: p._id || p.id } })}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : null
          )}

          {/* 5. Trending */}
          {trendingProducts.length > 0 && (
            <View style={{ marginBottom: themeSpacing.lg, marginHorizontal: -spacing.base }}>
              <SectionHeader
                title="Trending Now"
                actionText="See All"
                icon="trending-up-outline"
                onActionPress={() => router.push({
                  pathname: '/products',
                  params: { collection: 'trending', title: 'Trending Products' },
                })}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalProductScroll}>
                {trendingProducts.map((p: any) => (
                  <View key={p._id || p.id} style={styles.horizontalProductItem}>
                    <ProductCard
                      product={p}
                      onPress={() => router.push({ pathname: '/product-detail/[id]', params: { id: p._id || p.id } })}
                    />
                  </View>
                ))}
              </ScrollView>
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
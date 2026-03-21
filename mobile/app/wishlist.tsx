import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { BackHeader } from '../components/ui';

interface WishlistItemProps {
  item: any;
  onRemove: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  onPress: (productId: string) => void;
}

const WishlistItemCard: React.FC<WishlistItemProps> = ({ item, onRemove, onAddToCart, onPress }) => {
  const { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } = useTheme();
  const product = item.productId;
  
  const styles = StyleSheet.create({
    itemCard: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      marginBottom: spacing.base,
      flexDirection: 'row',
      alignItems: 'center',
      ...shadows.sm,
    },
    productImage: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.base,
      marginRight: spacing.md,
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    productCategory: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    productPrice: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    stockStatus: {
      fontSize: fontSizes.xs,
      color: colors.textLight,
    },
    actions: {
      alignItems: 'center',
      gap: spacing.sm,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cartButton: {
      backgroundColor: colors.primary,
    },
    removeButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.error,
    },
  });
  
  return (
    <TouchableOpacity style={styles.itemCard} onPress={() => onPress(product._id)}>
      <Image 
        source={{ uri: product.images[0] || 'https://via.placeholder.com/100' }} 
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productCategory}>{product.category}</Text>
        <Text style={styles.productPrice}>₦{product.price.toFixed(2)}</Text>
        <Text style={styles.stockStatus}>
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.cartButton]}
          onPress={() => onAddToCart(product._id)}
          disabled={product.stock === 0}
        >
          <Ionicons name="cart-outline" size={20} color={colors.background} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.removeButton]}
          onPress={() => onRemove(product._id)}
        >
          <Ionicons name="heart" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default function WishlistScreen() {
  const router = useRouter();
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const { wishlist, loading, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    loadingText: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
    },
    emptyTitle: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginTop: spacing.base,
      marginBottom: spacing.sm,
    },
    emptySubtitle: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    shopButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
    },
    shopButtonText: {
      color: colors.background,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    listContainer: {
      padding: spacing.base,
    },
  });

  const handleRemoveItem = async (productId: string) => {
    const success = await removeFromWishlist(productId);
    if (!success) {
      Alert.alert('Error', 'Failed to remove item from wishlist');
    }
  };

  const handleAddToCart = async (productId: string) => {
    const success = await addToCart(productId, 1);
    if (success) {
      Alert.alert('Success', 'Item added to cart');
    } else {
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product-detail/${productId}`);
  };

  const handleClearWishlist = () => {
    Alert.alert(
      'Clear Wishlist',
      'Are you sure you want to remove all items from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const success = await clearWishlist();
            if (!success) {
              Alert.alert('Error', 'Failed to clear wishlist');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <WishlistItemCard
      item={item}
      onRemove={handleRemoveItem}
      onAddToCart={handleAddToCart}
      onPress={handleProductPress}
    />
  );

  const clearAction = wishlist.length > 0 ? (
    <TouchableOpacity onPress={handleClearWishlist} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
      <Text style={{ color: colors.error, fontSize: fontSizes.sm, fontWeight: fontWeights.medium }}>
        Clear
      </Text>
    </TouchableOpacity>
  ) : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <BackHeader 
        title="My Wishlist" 
        rightAction={clearAction}
      />

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading wishlist...</Text>
        </View>
      ) : wishlist.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="heart-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtitle}>
            Save products you love to buy them later
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
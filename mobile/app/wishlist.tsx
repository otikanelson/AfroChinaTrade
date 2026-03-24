import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function WishlistScreen() {  
  const router = useRouter();
  const { colors: themeColors, fontSizes, fontWeights, borderRadius } = useTheme();
  const { wishlist, loading, removeFromWishlist, clearWishlist, refreshWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated, isGuestMode } = useAuth();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.surface,
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
    productsList: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      gap: spacing.lg,
      backgroundColor: themeColors.surface,
    },
  });

  const handleProductPress = React.useCallback((productId: string) => {
    router.push(`/product-detail/${productId}`);
  }, [router]);

  const renderItem = React.useCallback(({ item }: { item: any }) => {
    const product = item.productId;
    const productId = (product as any)._id || product.id;
    
    return (
      <ProductCard
        product={product}
        variant="list"
        onPress={() => handleProductPress(productId)}
        showAddButton={true}
      />
    );
  }, [handleProductPress]);

  const keyExtractor = React.useCallback((item: any) => item._id, []);

  return (
    <View style={styles.container}>
      <Header 
        title="My Wishlist" 
        showBack={true}
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
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshWishlist}
              tintColor={colors.primary}
            />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          windowSize={10}
        />
      )}
    </View>
  );
}
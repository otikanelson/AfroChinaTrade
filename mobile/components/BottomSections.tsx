import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useRecommendations } from '../hooks/useRecommendations';
import { AdCarousel } from './AdCarousel';
import { PromoTiles } from './PromoTiles';
import { ProductCard } from './ProductCard';
import { SectionHeader } from './SectionHeader';
import { adService, Ad } from '../services/AdService';
import { tokenManager } from '../services/api/tokenManager';
import { API_BASE_URL } from '../constants/config';
import { Product } from '../types/product';

interface BottomSectionsProps {
  context: 'checkout' | 'account';
}

interface BrowsingHistoryItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    category: string;
    rating?: number;
    stock?: number;
    viewCount?: number;
    reviewCount?: number;
    description?: string;
    discount?: number;
    supplier?: {
      name: string;
      location?: string;
      rating?: number;
      verified?: boolean;
    };
  };
  timestamp: string;
}

export const BottomSections: React.FC<BottomSectionsProps> = ({ context }) => {
  const router = useRouter();
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { recommendations, hasRecommendations } = useRecommendations();
  
  const [ads, setAds] = useState<Ad[]>([]);
  const [tiles, setTiles] = useState<Ad[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  // Load ads and tiles
  useEffect(() => {
    const loadAds = async () => {
      try {
        const [adsResponse, tilesResponse] = await Promise.all([
          adService.getAds(context, 'carousel'),
          adService.getAds(context, 'tile')
        ]);
        
        if (adsResponse.success && adsResponse.data) {
          setAds(adsResponse.data);
        }
        
        if (tilesResponse.success && tilesResponse.data) {
          setTiles(tilesResponse.data);
        }
      } catch (error) {
        console.error('Error loading ads:', error);
      }
    };

    loadAds();
  }, [context]);

  // Load recently viewed products
  useEffect(() => {
    const loadRecentlyViewed = async () => {
      if (!isAuthenticated || !user?.id) {
        setRecentlyViewed([]);
        return;
      }

      try {
        setLoadingRecent(true);
        const token = await tokenManager.getAccessToken();
        if (!token) return;

        const response = await fetch(
          `${API_BASE_URL}/users/${user.id}/browsing-history?page=1&limit=10&interactionType=view`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();
        if (data.status === 'success' && data.data?.history) {
          // Convert browsing history to products
          const products = data.data.history
            .filter((item: BrowsingHistoryItem) => item.productId && item.productId._id)
            .slice(0, 6) // Limit to 6 items
            .map((item: BrowsingHistoryItem) => ({
              id: item.productId._id,
              name: item.productId.name,
              price: item.productId.price,
              images: item.productId.images || [],
              category: item.productId.category,
              rating: item.productId.rating || 0,
              reviewCount: item.productId.reviewCount || 0,
              stock: item.productId.stock || 0,
              viewCount: item.productId.viewCount || 0,
              description: item.productId.description || '',
              discount: item.productId.discount || 0,
              supplier: item.productId.supplier,
            }));
          
          setRecentlyViewed(products);
        }
      } catch (error) {
        console.error('Error loading recently viewed:', error);
      } finally {
        setLoadingRecent(false);
      }
    };

    loadRecentlyViewed();
  }, [isAuthenticated, user?.id]);

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/product-detail/[id]',
      params: { id: product.id }
    });
  };

  const handleSeeAllRecommendations = () => {
    router.push({
      pathname: '/products',
      params: { 
        collection: 'recommended',
        title: 'Recommended for You'
      }
    });
  };

  const handleSeeAllRecentlyViewed = () => {
    router.push('/browsing-history');
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.lg,
      marginHorizontal: spacing.base,
    },
    section: {
      marginBottom: spacing.lg,
    },
    horizontalList: {
      paddingHorizontal: spacing.base,
      gap: spacing.xs,
    },
    productCardWrapper: {
      width: 140,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
    },
    emptyText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
  });

  const hasContent = ads.length > 0 || tiles.length > 0 || 
                   (isAuthenticated && (hasRecommendations || recentlyViewed.length > 0));

  if (!hasContent) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Divider */}
      <View style={styles.divider} />

      {/* Ads Carousel */}
      {ads.length > 0 && (
        <View style={styles.section}>
          <AdCarousel ads={ads} />
        </View>
      )}

      {/* Promo Tiles */}
      {tiles.length > 0 && (
        <View style={styles.section}>
          <PromoTiles ads={tiles} />
        </View>
      )}

      {/* Recommended Section - Only for authenticated users */}
      {isAuthenticated && hasRecommendations && (
        <View style={styles.section}>
          <SectionHeader 
            title="Recommended for You" 
            actionText="See All" 
            onActionPress={handleSeeAllRecommendations}
          />
          <FlatList
            data={recommendations.slice(0, 6)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={p => (p as any)._id || p.id}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item: product }) => (
              <View style={styles.productCardWrapper}>
                <ProductCard 
                  product={product} 
                  onPress={() => handleProductPress(product)} 
                />
              </View>
            )}
          />
        </View>
      )}

      {/* Recently Viewed Section - Only for authenticated users */}
      {isAuthenticated && recentlyViewed.length > 0 && (
        <View style={styles.section}>
          <SectionHeader 
            title="Recently Viewed" 
            actionText="See All" 
            onActionPress={handleSeeAllRecentlyViewed}
          />
          <FlatList
            data={recentlyViewed}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={p => p.id}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item: product }) => (
              <View style={styles.productCardWrapper}>
                <ProductCard 
                  product={product} 
                  onPress={() => handleProductPress(product)} 
                />
              </View>
            )}
          />
        </View>
      )}

      {/* Empty state for non-authenticated users */}
      {!isAuthenticated && ads.length === 0 && tiles.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>
            Sign in to see personalized recommendations and recently viewed products
          </Text>
        </View>
      )}
    </View>
  );
};
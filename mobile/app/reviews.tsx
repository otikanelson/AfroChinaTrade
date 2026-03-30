import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { Header } from '../components/Header';
import { reviewService, Review } from '../services/ReviewService';
import { spacing } from '../theme/spacing';

export default function ReviewsScreen() {
  const { isAuthenticated } = useRequireAuth('Please sign in to view your reviews');
  const router = useRouter();
  const { colors, fontSizes, fontWeights, borderRadius } = useTheme();
  const { user } = useAuth();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      marginTop: spacing.md,
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
    reviewsList: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
    },
    reviewCard: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      marginBottom: spacing.sm,
    },
    productInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    productImage: {
      width: 50,
      height: 50,
      borderRadius: borderRadius.base,
      marginRight: spacing.sm,
    },
    productName: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      flex: 1,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    ratingText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginLeft: spacing.xs,
    },
    comment: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    date: {
      fontSize: fontSizes.xs,
      color: colors.textLight,
    },
    helpful: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    errorText: {
      fontSize: fontSizes.base,
      color: colors.error,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
    },
    retryButtonText: {
      color: colors.textInverse,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
    },
  });

  const fetchReviews = useCallback(async (isRefresh: boolean = false) => {
    if (!user?.id) return;

    try {
      if (!isRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      const response = await reviewService.getUserReviews();
      setReviews(response.data || []);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchReviews();
    }
  }, [isAuthenticated, user?.id, fetchReviews]);

  const handleRefresh = useCallback(() => {
    fetchReviews(true);
  }, [fetchReviews]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color="#f59e0b"
          />
        ))}
        <Text style={styles.ratingText}>{rating}.0</Text>
      </View>
    );
  };

  const renderItem = useCallback(({ item }: { item: Review }) => (
    <TouchableOpacity 
      style={styles.reviewCard}
      onPress={() => {
        const productId = typeof item.productId === 'object' ? item.productId._id : item.productId;
        router.push(`/product-detail/${productId}`);
      }}
    >
      <View style={styles.productInfo}>
        <Image
          source={{ 
            uri: typeof item.productId === 'object' && item.productId.images?.[0] 
              ? item.productId.images[0] 
              : 'https://via.placeholder.com/50' 
          }}
          style={styles.productImage}
        />
        <Text style={styles.productName} numberOfLines={2}>
          {typeof item.productId === 'object' ? item.productId.name : 'Product'}
        </Text>
      </View>
      
      {renderStars(item.rating)}
      
      {item.comment && <Text style={styles.comment}>{item.comment}</Text>}
      
      <View style={styles.footer}>
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  ), [styles, colors, router]);

  const keyExtractor = useCallback((item: Review) => item._id, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Header 
        title="My Reviews" 
        showBack={true}
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchReviews()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="star-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No reviews yet</Text>
          <Text style={styles.emptySubtitle}>
            Your product reviews will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.reviewsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

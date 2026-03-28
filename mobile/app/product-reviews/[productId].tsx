import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/Header';
import { reviewService, Review } from '../../services/ReviewService';
import { AlertModal } from '../../components/ui/AlertModal';
import { spacing } from '../../theme/spacing';

export default function ProductReviewsScreen() {
  const { productId, productName } = useLocalSearchParams<{ 
    productId: string; 
    productName?: string; 
  }>();
  const router = useRouter();
  const { colors, fontSizes, fontWeights, borderRadius } = useTheme();
  const { user, isAuthenticated, isAdmin } = useAuth();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      marginBottom: spacing.sm,
    },
    reviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    reviewerName: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
    },
    reviewDate: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    ratingText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginLeft: spacing.xs,
    },
    comment: {
      fontSize: fontSizes.sm,
      color: colors.text,
      lineHeight: 20,
      marginBottom: spacing.xs,
    },
    response: {
      backgroundColor: colors.background,
      padding: spacing.sm,
      borderRadius: borderRadius.base,
      marginTop: spacing.xs,
    },
    responseLabel: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    responseText: {
      fontSize: fontSizes.sm,
      color: colors.text,
      lineHeight: 18,
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
    addReviewButton: {
      backgroundColor: colors.primary,
      margin: spacing.base,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    addReviewText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    addReviewForm: {
      backgroundColor: colors.surface,
      margin: spacing.base,
      padding: spacing.base,
      borderRadius: borderRadius.md,
    },
    formTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: spacing.base,
    },
    ratingSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.base,
    },
    ratingLabel: {
      fontSize: fontSizes.base,
      color: colors.text,
      marginRight: spacing.sm,
    },
    commentInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.base,
      padding: spacing.sm,
      fontSize: fontSizes.base,
      color: colors.text,
      minHeight: 100,
      textAlignVertical: 'top',
      marginBottom: spacing.base,
    },
    formButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    submitButton: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.base,
      alignItems: 'center',
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.background,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.base,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonText: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    submitButtonText: {
      color: colors.textInverse,
    },
    cancelButtonText: {
      color: colors.text,
    },
  });

  const fetchReviews = useCallback(async (isRefresh: boolean = false) => {
    if (!productId) return;

    try {
      if (!isRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      const response = await reviewService.getProductReviews(productId);
      setReviews(response.reviews || []);
      
      // Check if current user has already reviewed this product
      if (user && response.reviews) {
        const hasReviewed = response.reviews.some(review => review.userId === user.id);
        setUserHasReviewed(hasReviewed);
      }
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [productId, user]);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId, fetchReviews]);

  const handleRefresh = useCallback(() => {
    fetchReviews(true);
  }, [fetchReviews]);

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setAlertModal({
      visible: true,
      title,
      message,
      type,
    });
  };

  const handleSubmitReview = async () => {
    if (newRating === 0) {
      showAlert('Error', 'Please select a rating', 'error');
      return;
    }
    
    if (newComment.trim().length > 0 && newComment.trim().length < 10) {
      showAlert('Error', 'Comment must be at least 10 characters long or left empty', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await reviewService.createReview({
        productId,
        rating: newRating,
        comment: newComment.trim(),
      });
      
      setShowAddReview(false);
      setNewRating(0);
      setNewComment('');
      setUserHasReviewed(true);
      fetchReviews();
      
      showAlert('Success', 'Your review has been submitted successfully!', 'success');
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number, interactive = false, onPress?: (rating: number) => void) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => interactive && onPress?.(star)}
            disabled={!interactive}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={interactive ? 24 : 16}
              color="#f59e0b"
              style={{ marginRight: 2 }}
            />
          </TouchableOpacity>
        ))}
        {!interactive && (
          <Text style={styles.ratingText}>{rating}.0</Text>
        )}
      </View>
    );
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewerName}>{item.userName}</Text>
        <Text style={styles.reviewDate}>{formatDate(item.createdAt)}</Text>
      </View>
      
      {renderStars(item.rating)}
      
      {item.comment && <Text style={styles.comment}>{item.comment}</Text>}
      
      {item.response && (
        <View style={styles.response}>
          <Text style={styles.responseLabel}>Admin Response:</Text>
          <Text style={styles.responseText}>{item.response}</Text>
        </View>
      )}
    </View>
  );

  const keyExtractor = useCallback((item: Review) => item._id, []);

  const canAddReview = isAuthenticated && !isAdmin && !userHasReviewed;

  return (
    <View style={styles.container}>
      <Header 
        title={productName ? `Reviews - ${productName}` : 'Product Reviews'} 
        showBack={true}
      />

      {canAddReview && !showAddReview && (
        <TouchableOpacity
          style={styles.addReviewButton}
          onPress={() => setShowAddReview(true)}
        >
          <Text style={styles.addReviewText}>Write a Review</Text>
        </TouchableOpacity>
      )}

      {showAddReview && (
        <View style={styles.addReviewForm}>
          <Text style={styles.formTitle}>Write a Review</Text>
          
          <View style={styles.ratingSelector}>
            <Text style={styles.ratingLabel}>Rating:</Text>
            {renderStars(newRating, true, setNewRating)}
          </View>
          
          <TextInput
            style={styles.commentInput}
            placeholder="Share your experience with this product... (optional)"
            placeholderTextColor={colors.textLight}
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={1000}
          />
          
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowAddReview(false);
                setNewRating(0);
                setNewComment('');
              }}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitReview}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.textInverse} />
              ) : (
                <Text style={[styles.buttonText, styles.submitButtonText]}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

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
            Be the first to review this product!
          </Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderReviewItem}
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

      <AlertModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}
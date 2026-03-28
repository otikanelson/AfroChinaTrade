import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { reviewService, Review } from '../services/ReviewService';
import { AlertModal } from './ui/AlertModal';
import { spacing } from '../theme/spacing';

interface ProductReviewsProps {
  productId: string;
  productName?: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, productName }) => {
  const { colors, fontSizes, fontWeights, borderRadius } = useTheme();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Limit reviews shown in product detail page
  const PREVIEW_LIMIT = 3;
  const previewReviews = reviews.slice(0, PREVIEW_LIMIT);
  const hasMoreReviews = reviews.length > PREVIEW_LIMIT;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.base,
      marginBottom: spacing.base,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.base,
    },
    title: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
    },
    addReviewButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.base,
    },
    addReviewText: {
      color: colors.textInverse,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
    },
    reviewItem: {
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      paddingVertical: spacing.sm,
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
    addReviewForm: {
      backgroundColor: colors.background,
      padding: spacing.base,
      borderRadius: borderRadius.base,
      marginTop: spacing.base,
    },
    formTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    ratingSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.base,
    },
    ratingLabel: {
      fontSize: fontSizes.sm,
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
      minHeight: 80,
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
      backgroundColor: colors.surface,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.base,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
    },
    submitButtonText: {
      color: colors.textInverse,
    },
    cancelButtonText: {
      color: colors.text,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: spacing.lg,
    },
    emptyText: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    loadingContainer: {
      paddingVertical: spacing.lg,
      alignItems: 'center',
    },
    seeMoreButton: {
      backgroundColor: colors.background,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.base,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      borderColor: colors.primary,
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    seeMoreText: {
      color: colors.primary,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
    },
  });

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getProductReviews(productId);
      setReviews(response.reviews || []);
      
      // Check if current user has already reviewed this product
      if (user && response.reviews) {
        const hasReviewed = response.reviews.some(review => review.userId === user.id);
        setUserHasReviewed(hasReviewed);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSeeMoreReviews = () => {
    router.push({
      pathname: `/product-reviews/${productId}`,
      params: {
        productName: productName || 'Product'
      }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.reviewItem}>
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

  const canAddReview = isAuthenticated && !isAdmin && !userHasReviewed;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reviews ({reviews.length})</Text>
        {canAddReview && (
          <TouchableOpacity
            style={styles.addReviewButton}
            onPress={() => setShowAddReview(true)}
          >
            <Text style={styles.addReviewText}>Add Review</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="star-outline" size={48} color={colors.textLight} />
          <Text style={styles.emptyText}>No reviews yet. Be the first to review!</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={previewReviews}
            renderItem={renderReviewItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
          {hasMoreReviews && (
            <TouchableOpacity
              style={styles.seeMoreButton}
              onPress={handleSeeMoreReviews}
            >
              <Text style={styles.seeMoreText}>
                See All {reviews.length} Reviews
              </Text>
            </TouchableOpacity>
          )}
        </>
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

      <AlertModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
};
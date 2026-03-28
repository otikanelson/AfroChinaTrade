import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { reviewService, Review } from '../../services/ReviewService';
import { Header } from '../../components/Header';
import { AlertModal } from '../../components/ui/AlertModal';
import { spacing } from '../../theme/spacing';

export default function ProductReviewsScreen() {
  const { id, productName } = useLocalSearchParams<{ id: string; productName?: string }>();
  const { colors, fontSizes, fontWeights, borderRadius, shadows } = useTheme();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
    content: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.base,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      marginTop: 5,
    },
    title: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
    },
    addReviewButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.base,
    },
    addReviewText: {
      color: colors.textInverse,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
    },
    reviewItem: {
      backgroundColor: colors.surface,
      marginHorizontal: spacing.base,
      marginVertical: spacing.xs,
      padding: spacing.base,
      borderRadius: borderRadius.lg,
      ...shadows.sm,
    },
    reviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    reviewerName: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
    },
    reviewDate: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    ratingText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginLeft: spacing.xs,
    },
    comment: {
      fontSize: fontSizes.base,
      color: colors.text,
      lineHeight: 22,
    },
    response: {
      backgroundColor: colors.background,
      padding: spacing.sm,
      borderRadius: borderRadius.base,
      marginTop: spacing.sm,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    responseLabel: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    responseText: {
      fontSize: fontSizes.sm,
      color: colors.text,
      lineHeight: 20,
    },
    addReviewForm: {
      backgroundColor: colors.surface,
      margin: spacing.base,
      padding: spacing.base,
      borderRadius: borderRadius.lg,
      ...shadows.sm,
    },
    formTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
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
      marginRight: spacing.base,
    },
    commentInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.base,
      padding: spacing.base,
      fontSize: fontSizes.base,
      color: colors.text,
      minHeight: 100,
      textAlignVertical: 'top',
      marginBottom: spacing.base,
      backgroundColor: colors.background,
    },
    formButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    submitButton: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: spacing.base,
      borderRadius: borderRadius.base,
      alignItems: 'center',
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.background,
      paddingVertical: spacing.base,
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
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    emptyIcon: {
      marginBottom: spacing.base,
    },
    emptyTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: spacing.base,
      fontSize: fontSizes.base,
      color: colors.textSecondary,
    },
  });

  useEffect(() => {
    if (id) {
      fetchReviews();
    }
  }, [id]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getProductReviews(id);
      setReviews(response.reviews || []);
      
      // Check if current user has already reviewed this product
      if (user && response.reviews) {
        const hasReviewed = response.reviews.some(review => review.userId === user.id);
        setUserHasReviewed(hasReviewed);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showAlert('Error', 'Failed to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReviews();
    setRefreshing(false);
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
        productId: id,
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
              size={interactive ? 28 : 18}
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

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title={`Reviews`}
          showBack={true}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={`Reviews`}
        showBack={true}
      />

      <View style={styles.header}>
        <Text style={styles.title}>All Reviews ({reviews.length})</Text>
        {canAddReview && (
          <TouchableOpacity
            style={styles.addReviewButton}
            onPress={() => setShowAddReview(true)}
          >
            <Text style={styles.addReviewText}>Add Review</Text>
          </TouchableOpacity>
        )}
      </View>

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
            placeholderTextColor={colors.textSecondary}
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

      <View style={styles.content}>
        {reviews.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons 
              name="star-outline" 
              size={64} 
              color={colors.textSecondary} 
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>No Reviews Yet</Text>
            <Text style={styles.emptyText}>
              Be the first to share your experience with this product!
            </Text>
          </View>
        ) : (
          <FlatList
            data={reviews}
            renderItem={renderReviewItem}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: spacing.xl }}
          />
        )}
      </View>

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
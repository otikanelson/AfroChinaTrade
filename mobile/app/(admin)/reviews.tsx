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
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/Header';
import { reviewService, Review } from '../../services/ReviewService';
import { AlertModal } from '../../components/ui/AlertModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { spacing } from '../../theme/spacing';

export default function AdminReviewsScreen() {
  const router = useRouter();
  const { colors, fontSizes, fontWeights, borderRadius } = useTheme();
  const { user, isAdmin } = useAuth();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'unflagged'>('all');
  const [responseModal, setResponseModal] = useState<{
    visible: boolean;
    review: Review | null;
    response: string;
    submitting: boolean;
  }>({
    visible: false,
    review: null,
    response: '',
    submitting: false,
  });
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
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

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
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      backgroundColor: colors.background,
      gap: spacing.sm,
    },
    filterButton: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterButtonText: {
      fontSize: fontSizes.sm,
      color: colors.text,
    },
    filterButtonTextActive: {
      color: colors.textInverse,
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
    flaggedCard: {
      borderLeftWidth: 4,
      borderLeftColor: colors.error,
    },
    reviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    reviewerInfo: {
      flex: 1,
    },
    reviewerName: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
    },
    reviewDate: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    flaggedBadge: {
      backgroundColor: colors.error,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: borderRadius.base,
    },
    flaggedText: {
      fontSize: fontSizes.xs,
      color: colors.textInverse,
      fontWeight: fontWeights.semibold,
    },
    productInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
      padding: spacing.xs,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.base,
    },
    productImage: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.base,
      marginRight: spacing.sm,
    },
    productName: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
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
      color: colors.text,
      marginBottom: spacing.sm,
      lineHeight: 20,
    },
    response: {
      backgroundColor: colors.surface,
      padding: spacing.sm,
      borderRadius: borderRadius.base,
      marginBottom: spacing.sm,
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
    actionButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    actionButton: {
      flex: 1,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.base,
      alignItems: 'center',
      borderWidth: 1,
    },
    respondButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    flagButton: {
      backgroundColor: colors.background,
      borderColor: colors.error,
    },
    unflagButton: {
      backgroundColor: colors.background,
      borderColor: colors.success,
    },
    deleteButton: {
      backgroundColor: colors.error,
      borderColor: colors.error,
    },
    actionButtonText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
    },
    respondButtonText: {
      color: colors.textInverse,
    },
    flagButtonText: {
      color: colors.error,
    },
    unflagButtonText: {
      color: colors.success,
    },
    deleteButtonText: {
      color: colors.textInverse,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      width: '90%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: spacing.base,
    },
    responseInput: {
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
    modalButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    modalButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.base,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    submitButton: {
      backgroundColor: colors.primary,
    },
    modalButtonText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
    },
    cancelButtonText: {
      color: colors.text,
    },
    submitButtonText: {
      color: colors.textInverse,
    },
  });

  const fetchReviews = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      const flaggedFilter = filter === 'all' ? undefined : filter === 'flagged';
      const response = await reviewService.getAllReviews(1, 50, flaggedFilter);
      setReviews(response.data || []);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    if (isAdmin) {
      fetchReviews();
    }
  }, [isAdmin, fetchReviews]);

  const handleRefresh = useCallback(() => {
    fetchReviews(true);
  }, [fetchReviews]);

  const handleFilterChange = (newFilter: 'all' | 'flagged' | 'unflagged') => {
    setFilter(newFilter);
  };

  const handleRespond = (review: Review) => {
    setResponseModal({
      visible: true,
      review,
      response: review.response || '',
      submitting: false,
    });
  };

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setAlertModal({
      visible: true,
      title,
      message,
      type,
    });
  };

  const showConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      visible: true,
      title,
      message,
      onConfirm,
    });
  };

  const handleSubmitResponse = async () => {
    if (!responseModal.review || !responseModal.response.trim()) {
      showAlert('Error', 'Please enter a response', 'error');
      return;
    }

    try {
      setResponseModal(prev => ({ ...prev, submitting: true }));
      
      await reviewService.addAdminResponse(
        responseModal.review._id,
        responseModal.response.trim()
      );

      setResponseModal({
        visible: false,
        review: null,
        response: '',
        submitting: false,
      });

      fetchReviews();
      showAlert('Success', 'Response added successfully', 'success');
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to add response', 'error');
    } finally {
      setResponseModal(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleFlag = async (review: Review) => {
    try {
      await reviewService.flagReview(review._id, !review.isFlagged);
      fetchReviews();
      showAlert(
        'Success',
        `Review ${review.isFlagged ? 'unflagged' : 'flagged'} successfully`,
        'success'
      );
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to update review', 'error');
    }
  };

  const handleDelete = (review: Review) => {
    showConfirmation(
      'Delete Review',
      'Are you sure you want to delete this review? This action cannot be undone.',
      async () => {
        try {
          await reviewService.deleteReview(review._id);
          fetchReviews();
          showAlert('Success', 'Review deleted successfully', 'success');
        } catch (error: any) {
          showAlert('Error', error.message || 'Failed to delete review', 'error');
        }
      }
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
    <View style={[styles.reviewCard, item.isFlagged && styles.flaggedCard]}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>{item.userName}</Text>
          <Text style={styles.reviewDate}>{formatDate(item.createdAt)}</Text>
        </View>
        {item.isFlagged && (
          <View style={styles.flaggedBadge}>
            <Text style={styles.flaggedText}>FLAGGED</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.productInfo}
        onPress={() => router.push(`/product-detail/${item.productId._id}`)}
      >
        <Image
          source={{ uri: item.productId.images[0] || 'https://via.placeholder.com/40' }}
          style={styles.productImage}
        />
        <Text style={styles.productName} numberOfLines={2}>
          {item.productId.name}
        </Text>
      </TouchableOpacity>
      
      {renderStars(item.rating)}
      
      {item.comment && <Text style={styles.comment}>{item.comment}</Text>}
      
      {item.response && (
        <View style={styles.response}>
          <Text style={styles.responseLabel}>Admin Response:</Text>
          <Text style={styles.responseText}>{item.response}</Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.respondButton]}
          onPress={() => handleRespond(item)}
        >
          <Text style={[styles.actionButtonText, styles.respondButtonText]}>
            {item.response ? 'Edit Response' : 'Respond'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.actionButton,
            item.isFlagged ? styles.unflagButton : styles.flagButton
          ]}
          onPress={() => handleFlag(item)}
        >
          <Text style={[
            styles.actionButtonText,
            item.isFlagged ? styles.unflagButtonText : styles.flagButtonText
          ]}>
            {item.isFlagged ? 'Unflag' : 'Flag'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [styles, colors, router]);

  const keyExtractor = useCallback((item: Review) => item._id, []);

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Header title="Reviews" showBack={true} />
        <View style={styles.centerContainer}>
          <Ionicons name="shield-outline" size={64} color={colors.error} />
          <Text style={styles.emptyTitle}>Access Denied</Text>
          <Text style={styles.emptySubtitle}>
            You need admin privileges to access this page
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Manage Reviews" showBack={true} />

      <View style={styles.filterContainer}>
        {(['all', 'unflagged', 'flagged'] as const).map((filterOption) => (
          <TouchableOpacity
            key={filterOption}
            style={[
              styles.filterButton,
              filter === filterOption && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterChange(filterOption)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === filterOption && styles.filterButtonTextActive,
              ]}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
          <Text style={styles.emptyTitle}>No reviews found</Text>
          <Text style={styles.emptySubtitle}>
            {filter === 'all' 
              ? 'No reviews have been submitted yet'
              : `No ${filter} reviews found`
            }
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

      <Modal
        visible={responseModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setResponseModal(prev => ({ ...prev, visible: false }))}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {responseModal.review?.response ? 'Edit Response' : 'Add Response'}
            </Text>
            
            <TextInput
              style={styles.responseInput}
              placeholder="Enter your response to this review..."
              placeholderTextColor={colors.textLight}
              value={responseModal.response}
              onChangeText={(text) =>
                setResponseModal(prev => ({ ...prev, response: text }))
              }
              multiline
              maxLength={500}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() =>
                  setResponseModal({
                    visible: false,
                    review: null,
                    response: '',
                    submitting: false,
                  })
                }
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmitResponse}
                disabled={responseModal.submitting}
              >
                {responseModal.submitting ? (
                  <ActivityIndicator size="small" color={colors.textInverse} />
                ) : (
                  <Text style={[styles.modalButtonText, styles.submitButtonText]}>
                    Submit
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AlertModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal(prev => ({ ...prev, visible: false }))}
      />

      <ConfirmationModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Delete"
        confirmButtonColor="error"
        icon="trash-outline"
        iconColor={colors.error}
        onConfirm={() => {
          confirmModal.onConfirm();
          setConfirmModal(prev => ({ ...prev, visible: false }));
        }}
        onCancel={() => setConfirmModal(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}
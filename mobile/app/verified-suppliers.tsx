import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator, Alert, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { supplierService } from '../services/SupplierService';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Supplier } from '../types/product';
import { spacing } from '../theme/spacing';


export default function SuppliersScreen() {
  console.log('🏪 Regular SuppliersScreen component loaded');
  const router = useRouter();
  const { fonts, fontSizes, colors, fontWeights, borderRadius } = useTheme();
  const { isAuthenticated } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: spacing.base,
    },
    supplierCard: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: spacing.base,
      marginBottom: spacing.base,
      borderWidth: 1,
      borderColor: colors.borderLight,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    supplierHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    supplierName: {
      fontSize: fontSizes.lg,
      fontFamily: fontWeights.semibold,
      color: colors.text,
      flex: 1,
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.success + '20',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 16,
    },
    verifiedText: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.medium,
      color: colors.success,
      marginLeft: spacing.xs,
    },
    supplierInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    infoText: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.regular,
      color: colors.textSecondary,
      marginLeft: spacing.sm,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingText: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.medium,
      color: colors.text,
      marginLeft: spacing.xs,
    },
    actionButtons: {
      flexDirection: 'row',
      marginTop: spacing.sm,
      gap: spacing.sm,
    },
    rateButton: {
      flex: 1,
      backgroundColor: colors.primary + '20',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.base,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    rateButtonText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: colors.primary,
    },
    viewButton: {
      flex: 1,
      backgroundColor: colors.surface,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.base,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    viewButtonText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: colors.text,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    loadingText: {
      marginTop: spacing.sm,
      fontSize: fontSizes.base,
      fontFamily: fonts.regular,
      color: colors.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      fontSize: fontSizes.lg,
      fontFamily: fonts.medium,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    emptySubtext: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.regular,
      color: colors.textLight,
      textAlign: 'center',
    },
    // Modal styles
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
      margin: spacing.lg,
      width: '90%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.base,
    },
    starsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: spacing.base,
      gap: spacing.sm,
    },
    star: {
      padding: spacing.xs,
    },
    commentInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      fontSize: fontSizes.base,
      color: colors.text,
      backgroundColor: colors.surface,
      minHeight: 80,
      textAlignVertical: 'top',
      marginBottom: spacing.base,
    },
    modalActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    modalButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      flex: 1,
    },
    modalButtonSecondary: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalButtonText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    modalButtonTextSecondary: {
      color: colors.text,
    },
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      // Get only verified suppliers using the backend filter
      const response = await supplierService.getSuppliers({ limit: 50, verified: true });
      
      if (response.success && response.data) {
        setSuppliers(response.data);
      } else {
        setSuppliers([]);
      }
    } catch (error) {
      console.error('Failed to load suppliers:', error);
      Alert.alert('Error', 'Failed to load suppliers. Please try again.');
      setSuppliers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSupplierPress = (supplier: Supplier) => {
    const supplierId = supplier._id || supplier.id;
    router.push({ 
      pathname: '/supplier-products/[id]', 
      params: { 
        id: supplierId,
        name: supplier.name 
      } 
    });
  };

  const handleRateSupplier = (supplier: Supplier) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to rate suppliers');
      return;
    }
    setSelectedSupplier(supplier);
    setRating(0);
    setComment('');
    setRatingModalVisible(true);
  };

  const submitRating = async () => {
    if (!selectedSupplier || rating === 0) {
      Alert.alert('Invalid Rating', 'Please select a rating from 1 to 5 stars');
      return;
    }

    try {
      setSubmittingRating(true);
      const supplierId = selectedSupplier._id || selectedSupplier.id;
      
      if (!supplierId) {
        Alert.alert('Error', 'Supplier ID not found');
        return;
      }
      
      const response = await supplierService.createSupplierReview(supplierId, {
        rating,
        comment: comment.trim() || undefined,
      });

      if (response.success) {
        Alert.alert('Success', 'Thank you for rating this supplier!');
        setRatingModalVisible(false);
        // Refresh suppliers to get updated ratings
        loadSuppliers();
      } else {
        Alert.alert('Error', response.error?.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Failed to submit rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onStarPress?: (star: number) => void) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      const filled = i <= rating;
      stars.push(
        <TouchableOpacity
          key={i}
          style={interactive ? styles.star : undefined}
          onPress={interactive && onStarPress ? () => onStarPress(i) : undefined}
          disabled={!interactive}
        >
          <Ionicons 
            name={filled ? "star" : "star-outline"} 
            size={interactive ? 24 : 14} 
            color={colors.warning} 
          />
        </TouchableOpacity>
      );
    }

    return stars;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header
          title="Verified Suppliers"
          showBack={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading suppliers...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Verified Suppliers"
        showBack={true}
        onBackPress={() => router.back()}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {suppliers.length > 0 ? (
            suppliers.map((supplier) => {
              const supplierId = supplier._id || supplier.id;
              return (
                <View key={supplierId} style={styles.supplierCard}>
                  <View style={styles.supplierHeader}>
                    <Text style={styles.supplierName}>{supplier.name}</Text>
                    {supplier.verified && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="shield-checkmark" size={16} color={colors.success} />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.supplierInfo}>
                    <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.infoText}>{supplier.location}</Text>
                  </View>

                  {supplier.responseTime && (
                    <View style={styles.supplierInfo}>
                      <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.infoText}>Response time: {supplier.responseTime}</Text>
                    </View>
                  )}

                  <View style={styles.supplierInfo}>
                    <View style={styles.ratingContainer}>
                      {renderStars(supplier.rating)}
                      <Text style={styles.ratingText}>
                        {supplier.rating.toFixed(1)} ({supplier.reviewCount || 0} reviews)
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.rateButton}
                      onPress={() => handleRateSupplier(supplier)}
                    >
                      <Text style={styles.rateButtonText}>Rate Supplier</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => handleSupplierPress(supplier)}
                    >
                      <Text style={styles.viewButtonText}>View Products</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No verified suppliers found</Text>
              <Text style={styles.emptySubtext}>
                Check back later for verified suppliers in your area
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Rating Modal */}
      <Modal
        visible={ratingModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRatingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Rate {selectedSupplier?.name}
            </Text>
            
            <View style={styles.starsContainer}>
              {renderStars(rating, true, setRating)}
            </View>
            
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment (optional)"
              placeholderTextColor={colors.textLight}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setRatingModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextSecondary]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={submitRating}
                disabled={rating === 0 || submittingRating}
              >
                {submittingRating ? (
                  <ActivityIndicator size="small" color={colors.textInverse} />
                ) : (
                  <Text style={styles.modalButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
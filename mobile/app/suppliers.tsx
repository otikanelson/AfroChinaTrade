import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { supplierService } from '../services/SupplierService';
import { useTheme } from '../contexts/ThemeContext';
import { Supplier } from '../types/product';
import { spacing } from '../theme/spacing';

export default function SuppliersScreen() {
  const router = useRouter();
  const { fonts, fontSizes, colors } = useTheme();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      fontFamily: fonts.semibold,
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

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={14} color={colors.warning} />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={14} color={colors.warning} />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={14} color={colors.textLight} />
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
                <TouchableOpacity
                  key={supplierId}
                  style={styles.supplierCard}
                  onPress={() => handleSupplierPress(supplier)}
                  activeOpacity={0.7}
                >
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
                        {supplier.rating.toFixed(1)} rating
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
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
    </View>
  );
}
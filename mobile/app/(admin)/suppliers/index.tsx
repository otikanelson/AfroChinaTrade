import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../../components/Header';
import { SearchBar } from '../../../components/SearchBar';
import { supplierService } from '../../../services/SupplierService';
import { useTheme } from '../../../contexts/ThemeContext';
import { Supplier } from '../../../types/product';

export default function AdminSuppliersScreen() {
  console.log('🔧 Admin SuppliersScreen component loaded');
  const router = useRouter();
  const { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } = useTheme();
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    content: {
      flex: 1,
    },
    searchContainer: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
    },
    addButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      margin: spacing.base,
      gap: spacing.sm,
    },
    addButtonText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    supplierCard: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      marginHorizontal: spacing.base,
      marginVertical: spacing.xs,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.base,
    },
    logoContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.surface,
      marginRight: spacing.base,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    logo: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    logoPlaceholder: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.primary,
    },
    supplierInfo: {
      flex: 1,
    },
    supplierHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    supplierName: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      flex: 1,
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.success + '20',
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
      marginLeft: spacing.xs,
    },
    verifiedText: {
      fontSize: fontSizes.xs,
      color: colors.success,
      marginLeft: 2,
    },
    unverifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.warning + '20',
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
      marginLeft: spacing.xs,
    },
    unverifiedText: {
      fontSize: fontSizes.xs,
      color: colors.warning,
      marginLeft: 2,
    },
    supplierDetails: {
      gap: 2,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    detailText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginLeft: spacing.xs,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginLeft: spacing.xs,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: spacing.sm,
    },
    actionButton: {
      padding: spacing.xs,
      borderRadius: borderRadius.sm,
      marginLeft: spacing.xs,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierService.getSuppliers({ limit: 100 });
      
      if (response.success && response.data) {
        setSuppliers(response.data);
      } else {
        setSuppliers([]);
      }
    } catch (error) {
      console.error('Failed to load suppliers:', error);
      Alert.alert('Error', 'Failed to load suppliers');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSuppliers();
    setRefreshing(false);
  }, []);

  const handleAddSupplier = () => {
    router.push({
      pathname: '/(admin)/suppliers/[id]',
      params: { id: 'new' }
    });
  };

  const handleEditSupplier = (supplier: Supplier) => {
    const supplierId = supplier._id || supplier.id;
    
    if (!supplierId) {
      Alert.alert('Error', 'Supplier ID not found');
      return;
    }
    
    router.push({
      pathname: '/(admin)/suppliers/[id]',
      params: { id: supplierId }
    });
  };

  const handleToggleVerification = async (supplier: Supplier) => {
    try {
      const supplierId = supplier._id || supplier.id;
      
      if (!supplierId) {
        Alert.alert('Error', 'Supplier ID not found');
        return;
      }
      
      const newVerifiedStatus = !supplier.verified;
      
      Alert.alert(
        newVerifiedStatus ? 'Verify Supplier' : 'Unverify Supplier',
        `Are you sure you want to ${newVerifiedStatus ? 'verify' : 'unverify'} ${supplier.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: newVerifiedStatus ? 'Verify' : 'Unverify',
            onPress: async () => {
              const response = await supplierService.updateSupplier(supplierId, {
                verified: newVerifiedStatus
              });
              
              if (response.success) {
                setSuppliers(prev => 
                  prev.map(s => 
                    (s._id || s.id) === supplierId 
                      ? { ...s, verified: newVerifiedStatus }
                      : s
                  )
                );
                Alert.alert('Success', `Supplier ${newVerifiedStatus ? 'verified' : 'unverified'} successfully`);
              } else {
                Alert.alert('Error', 'Failed to update supplier verification');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to toggle verification:', error);
      Alert.alert('Error', 'Failed to update supplier verification');
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    supplier.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSupplier = ({ item: supplier }: { item: Supplier }) => {
    const getInitials = (name: string) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
      <View style={styles.supplierCard}>
        <View style={styles.cardContent}>
          <View style={styles.logoContainer}>
            {supplier.logo ? (
              <Image source={{ uri: supplier.logo }} style={styles.logo} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>{getInitials(supplier.name)}</Text>
              </View>
            )}
          </View>

          <View style={styles.supplierInfo}>
            <View style={styles.supplierHeader}>
              <Text style={styles.supplierName}>{supplier.name}</Text>
              {supplier.verified ? (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={12} color={colors.success} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              ) : (
                <View style={styles.unverifiedBadge}>
                  <Ionicons name="shield-outline" size={12} color={colors.warning} />
                  <Text style={styles.unverifiedText}>Pending</Text>
                </View>
              )}
            </View>

            <View style={styles.supplierDetails}>
              {supplier.email && (
                <View style={styles.detailRow}>
                  <Ionicons name="mail-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{supplier.email}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.detailText}>{supplier.location}</Text>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color={colors.warning} />
                  <Text style={styles.ratingText}>
                    {supplier.rating.toFixed(1)} ({supplier.reviewCount || 0} reviews)
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              onPress={() => handleEditSupplier(supplier)}
            >
              <Ionicons name="pencil" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { 
                backgroundColor: supplier.verified ? colors.warning + '20' : colors.success + '20' 
              }]}
              onPress={() => handleToggleVerification(supplier)}
            >
              <Ionicons 
                name={supplier.verified ? "shield-outline" : "shield-checkmark"} 
                size={18} 
                color={supplier.verified ? colors.warning : colors.success} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Suppliers"
        subtitle="Manage supplier accounts"
        showBack={true}
        onBackPress={() => router.back()}
      />

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search suppliers..."
          />
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddSupplier}
        >
          <Ionicons name="add" size={20} color={colors.textInverse} />
          <Text style={styles.addButtonText}>Add New Supplier</Text>
        </TouchableOpacity>

        <FlatList
          data={filteredSuppliers}
          renderItem={renderSupplier}
          keyExtractor={(item) => (item._id || item.id || item.name)}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No suppliers match your search' : 'No suppliers found'}
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}
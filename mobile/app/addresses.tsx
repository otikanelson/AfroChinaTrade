import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { tokenManager } from '../services/api/tokenManager';
import { API_BASE_URL } from '../constants/config';
import { useTheme } from '../contexts/ThemeContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { CustomModal } from '../components/ui/CustomModal';

interface Address {
  _id?: string;
  type?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  landmark?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
}

export default function AddressesScreen() {
  // Require authentication
  const { isAuthenticated } = useRequireAuth('Please sign in to manage your addresses');
  
  const router = useRouter();
  const { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } = useTheme();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: spacing.xs,
    },
    headerTitle: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: colors.text,
      flex: 1,
      textAlign: 'center',
      marginHorizontal: spacing.base,
    },
    addButton: {
      padding: spacing.xs,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    loadingText: {
      marginTop: spacing.sm,
      fontSize: fontSizes.base,
      color: colors.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
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
    addAddressButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
    },
    addAddressButtonText: {
      color: colors.background,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    addressesList: {
      flex: 1,
      paddingHorizontal: spacing.base,
      paddingTop: spacing.base,
    },
    addressCard: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      marginBottom: spacing.sm,
      ...shadows.sm,
    },
    addressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    addressTypeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    addressType: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginLeft: spacing.sm,
    },
    defaultBadge: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.base,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      marginLeft: spacing.sm,
    },
    defaultBadgeText: {
      fontSize: fontSizes.xs,
      color: colors.background,
      fontWeight: fontWeights.bold,
    },
    addressActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    actionButton: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    actionButtonText: {
      fontSize: fontSizes.xs,
      color: colors.primary,
      fontWeight: fontWeights.medium,
    },
    deleteButton: {
      padding: spacing.sm,
    },
    addressDetails: {
      gap: spacing.xs,
    },
    addressName: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
    },
    addressText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    deleteModalText: {
      fontSize: fontSizes.base,
      color: colors.text,
      marginBottom: spacing.xl,
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: spacing.sm,
    },
    deleteModalButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
      width: '100%',
    },
    deleteModalButton: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
    },
    deleteModalCancelButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    deleteModalConfirmButton: {
      backgroundColor: colors.error || '#EF4444',
    },
    deleteModalButtonText: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold || '600',
    },
    deleteModalCancelText: {
      color: colors.text,
    },
    deleteModalConfirmText: {
      color: '#FFFFFF',
    },
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const fetchAddresses = async () => {
    const token = await tokenManager.getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/addresses`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.status === 'success') {
        setAddresses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAddresses();
  };

  const setDefaultAddress = async (addressId: string) => {
    const token = await tokenManager.getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/addresses/${addressId}/set-default`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status === 'success') {
        fetchAddresses();
      }
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const deleteAddress = async (addressId: string) => {
    setAddressToDelete(addressId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!addressToDelete) return;

    const token = await tokenManager.getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/addresses/${addressToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status === 'success') {
        fetchAddresses();
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    } finally {
      setShowDeleteModal(false);
      setAddressToDelete(null);
    }
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return 'home-outline';
      case 'work':
        return 'business-outline';
      default:
        return 'location-outline';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Addresses</Text>
        <TouchableOpacity 
          onPress={() => router.push('/addresses/new-address')} 
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No delivery addresses</Text>
          <Text style={styles.emptySubtitle}>
            Add a delivery address to place orders
          </Text>
          <TouchableOpacity
            style={styles.addAddressButton}
            onPress={() => router.push('/addresses/new-address')}
          >
            <Text style={styles.addAddressButtonText}>Add Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.addressesList} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {addresses.map((address, index) => (
            <View key={address._id || index} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <View style={styles.addressTypeContainer}>
                  <Ionicons 
                    name="location-outline"
                    size={20} 
                    color={colors.primary} 
                  />
                  <Text style={styles.addressType}>
                    {address.type ? address.type.charAt(0).toUpperCase() + address.type.slice(1) : 'Address'}
                  </Text>
                  {address.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.addressActions}>
                  {!address.isDefault && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => setDefaultAddress(address._id!)}
                    >
                      <Text style={styles.actionButtonText}>Set Default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push(`/addresses/${address._id}`)}
                  >
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteAddress(address._id!)}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.addressDetails}>
                <Text style={styles.addressText}>
                  {address.addressLine1}
                </Text>
                {address.addressLine2 && (
                  <Text style={styles.addressText}>
                    {address.addressLine2}
                  </Text>
                )}
                <Text style={styles.addressText}>
                  {address.city}, {address.state}
                  {address.postalCode ? ` ${address.postalCode}` : ''}
                </Text>
                <Text style={styles.addressText}>{address.country}</Text>
                {address.landmark && (
                  <Text style={styles.addressText}>📍 {address.landmark}</Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <CustomModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Address"
        size="small"
        position="center"
        scrollable={false}
      >
        <>
          <Text style={styles.deleteModalText}>
            Are you sure you want to delete this address?
          </Text>
          <View style={styles.deleteModalButtons}>
            <TouchableOpacity
              style={[styles.deleteModalButton, styles.deleteModalCancelButton]}
              onPress={() => setShowDeleteModal(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.deleteModalButtonText, styles.deleteModalCancelText]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteModalButton, styles.deleteModalConfirmButton]}
              onPress={confirmDelete}
              activeOpacity={0.7}
            >
              <Text style={[styles.deleteModalButtonText, styles.deleteModalConfirmText]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </>
      </CustomModal>
    </SafeAreaView>
  );
}
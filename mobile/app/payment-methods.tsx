import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { tokenManager } from '../services/api/tokenManager';
import { API_BASE_URL } from '../constants/config';
import { useTheme } from '../contexts/ThemeContext';

interface PaymentMethod {
  _id: string;
  type: 'card' | 'mobile_money' | 'bank_transfer' | 'paypal';
  isDefault: boolean;
  cardDetails?: {
    last4: string;
    brand: string;
    holderName: string;
  };
  mobileMoneyDetails?: {
    provider: string;
    phoneNumber: string;
    accountName: string;
  };
}

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } = useTheme();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

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
    addPaymentButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
    },
    addPaymentButtonText: {
      color: colors.background,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    methodsList: {
      flex: 1,
      paddingHorizontal: spacing.base,
      paddingTop: spacing.base,
    },
    methodCard: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      marginBottom: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...shadows.sm,
    },
    methodInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    methodIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    methodDetails: {
      flex: 1,
    },
    methodTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    defaultBadge: {
      fontSize: fontSizes.xs,
      color: colors.primary,
      fontWeight: fontWeights.bold,
    },
    methodActions: {
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
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    const token = await tokenManager.getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/payment-methods`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setPaymentMethods(data.data);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const setDefaultPaymentMethod = async (methodId: string) => {
    const token = await tokenManager.getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/payment-methods/${methodId}/default`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setPaymentMethods(prev => 
          prev.map(method => ({
            ...method,
            isDefault: method._id === methodId
          }))
        );
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
    }
  };

  const deletePaymentMethod = async (methodId: string) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const token = await tokenManager.getAccessToken();
            if (!token) return;

            try {
              const response = await fetch(`${API_BASE_URL}/payment-methods/${methodId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
              });

              const data = await response.json();
              if (data.success) {
                setPaymentMethods(prev => prev.filter(method => method._id !== methodId));
              }
            } catch (error) {
              console.error('Error deleting payment method:', error);
            }
          },
        },
      ]
    );
  };

  const getPaymentMethodDisplay = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
        return method.cardDetails
          ? `${method.cardDetails.brand} •••• ${method.cardDetails.last4}`
          : 'Credit/Debit Card';
      case 'mobile_money':
        return method.mobileMoneyDetails
          ? `${method.mobileMoneyDetails.provider} - ${method.mobileMoneyDetails.phoneNumber}`
          : 'Mobile Money';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'paypal':
        return 'PayPal';
      default:
        return (method.type as string).replace('_', ' ').toUpperCase();
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return 'card-outline';
      case 'mobile_money':
        return 'phone-portrait-outline';
      case 'bank_transfer':
        return 'business-outline';
      case 'paypal':
        return 'logo-paypal';
      default:
        return 'wallet-outline';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity 
          onPress={() => router.push('/payment-methods/new')} 
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading payment methods...</Text>
        </View>
      ) : paymentMethods.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="card-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No payment methods</Text>
          <Text style={styles.emptySubtitle}>
            Add a payment method to make purchases easier
          </Text>
          <TouchableOpacity
            style={styles.addPaymentButton}
            onPress={() => router.push('/payment-methods/new')}
          >
            <Text style={styles.addPaymentButtonText}>Add Payment Method</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.methodsList} showsVerticalScrollIndicator={false}>
          {paymentMethods.map((method) => (
            <View key={method._id} style={styles.methodCard}>
              <View style={styles.methodInfo}>
                <View style={styles.methodIcon}>
                  <Ionicons 
                    name={getPaymentMethodIcon(method.type) as any} 
                    size={24} 
                    color={colors.primary} 
                  />
                </View>
                <View style={styles.methodDetails}>
                  <Text style={styles.methodTitle}>
                    {getPaymentMethodDisplay(method)}
                  </Text>
                  {method.isDefault && (
                    <Text style={styles.defaultBadge}>Default</Text>
                  )}
                </View>
              </View>
              
              <View style={styles.methodActions}>
                {!method.isDefault && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setDefaultPaymentMethod(method._id)}
                  >
                    <Text style={styles.actionButtonText}>Set Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deletePaymentMethod(method._id)}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
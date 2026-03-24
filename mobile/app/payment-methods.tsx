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
import { useRouter } from 'expo-router';
import { tokenManager } from '../services/api/tokenManager';
import { API_BASE_URL } from '../constants/config';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/ui/Toast';
import { useRequireAuth } from '../hooks/useRequireAuth';

interface PaymentMethod {
  _id?: string;
  type: 'card' | 'mobile_money' | 'bank_transfer' | 'paypal';
  cardDetails?: {
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
    holderName: string;
  };
  mobileMoneyDetails?: {
    provider: string;
    phoneNumber: string;
    accountName: string;
  };
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    routingNumber?: string;
  };
  paypalDetails?: {
    email: string;
  };
  isDefault: boolean;
  isActive?: boolean;
}

export default function PaymentMethodsScreen() {
  // Require authentication
  const { isAuthenticated } = useRequireAuth('Please sign in to manage your payment methods');
  
  const router = useRouter();
  const { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } = useTheme();
  const toast = useToast();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
    addMethodButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
    },
    addMethodButtonText: {
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
      marginBottom: spacing.base,
      ...shadows.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    methodTypeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    methodType: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
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
    methodActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    actionButton: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.background,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 32,
    },
    actionButtonText: {
      fontSize: fontSizes.sm,
      color: colors.primary,
      fontWeight: fontWeights.medium,
    },
    methodDetails: {
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    methodPrimaryText: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      lineHeight: 22,
    },
    methodText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      lineHeight: 20,
    },
  });

  const fetchPaymentMethods = React.useCallback(async (isRefresh: boolean = false) => {
    const token = await tokenManager.getAccessToken();
    if (!token) return;

    try {
      if (!isRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_BASE_URL}/payment-methods`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      if (data.success) {
        setMethods(data.data || []);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching payment methods:', error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentMethods(false);
  }, [fetchPaymentMethods]);

  const onRefresh = React.useCallback(() => {
    fetchPaymentMethods(true);
  }, [fetchPaymentMethods]);

  const setDefaultMethod = async (methodId: string) => {
    const token = await tokenManager.getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/payment-methods/${methodId}/set-default`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        fetchPaymentMethods();
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
    }
  };

  const deleteMethod = async (methodId: string) => {
    // Show confirmation using toast
    toast.warning('Delete this payment method?', 3000);
    
    const token = await tokenManager.getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/payment-methods/${methodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Payment method deleted');
        fetchPaymentMethods();
      } else {
        toast.error('Failed to delete payment method');
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Error deleting payment method');
    }
  };

  const getMethodIcon = (type: string) => {
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

  const getMethodLabel = (type: string) => {
    switch (type) {
      case 'card':
        return 'Credit/Debit Card';
      case 'mobile_money':
        return 'Mobile Money';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'paypal':
        return 'PayPal';
      default:
        return 'Payment Method';
    }
  };

  const getMethodDetails = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
        if (method.cardDetails) {
          const { last4, brand, holderName, expiryMonth, expiryYear } = method.cardDetails;
          return {
            primary: `${brand?.toUpperCase() || 'Card'} •••• ${last4 || '****'}`,
            secondary: holderName || 'Cardholder',
            tertiary: expiryMonth && expiryYear ? `Expires ${expiryMonth}/${expiryYear}` : null,
          };
        }
        return { primary: 'Credit/Debit Card', secondary: null, tertiary: null };
      
      case 'mobile_money':
        if (method.mobileMoneyDetails) {
          const { provider, phoneNumber, accountName } = method.mobileMoneyDetails;
          return {
            primary: provider || 'Mobile Money',
            secondary: phoneNumber || 'Phone number',
            tertiary: accountName || null,
          };
        }
        return { primary: 'Mobile Money', secondary: null, tertiary: null };
      
      case 'bank_transfer':
        if (method.bankDetails) {
          const { bankName, accountNumber, accountName } = method.bankDetails;
          return {
            primary: bankName || 'Bank Transfer',
            secondary: accountNumber ? `Account •••• ${accountNumber.slice(-4)}` : 'Account number',
            tertiary: accountName || null,
          };
        }
        return { primary: 'Bank Transfer', secondary: null, tertiary: null };
      
      case 'paypal':
        if (method.paypalDetails) {
          return {
            primary: 'PayPal',
            secondary: method.paypalDetails.email || 'Email address',
            tertiary: null,
          };
        }
        return { primary: 'PayPal', secondary: null, tertiary: null };
      
      default:
        return { primary: 'Payment Method', secondary: null, tertiary: null };
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
      ) : methods.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="wallet-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No payment methods</Text>
          <Text style={styles.emptySubtitle}>
            Add a payment method to complete your purchases
          </Text>
          <TouchableOpacity
            style={styles.addMethodButton}
            onPress={() => router.push('/payment-methods/new')}
          >
            <Text style={styles.addMethodButtonText}>Add Payment Method</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.methodsList} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          removeClippedSubviews={true}
        >
          {methods.map((method) => {
            const details = getMethodDetails(method);
            return (
              <View key={method._id} style={styles.methodCard}>
                <View style={styles.methodTypeContainer}>
                  <Ionicons 
                    name={getMethodIcon(method.type) as any}
                    size={28} 
                    color={colors.primary} 
                  />
                  <View style={{ flex: 1, marginLeft: spacing.sm }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Text style={styles.methodType}>{getMethodLabel(method.type)}</Text>
                      {method.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                
                <View style={styles.methodDetails}>
                  <Text style={styles.methodPrimaryText}>{details.primary}</Text>
                  {details.secondary && (
                    <Text style={styles.methodText}>{details.secondary}</Text>
                  )}
                  {details.tertiary && (
                    <Text style={styles.methodText}>{details.tertiary}</Text>
                  )}
                </View>

                <View style={styles.methodActions}>
                  {!method.isDefault && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => setDefaultMethod(method._id!)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionButtonText}>Set Default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push(`/payment-methods/${method._id}`)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { borderColor: colors.error }]}
                    onPress={() => deleteMethod(method._id!)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Toast Component */}
      <Toast {...toast} />
    </SafeAreaView>
  );
}

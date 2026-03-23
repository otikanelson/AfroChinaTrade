import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { tokenManager } from '../../services/api/tokenManager';
import { API_BASE_URL } from '../../constants/config';
import { useTheme } from '../../contexts/ThemeContext';
import { useAlertContext } from '../../contexts/AlertContext';

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

export default function EditPaymentMethodScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const alert = useAlertContext();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [method, setMethod] = useState<PaymentMethod | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
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
      marginLeft: spacing.base,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.base,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    formGroup: {
      marginBottom: spacing.base,
    },
    label: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: colors.text,
      marginBottom: spacing.xs,
      marginStart: spacing.xs,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      fontSize: fontSizes.base,
      color: colors.text,
    },
    disabledInput: {
      backgroundColor: colors.surface,
      color: colors.textSecondary,
    },
    infoBox: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      marginBottom: spacing.base,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    infoText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
      marginLeft: spacing.xs,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: borderRadius.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    checkboxLabel: {
      fontSize: fontSizes.base,
      color: colors.text,
    },
    footer: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.base,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: spacing.sm,
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    submitButtonText: {
      color: colors.background,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
    },
    cancelButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    cancelButtonText: {
      color: colors.text,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
    },
  });

  useEffect(() => {
    fetchPaymentMethod();
  }, [id]);

  const fetchPaymentMethod = async () => {
    const token = await tokenManager.getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/payment-methods/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setMethod(data.data);
      } else {
        Alert.alert('Error', 'Failed to load payment method');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching payment method:', error);
      Alert.alert('Error', 'Failed to load payment method');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!method) return;

    setSaving(true);
    const token = await tokenManager.getAccessToken();
    if (!token) {
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/payment-methods/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isDefault: method.isDefault,
          // Include other editable fields based on type
          ...(method.type === 'card' && method.cardDetails && {
            cardDetails: {
              holderName: method.cardDetails.holderName,
            },
          }),
          ...(method.type === 'mobile_money' && method.mobileMoneyDetails && {
            mobileMoneyDetails: {
              accountName: method.mobileMoneyDetails.accountName,
              phoneNumber: method.mobileMoneyDetails.phoneNumber,
            },
          }),
          ...(method.type === 'bank_transfer' && method.bankDetails && {
            bankDetails: {
              accountName: method.bankDetails.accountName,
            },
          }),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert.showSuccess('Success', 'Payment method updated successfully', 2000);
        setTimeout(() => router.back(), 2000);
      } else {
        Alert.alert('Error', data.message || 'Failed to update payment method');
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      Alert.alert('Error', 'Failed to update payment method');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Payment Method</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!method) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Payment Method</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.base }}>
            <Ionicons 
              name={getMethodIcon(method.type) as any}
              size={32} 
              color={colors.primary} 
            />
            <Text style={[styles.sectionTitle, { marginBottom: 0, marginLeft: spacing.sm }]}>
              {getMethodLabel(method.type)}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              For security reasons, sensitive payment information cannot be edited. 
              You can only update the account holder name and set as default.
            </Text>
          </View>

          {method.type === 'card' && method.cardDetails && (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Card Number</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={`${method.cardDetails.brand?.toUpperCase() || 'Card'} •••• ${method.cardDetails.last4}`}
                  editable={false}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Expiry Date</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={`${method.cardDetails.expiryMonth}/${method.cardDetails.expiryYear}`}
                  editable={false}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Cardholder Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter cardholder name"
                  placeholderTextColor={colors.textSecondary}
                  value={method.cardDetails.holderName}
                  onChangeText={(text) => setMethod({
                    ...method,
                    cardDetails: { ...method.cardDetails!, holderName: text }
                  })}
                />
              </View>
            </>
          )}

          {method.type === 'mobile_money' && method.mobileMoneyDetails && (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Provider</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={method.mobileMoneyDetails.provider}
                  editable={false}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter phone number"
                  placeholderTextColor={colors.textSecondary}
                  value={method.mobileMoneyDetails.phoneNumber}
                  onChangeText={(text) => setMethod({
                    ...method,
                    mobileMoneyDetails: { ...method.mobileMoneyDetails!, phoneNumber: text }
                  })}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Account Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter account name"
                  placeholderTextColor={colors.textSecondary}
                  value={method.mobileMoneyDetails.accountName}
                  onChangeText={(text) => setMethod({
                    ...method,
                    mobileMoneyDetails: { ...method.mobileMoneyDetails!, accountName: text }
                  })}
                />
              </View>
            </>
          )}

          {method.type === 'bank_transfer' && method.bankDetails && (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Bank Name</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={method.bankDetails.bankName}
                  editable={false}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Account Number</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={`•••• ${method.bankDetails.accountNumber.slice(-4)}`}
                  editable={false}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Account Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter account name"
                  placeholderTextColor={colors.textSecondary}
                  value={method.bankDetails.accountName}
                  onChangeText={(text) => setMethod({
                    ...method,
                    bankDetails: { ...method.bankDetails!, accountName: text }
                  })}
                />
              </View>
            </>
          )}

          {method.type === 'paypal' && method.paypalDetails && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>PayPal Email</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={method.paypalDetails.email}
                editable={false}
              />
            </View>
          )}

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[
                styles.checkbox,
                method.isDefault && styles.checkboxActive
              ]}
              onPress={() => setMethod({ ...method, isDefault: !method.isDefault })}
            >
              {method.isDefault && (
                <Ionicons name="checkmark" size={16} color={colors.background} />
              )}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Set as default payment method</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.submitButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

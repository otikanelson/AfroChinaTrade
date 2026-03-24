import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { tokenManager } from '../../services/api/tokenManager';
import { API_BASE_URL } from '../../constants/config';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../hooks/useToast';
import { CustomModal } from '../../components/ui/CustomModal';
import { Toast } from '../../components/ui/Toast';

type PaymentType = 'card' | 'mobile_money' | 'bank_transfer' | 'paypal';

interface FormData {
  type: PaymentType;
  cardDetails?: {
    cardNumber: string;
    cardholderName: string;
    expiryDate: string;
    cvv: string;
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
}

const MOBILE_MONEY_PROVIDERS = ['MTN Mobile Money', 'Airtel Money', 'Vodafone Cash', 'Glo Mobile Money'];
const BANKS = ['Access Bank', 'GTBank', 'First Bank', 'UBA', 'Zenith Bank', 'FCMB', 'Stanbic IBTC'];

export default function NewPaymentMethodScreen() {
  const router = useRouter();
  const { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } = useTheme();
  const toast = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    type: 'card',
    isDefault: false,
    cardDetails: {
      cardNumber: '',
      cardholderName: '',
      expiryDate: '',
      cvv: '',
    },
    mobileMoneyDetails: {
      provider: '',
      phoneNumber: '',
      accountName: '',
    },
    bankDetails: {
      bankName: '',
      accountNumber: '',
      accountName: '',
      routingNumber: '',
    },
    paypalDetails: {
      email: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [providerSearch, setProviderSearch] = useState('');
  const [bankSearch, setBankSearch] = useState('');

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
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    typeSelector: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.lg,
      flexWrap: 'wrap',
    },
    typeButton: {
      flex: 1,
      minWidth: '45%',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.base,
      borderRadius: borderRadius.md,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      gap: spacing.xs,
    },
    typeButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },
    typeButtonIcon: {
      fontSize: fontSizes.lg,
    },
    typeButtonText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: colors.text,
    },
    formGroup: {
      marginBottom: spacing.base,
    },
    label: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: colors.text,
      marginBottom: spacing.xs,
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
    pickerButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pickerButtonText: {
      fontSize: fontSizes.base,
      color: colors.text,
    },
    pickerButtonPlaceholder: {
      color: colors.textSecondary,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
    },
    modalSearchInput: {
      marginHorizontal: spacing.base,
      marginVertical: spacing.sm,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      fontSize: fontSizes.base,
      color: colors.text,
    },
    modalItem: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalItemText: {
      fontSize: fontSizes.base,
      color: colors.text,
    },
  });

  const handleTypeSelect = (type: PaymentType) => {
    setFormData({ ...formData, type });
  };

  const handleSubmit = async () => {
    // Validate based on type
    if (formData.type === 'card') {
      if (!formData.cardDetails?.cardNumber || !formData.cardDetails?.cardholderName || 
          !formData.cardDetails?.expiryDate || !formData.cardDetails?.cvv) {
        toast.error('Please fill in all card details');
        return;
      }
    } else if (formData.type === 'mobile_money') {
      if (!formData.mobileMoneyDetails?.provider || !formData.mobileMoneyDetails?.phoneNumber || 
          !formData.mobileMoneyDetails?.accountName) {
        toast.error('Please fill in all mobile money details');
        return;
      }
    } else if (formData.type === 'bank_transfer') {
      if (!formData.bankDetails?.bankName || !formData.bankDetails?.accountNumber || 
          !formData.bankDetails?.accountName) {
        toast.error('Please fill in all bank details');
        return;
      }
    } else if (formData.type === 'paypal') {
      if (!formData.paypalDetails?.email) {
        toast.error('Please enter your PayPal email');
        return;
      }
    }

    setLoading(true);
    const token = await tokenManager.getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/payment-methods`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formData.type,
          cardDetails: formData.type === 'card' ? formData.cardDetails : undefined,
          mobileMoneyDetails: formData.type === 'mobile_money' ? formData.mobileMoneyDetails : undefined,
          bankDetails: formData.type === 'bank_transfer' ? formData.bankDetails : undefined,
          paypalDetails: formData.type === 'paypal' ? formData.paypalDetails : undefined,
          isDefault: formData.isDefault,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Payment method added successfully');
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        toast.error(data.message || 'Failed to add payment method');
      }
    } catch (error) {
      console.error('Error creating payment method:', error);
      toast.error('Failed to create payment method');
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = MOBILE_MONEY_PROVIDERS.filter(p =>
    p.toLowerCase().includes(providerSearch.toLowerCase())
  );

  const filteredBanks = BANKS.filter(b =>
    b.toLowerCase().includes(bankSearch.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Payment Method</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Type</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, formData.type === 'card' && styles.typeButtonActive]}
              onPress={() => handleTypeSelect('card')}
            >
              <Ionicons name="card-outline" size={24} color={colors.primary} />
              <Text style={styles.typeButtonText}>Card</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, formData.type === 'mobile_money' && styles.typeButtonActive]}
              onPress={() => handleTypeSelect('mobile_money')}
            >
              <Ionicons name="phone-portrait-outline" size={24} color={colors.primary} />
              <Text style={styles.typeButtonText}>Mobile Money</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, formData.type === 'bank_transfer' && styles.typeButtonActive]}
              onPress={() => handleTypeSelect('bank_transfer')}
            >
              <Ionicons name="business-outline" size={24} color={colors.primary} />
              <Text style={styles.typeButtonText}>Bank</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, formData.type === 'paypal' && styles.typeButtonActive]}
              onPress={() => handleTypeSelect('paypal')}
            >
              <Ionicons name="logo-paypal" size={24} color={colors.primary} />
              <Text style={styles.typeButtonText}>PayPal</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Details */}
        {formData.type === 'card' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Card Details</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Card Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={colors.textSecondary}
                value={formData.cardDetails?.cardNumber}
                onChangeText={(text) => setFormData({
                  ...formData,
                  cardDetails: { ...formData.cardDetails!, cardNumber: text }
                })}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Cardholder Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={colors.textSecondary}
                value={formData.cardDetails?.cardholderName}
                onChangeText={(text) => setFormData({
                  ...formData,
                  cardDetails: { ...formData.cardDetails!, cardholderName: text }
                })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Expiry Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                placeholderTextColor={colors.textSecondary}
                value={formData.cardDetails?.expiryDate}
                onChangeText={(text) => setFormData({
                  ...formData,
                  cardDetails: { ...formData.cardDetails!, expiryDate: text }
                })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>CVV *</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                placeholderTextColor={colors.textSecondary}
                value={formData.cardDetails?.cvv}
                onChangeText={(text) => setFormData({
                  ...formData,
                  cardDetails: { ...formData.cardDetails!, cvv: text }
                })}
                keyboardType="numeric"
                secureTextEntry
              />
            </View>
          </View>
        )}

        {/* Mobile Money Details */}
        {formData.type === 'mobile_money' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mobile Money Details</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Provider *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowProviderModal(true)}
              >
                <Text style={[
                  styles.pickerButtonText,
                  !formData.mobileMoneyDetails?.provider && styles.pickerButtonPlaceholder
                ]}>
                  {formData.mobileMoneyDetails?.provider || 'Select provider'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="0701234567"
                placeholderTextColor={colors.textSecondary}
                value={formData.mobileMoneyDetails?.phoneNumber}
                onChangeText={(text) => setFormData({
                  ...formData,
                  mobileMoneyDetails: { ...formData.mobileMoneyDetails!, phoneNumber: text }
                })}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Account Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={colors.textSecondary}
                value={formData.mobileMoneyDetails?.accountName}
                onChangeText={(text) => setFormData({
                  ...formData,
                  mobileMoneyDetails: { ...formData.mobileMoneyDetails!, accountName: text }
                })}
              />
            </View>
          </View>
        )}

        {/* Bank Details */}
        {formData.type === 'bank_transfer' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bank Details</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Bank Name *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowBankModal(true)}
              >
                <Text style={[
                  styles.pickerButtonText,
                  !formData.bankDetails?.bankName && styles.pickerButtonPlaceholder
                ]}>
                  {formData.bankDetails?.bankName || 'Select bank'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Account Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="0123456789"
                placeholderTextColor={colors.textSecondary}
                value={formData.bankDetails?.accountNumber}
                onChangeText={(text) => setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails!, accountNumber: text }
                })}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Account Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={colors.textSecondary}
                value={formData.bankDetails?.accountName}
                onChangeText={(text) => setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails!, accountName: text }
                })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Routing Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Optional"
                placeholderTextColor={colors.textSecondary}
                value={formData.bankDetails?.routingNumber}
                onChangeText={(text) => setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails!, routingNumber: text }
                })}
              />
            </View>
          </View>
        )}

        {/* PayPal Details */}
        {formData.type === 'paypal' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PayPal Details</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>PayPal Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={colors.textSecondary}
                value={formData.paypalDetails?.email}
                onChangeText={(text) => setFormData({
                  ...formData,
                  paypalDetails: { ...formData.paypalDetails!, email: text }
                })}
                keyboardType="email-address"
              />
            </View>
          </View>
        )}

        {/* Default Checkbox */}
        <View style={styles.section}>
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[
                styles.checkbox,
                formData.isDefault && styles.checkboxActive
              ]}
              onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
            >
              {formData.isDefault && (
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
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.submitButtonText}>Add Payment Method</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Provider Modal */}
      <CustomModal
        visible={showProviderModal}
        title="Select Provider"
        onClose={() => setShowProviderModal(false)}
        size="medium"
        position="bottom"
      >
        <TextInput
          style={styles.modalSearchInput}
          placeholder="Search providers..."
          placeholderTextColor={colors.textSecondary}
          value={providerSearch}
          onChangeText={setProviderSearch}
        />
        <FlatList
          data={filteredProviders}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setFormData({
                  ...formData,
                  mobileMoneyDetails: { ...formData.mobileMoneyDetails!, provider: item }
                });
                setShowProviderModal(false);
                setProviderSearch('');
              }}
            >
              <Text style={styles.modalItemText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </CustomModal>

      {/* Bank Modal */}
      <CustomModal
        visible={showBankModal}
        title="Select Bank"
        onClose={() => setShowBankModal(false)}
        size="medium"
        position="bottom"
      >
        <TextInput
          style={styles.modalSearchInput}
          placeholder="Search banks..."
          placeholderTextColor={colors.textSecondary}
          value={bankSearch}
          onChangeText={setBankSearch}
        />
        <FlatList
          data={filteredBanks}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails!, bankName: item }
                });
                setShowBankModal(false);
                setBankSearch('');
              }}
            >
              <Text style={styles.modalItemText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </CustomModal>

      {/* Toast Component */}
      <Toast {...toast} />
    </SafeAreaView>
  );
}

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { Header } from '../../components/Header';
import { Button } from '../../components/admin/Button';
import { orderService } from '../../services/OrderService';
import { refundService } from '../../services/RefundService';
import { Order } from '../../types/product';
import { mobileToastManager } from '../../utils/toast';

export default function RefundRequestScreen() {
  const { isAuthenticated } = useRequireAuth('Please sign in to request a refund');
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { colors, fontSizes, fontWeights, borderRadius, spacing } = useTheme();
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    content: {
      flex: 1,
      padding: spacing.base,
    },
    orderCard: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      marginBottom: spacing.base,
    },
    orderTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    orderInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    orderLabel: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    orderValue: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: colors.text,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    typeContainer: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.base,
    },
    typeButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.base,
      borderRadius: borderRadius.md,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
    },
    typeButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    typeButtonText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: colors.textSecondary,
    },
    typeButtonTextActive: {
      color: colors.primary,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      fontSize: fontSizes.base,
      color: colors.text,
      backgroundColor: colors.background,
      marginBottom: spacing.base,
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    amountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: colors.background,
      marginBottom: spacing.base,
    },
    currencySymbol: {
      paddingLeft: spacing.base,
      fontSize: fontSizes.base,
      color: colors.textSecondary,
    },
    amountInput: {
      flex: 1,
      padding: spacing.base,
      fontSize: fontSizes.base,
      color: colors.text,
    },
    maxAmount: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      marginBottom: spacing.base,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      marginTop: spacing.sm,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    errorText: {
      fontSize: fontSizes.base,
      color: colors.error,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
  });

  useEffect(() => {
    if (isAuthenticated && orderId) {
      fetchOrder();
    }
  }, [isAuthenticated, orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderById(orderId!);
      
      if (response.success && response.data) {
        setOrder(response.data);
        setAmount(response.data.totalAmount.toString());
      } else {
        Alert.alert('Error', 'Order not found');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      Alert.alert('Error', 'Failed to load order details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!order) return;

    if (!reason.trim()) {
      Alert.alert('Error', 'Please provide a reason for the refund');
      return;
    }

    if (refundType === 'partial') {
      const refundAmount = parseFloat(amount);
      if (isNaN(refundAmount) || refundAmount <= 0) {
        Alert.alert('Error', 'Please enter a valid refund amount');
        return;
      }
      if (refundAmount > order.totalAmount) {
        Alert.alert('Error', 'Refund amount cannot exceed order total');
        return;
      }
    }

    try {
      setSubmitting(true);
      
      const response = await refundService.createRefundRequest({
        orderId: order._id,
        type: refundType,
        amount: refundType === 'full' ? order.totalAmount : parseFloat(amount),
        reason: reason.trim(),
      });

      if (response.success) {
        mobileToastManager.success('Refund request submitted successfully');
        router.push('/refunds');
      } else {
        Alert.alert('Error', response.error?.message || 'Failed to submit refund request');
      }
    } catch (error) {
      console.error('Error submitting refund request:', error);
      Alert.alert('Error', 'Failed to submit refund request');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Request Refund" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Header title="Request Refund" showBack />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>Order not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Request Refund" showBack />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Details */}
        <View style={styles.orderCard}>
          <Text style={styles.orderTitle}>Order #{order.orderId}</Text>
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Total Amount:</Text>
            <Text style={styles.orderValue}>₦{order.totalAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Status:</Text>
            <Text style={[styles.orderValue, { color: colors.success }]}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Text>
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Items:</Text>
            <Text style={styles.orderValue}>{order.items.length} item(s)</Text>
          </View>
        </View>

        {/* Refund Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Refund Type</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                refundType === 'full' && styles.typeButtonActive,
              ]}
              onPress={() => {
                setRefundType('full');
                setAmount(order.totalAmount.toString());
              }}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  refundType === 'full' && styles.typeButtonTextActive,
                ]}
              >
                Full Refund
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                refundType === 'partial' && styles.typeButtonActive,
              ]}
              onPress={() => {
                setRefundType('partial');
                setAmount('');
              }}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  refundType === 'partial' && styles.typeButtonTextActive,
                ]}
              >
                Partial Refund
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount (for partial refunds) */}
        {refundType === 'partial' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Refund Amount</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>₦</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={colors.textLight}
                keyboardType="decimal-pad"
              />
            </View>
            <Text style={styles.maxAmount}>
              Maximum refund amount: ₦{order.totalAmount.toLocaleString()}
            </Text>
          </View>
        )}

        {/* Reason */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reason for Refund</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={reason}
            onChangeText={setReason}
            placeholder="Please describe why you're requesting a refund..."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Submit Button */}
        <Button
          label={submitting ? 'Submitting...' : 'Submit Refund Request'}
          onPress={handleSubmit}
          disabled={submitting}
          style={{ marginBottom: spacing.xl }}
        />
      </ScrollView>
    </View>
  );
}
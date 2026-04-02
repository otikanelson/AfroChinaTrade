import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { StatusBadge, StatusType } from './StatusBadge';

export interface OrderCardData {
  _id: string;
  orderId: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  deliveryAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  createdAt: string;
}

interface OrderCardProps {
  order: OrderCardData;
  onPress: () => void;
  showRefundButton?: boolean;
  onRefundPress?: () => void;
  refundStatus?: 'pending' | 'approved' | 'processed' | 'rejected';
}

function orderStatusToBadge(status: OrderCardData['status']): StatusType {
  switch (status) {
    case 'pending':     return 'pending';
    case 'processing':  return 'accepted';
    case 'shipped':     return 'shipped';
    case 'delivered':   return 'delivered';
    case 'cancelled':   return 'failed';
    default:            return 'pending';
  }
}

function statusLabel(status: OrderCardData['status']): string {
  switch (status) {
    case 'pending':     return 'Pending';
    case 'processing':  return 'Accepted';
    case 'shipped':     return 'Shipped';
    case 'delivered':   return 'Delivered';
    case 'cancelled':   return 'Cancelled';
    default:            return status;
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  onPress, 
  showRefundButton = false,
  onRefundPress,
  refundStatus,
}) => {
  const { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } = useTheme();

  const getRefundBadge = () => {
    switch (refundStatus) {
      case 'pending':   return { label: 'Refund Pending',   color: '#f59e0b' };
      case 'approved':  return { label: 'Refund Approved',  color: '#3b82f6' };
      case 'processed': return { label: 'Refund Processed', color: '#10b981' };
      case 'rejected':  return { label: 'Refund Rejected',  color: '#ef4444' };
      default: return null;
    }
  };

  const refundBadge = getRefundBadge();
  
  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginVertical: spacing.sm,
      ...shadows.md,
      elevation: 2,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardInfo: {
      flex: 1,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    orderId: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold as any,
      color: colors.text,
    },
    address: {
      fontSize: fontSizes.md,
      color: colors.textSecondary,
      fontWeight: fontWeights.medium as any,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
    },
    date: {
      fontSize: fontSizes.xs,
      color: colors.textLight,
    },
    amount: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.bold as any,
      color: colors.primary,
    },
    chevron: {
      marginLeft: spacing.md,
      flexShrink: 0,
      opacity: 0.6,
    },
    refundButton: {
      marginTop: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      borderColor: colors.error,
      alignSelf: 'flex-start',
    },
    refundButtonText: {
      fontSize: fontSizes.sm,
      color: colors.error,
      fontWeight: fontWeights.medium as any,
    },
  });

  const addressText = order.deliveryAddress?.street || 
                     order.deliveryAddress?.city || 
                     'No address';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <View style={styles.topRow}>
            <Text style={styles.orderId} numberOfLines={1}>
              #{order.orderId.slice(-8).toUpperCase()}
            </Text>
            <StatusBadge
              status={orderStatusToBadge(order.status)}
              label={statusLabel(order.status)}
              size="sm"
            />
          </View>
          <Text style={styles.address} numberOfLines={1}>
            {addressText}
          </Text>
          <View style={styles.bottomRow}>
            <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
            <Text style={styles.amount}>₦{order.totalAmount.toFixed(2)}</Text>
          </View>
          {showRefundButton && order.status === 'delivered' && (
            refundBadge ? (
              <View style={[styles.refundButton, { borderColor: refundBadge.color }]}>
                <Text style={[styles.refundButtonText, { color: refundBadge.color }]}>
                  {refundBadge.label}
                </Text>
              </View>
            ) : onRefundPress ? (
              <TouchableOpacity 
                style={styles.refundButton} 
                onPress={(e) => {
                  e.stopPropagation();
                  onRefundPress();
                }}
                accessibilityRole="button"
                accessibilityLabel="Process refund"
              >
                <Text style={styles.refundButtonText}>Refund</Text>
              </TouchableOpacity>
            ) : null
          )}
        </View>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.textLight}
          style={styles.chevron}
        />
      </View>
    </TouchableOpacity>
  );
};

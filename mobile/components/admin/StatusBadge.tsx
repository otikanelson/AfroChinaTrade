import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

// Core status types from requirements
export type StatusType =
  // Generic statuses (Req 1.1, 2.1, 4.7, 6.9)
  | 'pending'
  | 'active'
  | 'completed'
  | 'failed'
  | 'blocked'
  // Order lifecycle statuses (Req 2.1, 2.2)
  | 'accepted'
  | 'in_fulfillment'
  | 'shipped'
  | 'delivered'
  // Financial statuses (Req 4.7)
  | 'refunded'
  // User account statuses (Req 6.9)
  | 'suspended'
  // Moderation statuses (Req 5.4)
  | 'resolved'
  | 'dismissed';

interface StatusConfig {
  label: string;
  backgroundColor: string;
  textColor: string;
}

const STATUS_CONFIG: Record<StatusType, StatusConfig> = {
  pending: {
    label: 'Pending',
    backgroundColor: '#FEF3C7',
    textColor: '#92400E',
  },
  active: {
    label: 'Active',
    backgroundColor: '#D1FAE5',
    textColor: '#065F46',
  },
  completed: {
    label: 'Completed',
    backgroundColor: '#D1FAE5',
    textColor: '#065F46',
  },
  failed: {
    label: 'Failed',
    backgroundColor: '#FEE2E2',
    textColor: '#991B1B',
  },
  blocked: {
    label: 'Blocked',
    backgroundColor: '#FEE2E2',
    textColor: '#991B1B',
  },
  accepted: {
    label: 'Accepted',
    backgroundColor: '#DBEAFE',
    textColor: '#1E40AF',
  },
  in_fulfillment: {
    label: 'In Fulfillment',
    backgroundColor: '#E0E7FF',
    textColor: '#3730A3',
  },
  shipped: {
    label: 'Shipped',
    backgroundColor: '#DBEAFE',
    textColor: '#1E40AF',
  },
  delivered: {
    label: 'Delivered',
    backgroundColor: '#D1FAE5',
    textColor: '#065F46',
  },
  refunded: {
    label: 'Refunded',
    backgroundColor: '#FEF3C7',
    textColor: '#92400E',
  },
  suspended: {
    label: 'Suspended',
    backgroundColor: '#FED7AA',
    textColor: '#9A3412',
  },
  resolved: {
    label: 'Resolved',
    backgroundColor: '#D1FAE5',
    textColor: '#065F46',
  },
  dismissed: {
    label: 'Dismissed',
    backgroundColor: '#F3F4F6',
    textColor: '#374151',
  },
};

export type BadgeSize = 'sm' | 'md' | 'lg';

interface StatusBadgeProps {
  status: StatusType;
  /** Override the display label */
  label?: string;
  size?: BadgeSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  style,
  textStyle,
  testID,
}) => {
  const { borderRadius, spacing, fontSizes, fontWeights } = useTheme();
  
  const config = STATUS_CONFIG[status];
  const displayLabel = label ?? config.label;

  const styles = StyleSheet.create({
    badge: {
      alignSelf: 'flex-start',
      borderRadius: borderRadius.full,
      overflow: 'hidden',
    },
    text: {
      fontWeight: fontWeights.semibold as TextStyle['fontWeight'],
    },
    // Size variants
    sm: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    smText: {
      fontSize: fontSizes.xs,
    },
    md: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    mdText: {
      fontSize: fontSizes.sm,
    },
    lg: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
    },
    lgText: {
      fontSize: fontSizes.base,
    },
  });

  return (
    <View
      style={[
        styles.badge,
        styles[size],
        { backgroundColor: config.backgroundColor },
        style,
      ]}
      testID={testID}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Status: ${displayLabel}`}
    >
      <Text
        style={[
          styles.text,
          styles[`${size}Text`],
          { color: config.textColor },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {displayLabel}
      </Text>
    </View>
  );
};



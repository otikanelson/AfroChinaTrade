import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../theme';

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
    backgroundColor: '#FFF3CD',
    textColor: '#856404',
  },
  active: {
    label: 'Active',
    backgroundColor: '#D4EDDA',
    textColor: '#155724',
  },
  completed: {
    label: 'Completed',
    backgroundColor: '#D4EDDA',
    textColor: '#155724',
  },
  failed: {
    label: 'Failed',
    backgroundColor: '#F8D7DA',
    textColor: '#721C24',
  },
  blocked: {
    label: 'Blocked',
    backgroundColor: '#F8D7DA',
    textColor: '#721C24',
  },
  accepted: {
    label: 'Accepted',
    backgroundColor: '#CCE5FF',
    textColor: '#004085',
  },
  in_fulfillment: {
    label: 'In Fulfillment',
    backgroundColor: '#E2D9F3',
    textColor: '#4A235A',
  },
  shipped: {
    label: 'Shipped',
    backgroundColor: '#CCE5FF',
    textColor: '#004085',
  },
  delivered: {
    label: 'Delivered',
    backgroundColor: '#D4EDDA',
    textColor: '#155724',
  },
  refunded: {
    label: 'Refunded',
    backgroundColor: '#FFF3CD',
    textColor: '#856404',
  },
  suspended: {
    label: 'Suspended',
    backgroundColor: '#FFE5B4',
    textColor: '#7D4E00',
  },
  resolved: {
    label: 'Resolved',
    backgroundColor: '#D4EDDA',
    textColor: '#155724',
  },
  dismissed: {
    label: 'Dismissed',
    backgroundColor: '#E2E3E5',
    textColor: '#383D41',
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
  const config = STATUS_CONFIG[status];
  const displayLabel = label ?? config.label;

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

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  text: {
    fontWeight: theme.fontWeights.semibold as TextStyle['fontWeight'],
    letterSpacing: theme.letterSpacing.wide,
  },
  // Size variants
  sm: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  smText: {
    fontSize: theme.fontSizes.xs,
  },
  md: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  mdText: {
    fontSize: theme.fontSizes.sm,
  },
  lg: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
  },
  lgText: {
    fontSize: theme.fontSizes.base,
  },
});

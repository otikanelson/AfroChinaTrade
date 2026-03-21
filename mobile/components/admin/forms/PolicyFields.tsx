import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FormField } from './FormField';
import { theme } from '../../../theme';

interface PolicyData {
  paymentPolicy?: string;
  shippingPolicy?: string;
  refundPolicy?: string;
  guidelines?: string;
  suggestions?: string;
}

interface PolicyFieldsProps {
  label: string;
  policies: PolicyData;
  onPoliciesChange: (policies: PolicyData) => void;
  helperText?: string;
  testID?: string;
}

export const PolicyFields: React.FC<PolicyFieldsProps> = ({
  label,
  policies,
  onPoliciesChange,
  helperText,
  testID,
}) => {
  const updatePolicy = (field: keyof PolicyData, value: string) => {
    onPoliciesChange({
      ...policies,
      [field]: value,
    });
  };

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.label}>{label}</Text>
      {helperText && <Text style={styles.helperText}>{helperText}</Text>}

      <View style={styles.fieldsContainer}>
        <FormField
          label="Payment Policy"
          value={policies.paymentPolicy || ''}
          onChangeText={(value) => updatePolicy('paymentPolicy', value)}
          placeholder="e.g., Payment due within 30 days, Credit cards accepted..."
          multiline
          numberOfLines={3}
          helperText="Describe your payment terms and accepted methods"
        />

        <FormField
          label="Shipping Policy"
          value={policies.shippingPolicy || ''}
          onChangeText={(value) => updatePolicy('shippingPolicy', value)}
          placeholder="e.g., Free shipping over $50, Ships within 2-3 business days..."
          multiline
          numberOfLines={3}
          helperText="Explain shipping costs, timeframes, and coverage areas"
        />

        <FormField
          label="Refund Policy"
          value={policies.refundPolicy || ''}
          onChangeText={(value) => updatePolicy('refundPolicy', value)}
          placeholder="e.g., 30-day return policy, Items must be in original condition..."
          multiline
          numberOfLines={3}
          helperText="Detail your return and refund conditions"
        />

        <FormField
          label="Product Guidelines"
          value={policies.guidelines || ''}
          onChangeText={(value) => updatePolicy('guidelines', value)}
          placeholder="e.g., Care instructions, Usage recommendations, Safety warnings..."
          multiline
          numberOfLines={3}
          helperText="Provide usage instructions or care guidelines"
        />

        <FormField
          label="Additional Suggestions"
          value={policies.suggestions || ''}
          onChangeText={(value) => updatePolicy('suggestions', value)}
          placeholder="e.g., Best used with..., Recommended for..., Tips for optimal use..."
          multiline
          numberOfLines={3}
          helperText="Share helpful tips or product recommendations"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  helperText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.base,
  },
  fieldsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
});
import React from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ViewStyle,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../../theme';

export interface SwitchFieldProps {
  /** Field label displayed next to the switch */
  label: string;
  /** Current toggle value */
  value: boolean;
  /** Called when the user toggles the switch */
  onValueChange: (value: boolean) => void;
  /** Optional description text shown below the label */
  description?: string;
  /** Disable the switch */
  disabled?: boolean;
  /** Container style override */
  style?: ViewStyle;
  testID?: string;
}

export const SwitchField: React.FC<SwitchFieldProps> = ({
  label,
  value,
  onValueChange,
  description,
  disabled = false,
  style,
  testID,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => !disabled && onValueChange(!value)}
      activeOpacity={0.7}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked: value, disabled }}
      testID={testID}
    >
      {/* Text side */}
      <View style={styles.textContainer}>
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {label}
        </Text>
        {description ? (
          <Text
            style={[styles.description, disabled && styles.descriptionDisabled]}
            testID={testID ? `${testID}-description` : undefined}
          >
            {description}
          </Text>
        ) : null}
      </View>

      {/* Switch control */}
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: theme.colors.borderLight,
          true: theme.colors.primary,
        }}
        thumbColor={
          Platform.OS === 'android'
            ? value
              ? theme.colors.background
              : theme.colors.surface
            : undefined
        }
        ios_backgroundColor={theme.colors.borderLight}
        accessibilityElementsHidden
        importantForAccessibility="no"
        testID={testID ? `${testID}-switch` : undefined}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.base,
    minHeight: 44,
  },
  textContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  labelDisabled: {
    color: theme.colors.textLight,
  },
  description: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  descriptionDisabled: {
    color: theme.colors.textLight,
  },
});

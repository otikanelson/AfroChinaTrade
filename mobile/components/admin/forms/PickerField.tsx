import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ViewStyle,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme';

export interface PickerOption {
  label: string;
  value: string;
}

export interface PickerFieldProps {
  /** Field label displayed above the picker */
  label: string;
  /** Currently selected value */
  value: string;
  /** Called when the user selects an option */
  onValueChange: (value: string) => void;
  /** Available options */
  options: PickerOption[];
  /** Placeholder text shown when no value is selected */
  placeholder?: string;
  /** Error message */
  error?: string;
  /** Helper text shown below when there is no error */
  helperText?: string;
  /** Whether the field is required – appends * to the label */
  required?: boolean;
  /** Disable the picker */
  disabled?: boolean;
  /** Container style override */
  style?: ViewStyle;
  testID?: string;
}

export const PickerField: React.FC<PickerFieldProps> = ({
  label,
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  error,
  helperText,
  required = false,
  disabled = false,
  style,
  testID,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const hasError = Boolean(error);

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;
  const hasValue = Boolean(selectedOption);

  const handleSelect = (option: PickerOption) => {
    onValueChange(option.value);
    setModalVisible(false);
  };

  const openPicker = () => {
    if (!disabled) setModalVisible(true);
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Label */}
      <Text style={[styles.label, disabled && styles.labelDisabled]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      {/* Trigger button */}
      <TouchableOpacity
        style={[
          styles.trigger,
          hasError && styles.triggerError,
          disabled && styles.triggerDisabled,
        ]}
        onPress={openPicker}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${label}${required ? ', required' : ''}`}
        accessibilityHint={`Currently: ${displayLabel}. Tap to change.`}
        accessibilityState={{ disabled }}
        testID={testID ? `${testID}-trigger` : undefined}
      >
        <Text
          style={[styles.triggerText, !hasValue && styles.placeholderText, disabled && styles.triggerTextDisabled]}
          numberOfLines={1}
        >
          {displayLabel}
        </Text>
        <Ionicons
          name="chevron-down"
          size={18}
          color={disabled ? theme.colors.textLight : theme.colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Error / helper text */}
      {hasError ? (
        <View style={styles.messageRow}>
          <Ionicons
            name="alert-circle-outline"
            size={14}
            color={theme.colors.error}
            style={styles.messageIcon}
          />
          <Text
            style={styles.errorText}
            accessibilityRole="alert"
            testID={testID ? `${testID}-error` : undefined}
          >
            {error}
          </Text>
        </View>
      ) : helperText ? (
        <Text
          style={styles.helperText}
          testID={testID ? `${testID}-helper` : undefined}
        >
          {helperText}
        </Text>
      ) : null}

      {/* Modal picker (cross-platform) */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        testID={testID ? `${testID}-modal` : undefined}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
          accessibilityRole="button"
          accessibilityLabel="Close picker"
        />
        <SafeAreaView style={styles.sheet}>
          {/* Sheet header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close"
              testID={testID ? `${testID}-close` : undefined}
            >
              <Ionicons name="close" size={22} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Options list */}
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => {
              const isSelected = item.value === value;
              return (
                <TouchableOpacity
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => handleSelect(item)}
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={item.label}
                  testID={testID ? `${testID}-option-${item.value}` : undefined}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {item.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContent}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.base,
  },
  label: {
    ...theme.typography.bodySmall,
    fontWeight: theme.fontWeights.semibold as '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  labelDisabled: {
    color: theme.colors.textLight,
  },
  required: {
    color: theme.colors.error,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.base,
    backgroundColor: theme.colors.input,
    paddingHorizontal: theme.spacing.md,
    minHeight: 44,
    paddingVertical: theme.spacing.sm,
  },
  triggerError: {
    borderColor: theme.colors.error,
    backgroundColor: '#FFF8F8',
  },
  triggerDisabled: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderLight,
  },
  triggerText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.xs,
  },
  placeholderText: {
    color: theme.colors.textLight,
  },
  triggerTextDisabled: {
    color: theme.colors.textLight,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  messageIcon: {
    marginRight: 4,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    flex: 1,
  },
  helperText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  // Modal styles
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    maxHeight: '60%',
    ...theme.shadows.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  sheetTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: theme.spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 44,
  },
  optionSelected: {
    backgroundColor: `${theme.colors.primary}10`,
  },
  optionText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.semibold as '600',
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginHorizontal: theme.spacing.lg,
  },
});

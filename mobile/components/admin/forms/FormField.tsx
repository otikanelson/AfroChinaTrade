import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme';

export interface FormFieldProps {
  /** Field label displayed above the input */
  label: string;
  /** Current value */
  value: string;
  /** Change handler */
  onChangeText: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Error message – when set the field renders in error state */
  error?: string;
  /** Helper text shown below the input when there is no error */
  helperText?: string;
  /** Render as a multiline textarea */
  multiline?: boolean;
  /** Number of visible lines when multiline is true */
  numberOfLines?: number;
  /** Keyboard type forwarded to TextInput */
  keyboardType?: TextInputProps['keyboardType'];
  /** Hide characters (password fields) */
  secureTextEntry?: boolean;
  /** Whether the field is required – appends * to the label */
  required?: boolean;
  /** Disable the input */
  disabled?: boolean;
  /** Auto-capitalisation forwarded to TextInput */
  autoCapitalize?: TextInputProps['autoCapitalize'];
  /** Auto-correct forwarded to TextInput */
  autoCorrect?: boolean;
  /** Return key type */
  returnKeyType?: TextInputProps['returnKeyType'];
  /** Called when the return key is pressed */
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  /** Called when the field gains focus */
  onFocus?: () => void;
  /** Called when the field loses focus */
  onBlur?: () => void;
  /** Max character length */
  maxLength?: number;
  /** Container style override */
  style?: ViewStyle;
  /** Input style override */
  inputStyle?: TextStyle;
  testID?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  multiline = false,
  numberOfLines = 4,
  keyboardType = 'default',
  secureTextEntry = false,
  required = false,
  disabled = false,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  returnKeyType,
  onSubmitEditing,
  onFocus,
  onBlur,
  maxLength,
  style,
  inputStyle,
  testID,
}) => {
  const [focused, setFocused] = React.useState(false);
  const [secure, setSecure] = React.useState(secureTextEntry);
  const inputRef = useRef<TextInput>(null);

  const hasError = Boolean(error);

  const handleFocus = () => {
    setFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
    onBlur?.();
  };

  const inputContainerStyle = [
    styles.inputContainer,
    focused && styles.inputContainerFocused,
    hasError && styles.inputContainerError,
    disabled && styles.inputContainerDisabled,
    multiline && styles.inputContainerMultiline,
  ].filter(Boolean);

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Label */}
      <Text
        style={[styles.label, disabled && styles.labelDisabled]}
        accessibilityRole="text"
      >
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      {/* Input row */}
      <View style={inputContainerStyle}>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            disabled && styles.inputDisabled,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textLight}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          keyboardType={keyboardType}
          secureTextEntry={secure}
          editable={!disabled}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={maxLength}
          accessibilityLabel={label}
          accessibilityHint={placeholder}
          accessibilityState={{ disabled }}
          testID={testID ? `${testID}-input` : undefined}
          textAlignVertical={multiline ? 'top' : 'center'}
        />

        {/* Secure entry toggle */}
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setSecure((s) => !s)}
            style={styles.eyeButton}
            accessibilityRole="button"
            accessibilityLabel={secure ? 'Show password' : 'Hide password'}
            testID={testID ? `${testID}-eye` : undefined}
          >
            <Ionicons
              name={secure ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.base,
  },
  label: {
    ...theme.typography.bodySmall,
    fontWeight: theme.fontWeights.semibold as TextStyle['fontWeight'],
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  labelDisabled: {
    color: theme.colors.textLight,
  },
  required: {
    color: theme.colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.base,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
  },
  inputContainerFocused: {
    borderColor: theme.colors.primary,
  },
  inputContainerError: {
    borderColor: theme.colors.error,
    backgroundColor: '#FFF8F8',
  },
  inputContainerDisabled: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderLight,
  },
  inputContainerMultiline: {
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
    minHeight: 44,
    paddingVertical: theme.spacing.sm,
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: theme.spacing.xs,
  },
  inputDisabled: {
    color: theme.colors.textLight,
  },
  eyeButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
});

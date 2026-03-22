import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { formatNigerianPhone, validateNigerianPhone, getPhoneValidationError, NIGERIA_COUNTRY_CODE } from '../utils/phoneUtils';

interface PhoneInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  style?: any;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder = "Enter your phone number",
  required = false,
  disabled = false,
  style,
}) => {
  const { colors, fonts, fontSizes, spacing } = useTheme();
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    labelContainer: {
      flexDirection: 'row',
      marginBottom: spacing.xs,
    },
    label: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.medium,
      color: colors.text,
    },
    required: {
      color: colors.error,
      marginLeft: 2,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: error ? colors.error : focused ? colors.primary : colors.border,
      borderRadius: 8,
      backgroundColor: disabled ? colors.surface : colors.background,
      overflow: 'hidden',
    },
    countryCode: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.md,
      backgroundColor: colors.surface,
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    countryCodeText: {
      fontSize: fontSizes.base,
      fontFamily: fonts.medium,
      color: colors.text,
    },
    input: {
      flex: 1,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.md,
      fontSize: fontSizes.base,
      fontFamily: fonts.regular,
      color: disabled ? colors.textSecondary : colors.text,
    },
    errorText: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.regular,
      color: colors.error,
      marginTop: spacing.xs,
    },
    helperText: {
      fontSize: fontSizes.xs,
      fontFamily: fonts.regular,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
  });

  // Initialize with +234 if empty
  useEffect(() => {
    if (!value || value === '') {
      onChangeText(NIGERIA_COUNTRY_CODE);
    }
  }, []); // Remove value dependency to prevent loops

  const handleTextChange = (text: string) => {
    // Only allow digits and limit to 10 characters
    const digits = text.replace(/\D/g, '').substring(0, 10);
    
    // Build the full phone number
    const fullPhone = `+234${digits}`;
    
    onChangeText(fullPhone);
    
    // Only validate and set error on blur or when we have some input
    if (digits.length > 0) {
      const validationError = getPhoneValidationError(fullPhone);
      setError(validationError);
    } else {
      setError(null);
    }
  };

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
    // Final validation on blur
    const validationError = getPhoneValidationError(value);
    setError(validationError);
  };

  // Get the local number part (after +234)
  const getLocalNumber = () => {
    if (value.startsWith('+234')) {
      return value.substring(4);
    }
    return '';
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}>*</Text>}
      </View>
      
      <View style={styles.inputContainer}>
        <View style={styles.countryCode}>
          <Text style={styles.countryCodeText}>+234</Text>
        </View>
        
        <TextInput
          style={styles.input}
          value={getLocalNumber()}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="8012345678"
          placeholderTextColor={colors.textLight}
          keyboardType="phone-pad"
          maxLength={10}
          editable={!disabled}
          selectTextOnFocus={!disabled}
        />
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      {!error && !focused && (
        <Text style={styles.helperText}>
          Enter your Nigerian mobile number (starts with 7, 8, or 9)
        </Text>
      )}
    </View>
  );
};
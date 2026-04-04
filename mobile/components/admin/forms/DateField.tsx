import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';

interface DateFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  testID?: string;
}

export const DateField: React.FC<DateFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder = "YYYY-MM-DD",
  helperText,
  error,
  required = false,
  testID,
}) => {
  const { colors, fonts, fontSizes, spacing, borderRadius } = useTheme();
  const [focused, setFocused] = useState(false);

  const formatDateInput = (text: string): string => {
    // Remove all non-numeric characters
    const numbers = text.replace(/\D/g, '');
    
    // Limit to 8 digits (YYYYMMDD)
    const limitedNumbers = numbers.slice(0, 8);
    
    // Add hyphens at appropriate positions
    let formatted = limitedNumbers;
    if (limitedNumbers.length >= 5) {
      formatted = `${limitedNumbers.slice(0, 4)}-${limitedNumbers.slice(4, 6)}-${limitedNumbers.slice(6)}`;
    } else if (limitedNumbers.length >= 3) {
      formatted = `${limitedNumbers.slice(0, 4)}-${limitedNumbers.slice(4)}`;
    }
    
    return formatted;
  };

  const handleTextChange = (text: string) => {
    const formatted = formatDateInput(text);
    onChangeText(formatted);
  };

  const validateDate = (dateString: string): boolean => {
    if (!dateString || dateString.length !== 10) return false;
    
    const date = new Date(dateString);
    const [year, month, day] = dateString.split('-').map(Number);
    
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day &&
      year >= 2020 && // Reasonable minimum year
      year <= 2050    // Reasonable maximum year
    );
  };

  const isValidDate = value ? validateDate(value) : true;
  const showError = error || (!isValidDate && value.length === 10);

  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing.base,
    },
    labelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    label: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.medium,
      color: colors.text,
    },
    required: {
      color: colors.error || '#EF4444',
      marginLeft: 2,
    },
    inputContainer: {
      borderWidth: 1,
      borderColor: showError ? (colors.error || '#EF4444') : focused ? colors.primary : colors.border,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.background,
    },
    input: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      fontSize: fontSizes.base,
      fontFamily: fonts.regular,
      color: colors.text,
      minHeight: 48,
    },
    helperText: {
      fontSize: fontSizes.xs,
      fontFamily: fonts.regular,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    errorText: {
      fontSize: fontSizes.xs,
      fontFamily: fonts.regular,
      color: colors.error || '#EF4444',
      marginTop: spacing.xs,
    },
    validationHint: {
      fontSize: fontSizes.xs,
      fontFamily: fonts.regular,
      color: colors.textLight,
      marginTop: spacing.xs,
      fontStyle: 'italic',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}>*</Text>}
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          keyboardType="numeric"
          maxLength={10}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          testID={testID}
        />
      </View>
      
      {showError && (
        <Text style={styles.errorText}>
          {error || 'Please enter a valid date (YYYY-MM-DD)'}
        </Text>
      )}
      
      {helperText && !showError && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
      
      {!showError && !helperText && (
        <Text style={styles.validationHint}>
          Format: YYYY-MM-DD (e.g., 2024-12-31)
        </Text>
      )}
    </View>
  );
};
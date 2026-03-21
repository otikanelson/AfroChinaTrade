import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { theme } from '../../theme';

export interface SearchBarProps {
  /** Current search value */
  value: string;
  /** Called with the debounced search value (300 ms delay) */
  onChangeText: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Dismiss the keyboard when the user taps the clear button */
  dismissKeyboardOnClear?: boolean;
  /** Container style override */
  style?: ViewStyle;
  testID?: string;
}

const DEBOUNCE_MS = 300;

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search…',
  dismissKeyboardOnClear = true,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  // Internal (immediate) value drives the TextInput so it feels responsive.
  const [inputValue, setInputValue] = useState(value);
  const [focused, setFocused] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep internal value in sync when the parent resets it (e.g. clear from outside).
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (text: string) => {
    setInputValue(text);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      onChangeText(text);
    }, DEBOUNCE_MS);
  };

  // Clean up on unmount.
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleClear = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    setInputValue('');
    onChangeText('');
    if (dismissKeyboardOnClear) {
      Keyboard.dismiss();
    }
  };

  const showClear = inputValue.length > 0;

  return (
    <View
      style={[
        styles.container,
        focused && styles.containerFocused,
        style,
      ]}
      testID={testID}
    >
      {/* Search icon */}
      <Ionicons
        name="search-outline"
        size={18}
        color={focused ? colors.primary : colors.textSecondary}
        style={styles.searchIcon}
        testID={testID ? `${testID}-icon` : undefined}
      />

      {/* Text input */}
      <TextInput
        style={styles.input}
        value={inputValue}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        returnKeyType="search"
        onSubmitEditing={Keyboard.dismiss}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
        accessibilityLabel="Search"
        accessibilityHint={placeholder}
        accessibilityRole="search"
        testID={testID ? `${testID}-input` : undefined}
      />

      {/* Clear button */}
      {showClear && (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          testID={testID ? `${testID}-clear` : undefined}
        >
          <Ionicons
            name="close-circle"
            size={18}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 48,
    ...theme.shadows.sm,
  },
  containerFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
    ...theme.shadows.md,
  },
  searchIcon: {
    marginRight: theme.spacing.md,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
    fontSize: theme.fontSizes.base,
    paddingVertical: Platform.OS === 'ios' ? theme.spacing.sm : 0,
  },
  clearButton: {
    marginLeft: theme.spacing.sm,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

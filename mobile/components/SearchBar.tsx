import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onCameraPress?: () => void;
  onSearchPress?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search products...',
  onCameraPress,
  onSearchPress,
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textLight}
      />
      {onCameraPress && (
        <TouchableOpacity style={styles.iconButton} onPress={onCameraPress}>
          <Ionicons name="camera-outline" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      )}
      {onSearchPress && (
        <TouchableOpacity style={styles.searchButton} onPress={onSearchPress}>
          <Ionicons name="search" size={20} color={theme.colors.background} />
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
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.base,
    height: 48,
    ...theme.shadows.sm,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSizes.base,
    color: theme.colors.text,
  },
  iconButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  searchButton: {
    backgroundColor: theme.colors.text,
    borderRadius: theme.borderRadius.full,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
});

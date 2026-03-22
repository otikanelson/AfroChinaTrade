import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onCameraPress?: () => void;
  onSearchPress?: () => void;
  onPress?: () => void; // New prop for making the search bar pressable
  editable?: boolean; // New prop to control if the input is editable
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search products...',
  onCameraPress,
  onSearchPress,
  onPress,
  editable = true,
}) => {
  const { colors, spacing, borderRadius, fontSizes, shadows } = useTheme();

  const SearchBarContent = (
    <View style={[styles.container, { 
      backgroundColor: colors.background, 
      borderRadius: borderRadius.lg, 
      paddingHorizontal: spacing.base,
      ...shadows.sm 
    }]}>
      <TextInput
        style={[styles.input, { fontSize: fontSizes.sm, color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        editable={editable}
        pointerEvents={onPress ? 'none' : 'auto'}
      />
      {onCameraPress && (
        <TouchableOpacity style={[styles.iconButton, { padding: spacing.sm, marginLeft: spacing.sm }]} onPress={onCameraPress}>
          <Ionicons name="camera-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
      {onSearchPress && (
        <TouchableOpacity style={[styles.searchButton, { 
          backgroundColor: colors.text, 
          borderRadius: borderRadius.full,
          marginLeft: spacing.sm 
        }]} onPress={onSearchPress}>
          <Ionicons name="search" size={20} color={colors.background} />
        </TouchableOpacity>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {SearchBarContent}
      </TouchableOpacity>
    );
  }

  return SearchBarContent;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
  },
  input: {
    flex: 1,
  },
  iconButton: {
    // Styles applied inline
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

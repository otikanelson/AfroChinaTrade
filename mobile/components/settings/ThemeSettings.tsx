import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export function ThemeToggle() {
  const { colors, fonts, fontSizes, spacing, themeMode, toggleTheme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    leftContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: fontSizes.base,
      fontFamily: fonts.medium,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 2,
    },
    subtitle: {
      fontSize: fontSizes.xs,
      fontFamily: fonts.regular,
      fontWeight: '400',
      color: colors.textSecondary,
    },
    toggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggleText: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.regular,
      fontWeight: '400',
      color: colors.text,
      marginLeft: spacing.xs,
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={toggleTheme}
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
    >
      <View style={styles.leftContent}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={themeMode === 'light' ? 'sunny-outline' : 'moon-outline'} 
            size={20} 
            color={colors.primary} 
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Appearance</Text>
          <Text style={styles.subtitle}>
            {themeMode === 'light' ? 'Light mode' : 'Dark mode'}
          </Text>
        </View>
      </View>
      
      <View style={styles.toggleButton}>
        <Ionicons 
          name={themeMode === 'light' ? 'moon-outline' : 'sunny-outline'} 
          size={16} 
          color={colors.textSecondary} 
        />
        <Text style={styles.toggleText}>
          {themeMode === 'light' ? 'Dark' : 'Light'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Header } from '../../components/Header';

export default function ThemeSettings() {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();

  const themeOptions = [
    { id: 'light', name: 'Light Theme', icon: 'sunny-outline' },
    { id: 'dark', name: 'Dark Theme', icon: 'moon-outline' },
    { id: 'auto', name: 'System Default', icon: 'phone-portrait-outline' },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: spacing.base,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginBottom: spacing.md,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.base,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.base,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    optionIcon: {
      marginRight: spacing.md,
    },
    optionText: {
      flex: 1,
      fontSize: fontSizes.base,
      color: colors.text,
    },
    selectedOption: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Theme Settings" showBack />
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.option, option.id === 'light' && styles.selectedOption]}
            >
              <Ionicons 
                name={option.icon as any} 
                size={24} 
                color={colors.primary} 
                style={styles.optionIcon}
              />
              <Text style={styles.optionText}>{option.name}</Text>
              {option.id === 'light' && (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
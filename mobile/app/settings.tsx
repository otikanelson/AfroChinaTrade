import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/settings/ThemeSettings';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, fonts, fontSizes, spacing } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      backgroundColor: colors.background,
      paddingTop: 10,
      paddingBottom: spacing.base,
      paddingHorizontal: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      marginRight: spacing.md,
      padding: spacing.xs,
    },
    headerTitle: {
      fontSize: fontSizes['2xl'],
      fontFamily: fonts.bold,
      color: colors.text,
      flex: 1,
    },
    content: {
      flex: 1,
    },
    section: {
      backgroundColor: colors.background,
      marginHorizontal: spacing.base,
      marginTop: spacing.base,
      borderRadius: 12,
    },
    sectionHeader: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    sectionTitle: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.medium,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Appearance</Text>
          </View>
          <ThemeToggle />
        </View>
      </ScrollView>
    </View>
  );
}
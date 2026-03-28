import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { spacing } from '../theme/spacing';

interface BrowseAllCardProps {
  onPress: () => void;
}

export const BrowseAllCard: React.FC<BrowseAllCardProps> = ({ onPress }) => {
  const { colors, fontSizes, fontWeights, borderRadius } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      margin: spacing.base,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 120,
    },
    iconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.base,
    },
    title: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: colors.textInverse,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: fontSizes.sm,
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'center',
      marginBottom: spacing.base,
    },
    button: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    buttonText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      color: colors.textInverse,
    },
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        <Ionicons name="grid-outline" size={28} color={colors.textInverse} />
      </View>
      <Text style={styles.title}>Browse All Products</Text>
      <Text style={styles.subtitle}>
        Discover thousands of products from verified suppliers
      </Text>
      <View style={styles.button}>
        <Text style={styles.buttonText}>Explore Now</Text>
      </View>
    </TouchableOpacity>
  );
};
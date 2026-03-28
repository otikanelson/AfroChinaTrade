import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from './Card';

interface CollectionsSummaryCardProps {
  collectionsCount: number;
  totalProducts: number;
  loading?: boolean;
}

export const CollectionsSummaryCard: React.FC<CollectionsSummaryCardProps> = ({
  collectionsCount,
  totalProducts,
  loading = false
}) => {
  const router = useRouter();
  const { colors, spacing, fontSizes, borderRadius, fontWeights } = useTheme();

  const handleManageCollections = () => {
    router.push('/(admin)/collections');
  };

  const handleCreateCollection = () => {
    router.push('/(admin)/collections/create');
  };

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: spacing.base,
      marginVertical: spacing.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    title: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
      color: colors.text,
    },
    manageButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.primaryLight,
      gap: spacing.xs,
    },
    manageButtonText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: colors.primary,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
    },
    statNumber: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    statLabel: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      gap: spacing.sm,
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    secondaryButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
    },
    primaryButtonText: {
      color: colors.textInverse,
    },
    secondaryButtonText: {
      color: colors.text,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      gap: spacing.md,
    },
    emptyIcon: {
      marginBottom: spacing.sm,
    },
    emptyTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      textAlign: 'center',
    },
    emptyDescription: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    createButtonText: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.textInverse,
    },
  });

  if (loading) {
    return (
      <Card style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Collections</Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>-</Text>
            <Text style={styles.statLabel}>Collections</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>-</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
        </View>
      </Card>
    );
  }

  if (collectionsCount === 0) {
    return (
      <Card style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Collections</Text>
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="albums-outline" size={48} color={colors.textLight} />
          </View>
          <Text style={styles.emptyTitle}>No Collections Yet</Text>
          <Text style={styles.emptyDescription}>
            Create collections to organize your products and improve customer discovery
          </Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateCollection}>
            <Ionicons name="add" size={20} color={colors.textInverse} />
            <Text style={styles.createButtonText}>Create First Collection</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Collections</Text>
        <TouchableOpacity style={styles.manageButton} onPress={handleManageCollections}>
          <Text style={styles.manageButtonText}>Manage</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{collectionsCount}</Text>
          <Text style={styles.statLabel}>Active Collections</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalProducts}</Text>
          <Text style={styles.statLabel}>Total Products</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleCreateCollection}
        >
          <Ionicons name="add" size={18} color={colors.textInverse} />
          <Text style={[styles.buttonText, styles.primaryButtonText]}>New Collection</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleManageCollections}
        >
          <Ionicons name="settings-outline" size={18} color={colors.text} />
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Manage All</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};
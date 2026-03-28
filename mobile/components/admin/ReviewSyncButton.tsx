import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAlertContext } from '../../contexts/AlertContext';
import apiClient from '../../services/api/apiClient';
import { spacing } from '../../theme/spacing';

interface ReviewSyncButtonProps {
  onSyncComplete?: () => void;
}

export const ReviewSyncButton: React.FC<ReviewSyncButtonProps> = ({ onSyncComplete }) => {
  const { colors, fontSizes, fontWeights, borderRadius } = useTheme();
  const alert = useAlertContext();
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState<{
    totalProducts: number;
    correctProducts: number;
    productsWithFakeReviews: number;
    productsWithMismatchedData: number;
    needsSync: boolean;
  } | null>(null);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      padding: spacing.base,
      borderRadius: borderRadius.lg,
      marginVertical: spacing.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    title: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginLeft: spacing.sm,
    },
    description: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.base,
      lineHeight: 20,
    },
    statsContainer: {
      backgroundColor: colors.background,
      padding: spacing.sm,
      borderRadius: borderRadius.base,
      marginBottom: spacing.base,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.xs,
    },
    statLabel: {
      fontSize: fontSizes.sm,
      color: colors.text,
    },
    statValue: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      color: colors.primary,
    },
    warningValue: {
      color: colors.warning,
    },
    errorValue: {
      color: colors.error,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.base,
      borderRadius: borderRadius.base,
      gap: spacing.xs,
    },
    checkButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    syncButton: {
      backgroundColor: colors.primary,
    },
    disabledButton: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    buttonText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
    },
    checkButtonText: {
      color: colors.primary,
    },
    syncButtonText: {
      color: colors.textInverse,
    },
    disabledButtonText: {
      color: colors.textSecondary,
    },
  });

  const checkReviewStats = async () => {
    try {
      setSyncing(true);
      const response = await apiClient.get('/admin/review-stats');
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        alert.showError('Error', 'Failed to get review statistics');
      }
    } catch (error) {
      console.error('Error checking review stats:', error);
      alert.showError('Error', 'Failed to check review statistics');
    } finally {
      setSyncing(false);
    }
  };

  const syncReviews = async () => {
    try {
      setSyncing(true);
      const response = await apiClient.post('/admin/sync-reviews', {});
      
      if (response.success && response.data) {
        const { updatedCount, skippedCount, totalProducts } = response.data;
        
        alert.showSuccess(
          'Sync Complete', 
          `Updated ${updatedCount} products, ${skippedCount} were already correct. Total: ${totalProducts} products.`
        );
        
        // Refresh stats
        await checkReviewStats();
        onSyncComplete?.();
      } else {
        alert.showError('Error', 'Failed to sync product reviews');
      }
    } catch (error) {
      console.error('Error syncing reviews:', error);
      alert.showError('Error', 'Failed to sync product reviews');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="sync" size={24} color={colors.primary} />
        <Text style={styles.title}>Review Data Sync</Text>
      </View>
      
      <Text style={styles.description}>
        Some products may have incorrect review counts from seed data. Use this tool to sync all products with their actual review data.
      </Text>

      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Products:</Text>
            <Text style={styles.statValue}>{stats.totalProducts}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Correct Data:</Text>
            <Text style={styles.statValue}>{stats.correctProducts}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Fake Review Counts:</Text>
            <Text style={[styles.statValue, stats.productsWithFakeReviews > 0 && styles.errorValue]}>
              {stats.productsWithFakeReviews}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Mismatched Data:</Text>
            <Text style={[styles.statValue, stats.productsWithMismatchedData > 0 && styles.warningValue]}>
              {stats.productsWithMismatchedData}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.checkButton, syncing && styles.disabledButton]}
          onPress={checkReviewStats}
          disabled={syncing}
        >
          {syncing ? (
            <ActivityIndicator size="small" color={colors.textSecondary} />
          ) : (
            <Ionicons name="analytics" size={16} color={colors.primary} />
          )}
          <Text style={[styles.buttonText, syncing ? styles.disabledButtonText : styles.checkButtonText]}>
            Check Stats
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button, 
            styles.syncButton, 
            (syncing || (stats && !stats.needsSync)) && styles.disabledButton
          ]}
          onPress={syncReviews}
          disabled={syncing || (stats && !stats.needsSync)}
        >
          {syncing ? (
            <ActivityIndicator size="small" color={colors.textSecondary} />
          ) : (
            <Ionicons name="sync" size={16} color={stats?.needsSync ? colors.textInverse : colors.textSecondary} />
          )}
          <Text style={[
            styles.buttonText, 
            syncing || (stats && !stats.needsSync) ? styles.disabledButtonText : styles.syncButtonText
          ]}>
            {stats?.needsSync === false ? 'All Synced' : 'Sync Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
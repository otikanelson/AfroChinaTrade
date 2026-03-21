import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Optional message shown below the spinner */
  message?: string;
}

/**
 * Full-screen semi-transparent overlay with an ActivityIndicator.
 * Use this during form submissions and other blocking async operations.
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
}) => {
  const { colors, borderRadius, spacing, shadows } = useTheme();
  
  const styles = StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.overlay,
      alignItems: 'center',
      justifyContent: 'center',
    },
    card: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.xl,
      alignItems: 'center',
      gap: spacing.md,
      minWidth: 120,
      ...shadows.md,
    },
    message: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={colors.primary} />
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
      </View>
    </Modal>
  );
};

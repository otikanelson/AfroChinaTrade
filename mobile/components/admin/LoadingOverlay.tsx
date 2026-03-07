import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';

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
}) => (
  <Modal
    transparent
    animationType="fade"
    visible={visible}
    statusBarTranslucent
  >
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.md,
    minWidth: 120,
    ...theme.shadows.md,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

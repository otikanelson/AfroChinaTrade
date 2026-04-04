import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { CustomModal } from './CustomModal';

export interface DeleteConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  itemName?: string;
  itemType?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  visible,
  title,
  message,
  itemName,
  itemType = 'item',
  onConfirm,
  onCancel,
  isDeleting = false,
  confirmText = 'Delete',
  cancelText = 'Cancel',
}) => {
  const { colors, fontSizes, fontWeights, borderRadius, spacing } = useTheme();

  const styles = StyleSheet.create({
    container: {
      paddingVertical: spacing.sm,
    },
    iconContainer: {
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    warningIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.errorLight || colors.error + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    message: {
      fontSize: fontSizes.base,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: spacing.sm,
    },
    itemInfo: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.base,
      padding: spacing.sm,
      marginVertical: spacing.sm,
      borderLeftWidth: 4,
      borderLeftColor: colors.error,
    },
    itemName: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginBottom: 2,
    },
    itemType: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    warningText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
      marginTop: spacing.sm,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    button: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.base,
      borderRadius: borderRadius.base,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
    },
    cancelButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    confirmButton: {
      backgroundColor: colors.error,
    },
    confirmButtonDisabled: {
      backgroundColor: colors.textSecondary,
      opacity: 0.6,
    },
    buttonText: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    cancelButtonText: {
      color: colors.text,
    },
    confirmButtonText: {
      color: colors.textInverse,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
  });

  return (
    <CustomModal
      visible={visible}
      title={title}
      onClose={onCancel}
      size="small"
      position="center"
      showCloseButton={false}
    >
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <View style={styles.warningIcon}>
            <Ionicons 
              name="warning" 
              size={32} 
              color={colors.error} 
            />
          </View>
        </View>

        <Text style={styles.message}>{message}</Text>

        {itemName && (
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={2}>
              {itemName}
            </Text>
            <Text style={styles.itemType}>{itemType}</Text>
          </View>
        )}

        <Text style={styles.warningText}>
          This action cannot be undone.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={isDeleting}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>
              {cancelText}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.confirmButton,
              isDeleting && styles.confirmButtonDisabled,
            ]}
            onPress={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.textInverse} />
                <Text style={[styles.buttonText, styles.confirmButtonText]}>
                  Deleting...
                </Text>
              </View>
            ) : (
              <Text style={[styles.buttonText, styles.confirmButtonText]}>
                {confirmText}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </CustomModal>
  );
};
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomModal } from './CustomModal';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing } from '../../theme/spacing';

export interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: 'primary' | 'error' | 'success';
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonColor = 'primary',
  icon,
  iconColor,
  onConfirm,
  onCancel,
}) => {
  const { colors, fontSizes, fontWeights, borderRadius } = useTheme();

  const getButtonColor = () => {
    switch (confirmButtonColor) {
      case 'error':
        return colors.error;
      case 'success':
        return colors.success;
      default:
        return colors.primary;
    }
  };

  const styles = StyleSheet.create({
    content: {
      alignItems: 'center',
      paddingVertical: spacing.base,
    },
    iconContainer: {
      marginBottom: spacing.base,
    },
    message: {
      fontSize: fontSizes.base,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: spacing.lg,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: spacing.sm,
      width: '100%',
    },
    button: {
      flex: 1,
      paddingVertical: spacing.sm,
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
      backgroundColor: getButtonColor(),
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
  });

  return (
    <CustomModal
      visible={visible}
      title={title}
      onClose={onCancel}
      size="small"
      showCloseButton={false}
    >
      <View style={styles.content}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons 
              name={icon} 
              size={48} 
              color={iconColor || colors.textSecondary} 
            />
          </View>
        )}
        
        <Text style={styles.message}>{message}</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>
              {cancelText}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={onConfirm}
          >
            <Text style={[styles.buttonText, styles.confirmButtonText]}>
              {confirmText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </CustomModal>
  );
};
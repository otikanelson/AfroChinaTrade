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

export interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  buttonText = 'OK',
  type = 'info',
  onClose,
}) => {
  const { colors, fontSizes, fontWeights, borderRadius } = useTheme();

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: 'checkmark-circle' as const, color: colors.success };
      case 'error':
        return { icon: 'alert-circle' as const, color: colors.error };
      case 'warning':
        return { icon: 'warning' as const, color: colors.warning };
      default:
        return { icon: 'information-circle' as const, color: colors.primary };
    }
  };

  const { icon, color } = getIconAndColor();

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
    button: {
      backgroundColor: color,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.base,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
      minWidth: 120,
    },
    buttonText: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.textInverse,
    },
  });

  return (
    <CustomModal
      visible={visible}
      title={title}
      onClose={onClose}
      size="small"
      showCloseButton={false}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={48} color={color} />
        </View>
        
        <Text style={styles.message}>{message}</Text>
        
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </CustomModal>
  );
};
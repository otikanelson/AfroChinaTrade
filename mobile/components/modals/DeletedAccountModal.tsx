import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface DeletedAccountModalProps {
  visible: boolean;
  onClose: () => void;
  deletedAt?: string;
  daysRemaining?: number;
}

export function DeletedAccountModal({
  visible,
  onClose,
  deletedAt,
  daysRemaining = 30,
}: DeletedAccountModalProps) {
  const { colors, spacing, fontSizes, fonts, borderRadius } = useTheme();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    container: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      width: '100%',
      maxWidth: 400,
      maxHeight: '80%',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    header: {
      alignItems: 'center',
      padding: spacing.xl,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.error + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    title: {
      fontSize: fontSizes.xl,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    content: {
      padding: spacing.xl,
    },
    infoBox: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      padding: spacing.base,
      marginBottom: spacing.lg,
    },
    infoText: {
      fontSize: fontSizes.base,
      color: colors.text,
      lineHeight: 22,
      textAlign: 'center',
    },
    optionsTitle: {
      fontSize: fontSizes.lg,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      padding: spacing.base,
      marginBottom: spacing.sm,
    },
    optionIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    optionContent: {
      flex: 1,
    },
    optionTitle: {
      fontSize: fontSizes.base,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    optionDescription: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    footer: {
      padding: spacing.xl,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.base,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: fontSizes.base,
      fontWeight: '600',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="trash-bin" size={32} color={colors.error} />
            </View>
            <Text style={styles.title}>Account Deleted</Text>
            <Text style={styles.subtitle}>
              This account was deleted on {formatDate(deletedAt)}
            </Text>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                This email address is temporarily unavailable for {daysRemaining} days after deletion.
              </Text>
            </View>

            <Text style={styles.optionsTitle}>What you can do:</Text>

            {/* Option 1: Wait */}
            <View style={styles.optionCard}>
              <View style={styles.optionIconContainer}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Wait {daysRemaining} Days</Text>
                <Text style={styles.optionDescription}>
                  After the waiting period, you can create a new account with this email.
                </Text>
              </View>
            </View>

            {/* Option 2: Contact Support */}
            <View style={styles.optionCard}>
              <View style={styles.optionIconContainer}>
                <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Contact Support</Text>
                <Text style={styles.optionDescription}>
                  Need immediate access? Our support team can help you recover or expedite the process.
                </Text>
              </View>
            </View>

            {/* Option 3: Use Different Email */}
            <View style={styles.optionCard}>
              <View style={styles.optionIconContainer}>
                <Ionicons name="mail-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Use a Different Email</Text>
                <Text style={styles.optionDescription}>
                  Sign up with a different email address to create a new account immediately.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.buttonText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

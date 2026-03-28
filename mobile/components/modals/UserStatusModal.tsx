import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomModal } from '../ui/CustomModal';
import { Button } from '../admin/Button';
import { theme } from '../../theme';
import { ticketService } from '../../services/TicketService';
import { mobileToastManager } from '../../utils/toast';

interface UserStatusModalProps {
  visible: boolean;
  status: 'suspended' | 'blocked';
  reason?: string;
  suspensionDuration?: string;
  onClose: () => void;
  onAppealSubmitted?: () => void;
}

export const UserStatusModal: React.FC<UserStatusModalProps> = ({
  visible,
  status,
  reason,
  suspensionDuration,
  onClose,
  onAppealSubmitted,
}) => {
  const [showAppealForm, setShowAppealForm] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitAppeal = async () => {
    if (!appealReason.trim()) {
      Alert.alert('Required', 'Please provide a reason for your appeal.');
      return;
    }

    setSubmitting(true);
    try {
      await ticketService.createTicket({
        subject: 'Account Suspension Appeal',
        category: 'suspension_appeal',
        description: `I am appealing my account suspension. Reason: ${appealReason.trim()}`,
        priority: 'high',
        isSuspensionAppeal: true,
        appealReason: appealReason.trim(),
      });

      mobileToastManager.success('Appeal submitted successfully', 'Your appeal has been sent to our support team');
      setAppealReason('');
      setShowAppealForm(false);
      onAppealSubmitted?.();
    } catch (error: any) {
      console.error('Error submitting appeal:', error);
      Alert.alert('Error', error.message || 'Failed to submit appeal');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusInfo = () => {
    if (status === 'suspended') {
      return {
        title: 'Account Suspended',
        icon: 'warning-outline' as const,
        iconColor: theme.colors.warning,
        message: 'Your account has been temporarily suspended.',
        description: 'You can still browse products and view content, but cannot make purchases or access account features.',
        canAppeal: true,
      };
    } else {
      return {
        title: 'Account Blocked',
        icon: 'ban-outline' as const,
        iconColor: theme.colors.error,
        message: 'Your account has been blocked.',
        description: 'All account features are restricted. Please contact support for assistance.',
        canAppeal: false,
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title={statusInfo.title}
      showCloseButton={true}
    >
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={statusInfo.icon} 
            size={48} 
            color={statusInfo.iconColor} 
          />
        </View>

        <Text style={styles.message}>{statusInfo.message}</Text>
        <Text style={styles.description}>{statusInfo.description}</Text>

        {reason && (
          <View style={styles.reasonContainer}>
            <Text style={styles.reasonLabel}>Reason:</Text>
            <Text style={styles.reasonText}>{reason}</Text>
          </View>
        )}

        {status === 'suspended' && suspensionDuration && (
          <View style={styles.durationContainer}>
            <Text style={styles.durationLabel}>Duration:</Text>
            <Text style={styles.durationText}>
              Until {new Date(suspensionDuration).toLocaleDateString()}
            </Text>
          </View>
        )}

        {statusInfo.canAppeal && !showAppealForm && (
          <View style={styles.actionContainer}>
            <Text style={styles.appealInfo}>
              Think this is a mistake? You can submit an appeal to our support team.
            </Text>
            <Button
              label="Submit Appeal"
              onPress={() => setShowAppealForm(true)}
              style={styles.appealButton}
            />
          </View>
        )}

        {showAppealForm && (
          <View style={styles.appealForm}>
            <Text style={styles.appealFormTitle}>Submit Appeal</Text>
            <Text style={styles.appealFormDescription}>
              Please explain why you believe your account shouldn't have been suspended:
            </Text>
            <TextInput
              style={styles.appealInput}
              value={appealReason}
              onChangeText={setAppealReason}
              placeholder="Explain your situation..."
              placeholderTextColor={theme.colors.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.appealActions}>
              <Button
                label="Cancel"
                variant="secondary"
                onPress={() => {
                  setShowAppealForm(false);
                  setAppealReason('');
                }}
                style={styles.appealActionButton}
              />
              <Button
                label={submitting ? "Submitting..." : "Submit Appeal"}
                onPress={handleSubmitAppeal}
                disabled={submitting}
                style={styles.appealActionButton}
              />
            </View>
          </View>
        )}

        <View style={styles.contactInfo}>
          <Text style={styles.contactText}>
            Need help? Contact our support team at support@afrochinatrade.com
          </Text>
        </View>
      </View>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
  },
  message: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold as any,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  reasonContainer: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  reasonLabel: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold as any,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  reasonText: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.text,
    lineHeight: 20,
  },
  durationContainer: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  durationLabel: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold as any,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  durationText: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.text,
    fontWeight: theme.fontWeights.medium as any,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  appealInfo: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  appealButton: {
    minWidth: 150,
  },
  appealForm: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  appealFormTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  appealFormDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  appealInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSizes.base,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    minHeight: 100,
    marginBottom: theme.spacing.md,
  },
  appealActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  appealActionButton: {
    flex: 1,
  },
  contactInfo: {
    width: '100%',
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  contactText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
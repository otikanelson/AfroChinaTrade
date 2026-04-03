import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAlertContext } from '../../../contexts/AlertContext';
import { Header } from '../../../components/Header';
import { spacing } from '../../../theme/spacing';
import { apiClient } from '../../../services/api/apiClient';

interface TicketDetail {
  _id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  description: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    status: string;
  };
  adminResponse?: string;
  adminId?: {
    name: string;
    email: string;
  };
  resolvedAt?: string;
  isSuspensionAppeal?: boolean;
  appealReason?: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

export default function AdminTicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, fontSizes, fontWeights, borderRadius } = useTheme();
  const { showError, showSuccess } = useAlertContext();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [unsuspendUser, setUnsuspendUser] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    content: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    ticketCard: {
      backgroundColor: colors.background,
      margin: spacing.base,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      borderLeftWidth: 4,
    },
    ticketHeader: {
      marginBottom: spacing.base,
    },
    ticketNumber: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      color: colors.primary,
      marginBottom: 4,
    },
    ticketSubject: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    userInfo: {
      backgroundColor: colors.primaryLight,
      padding: spacing.sm,
      borderRadius: borderRadius.sm,
      marginBottom: spacing.sm,
    },
    userInfoText: {
      fontSize: fontSizes.sm,
      color: colors.text,
      marginBottom: 2,
    },
    userStatus: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      textTransform: 'uppercase',
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
    },
    statusText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      textTransform: 'uppercase',
    },
    priorityBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
    },
    priorityText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      textTransform: 'uppercase',
    },
    categoryText: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textTransform: 'capitalize',
    },
    dateText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    sectionTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginTop: spacing.base,
      marginBottom: spacing.sm,
    },
    descriptionText: {
      fontSize: fontSizes.base,
      color: colors.text,
      lineHeight: 22,
    },
    appealCard: {
      backgroundColor: colors.warning + '10',
      borderRadius: borderRadius.md,
      padding: spacing.base,
      marginTop: spacing.base,
      borderLeftWidth: 4,
      borderLeftColor: colors.warning,
    },
    appealTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.warning,
      marginBottom: spacing.sm,
    },
    appealText: {
      fontSize: fontSizes.base,
      color: colors.text,
      lineHeight: 22,
    },
    responseCard: {
      backgroundColor: colors.primaryLight,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      marginTop: spacing.base,
    },
    responseTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.primary,
      marginBottom: spacing.sm,
    },
    responseText: {
      fontSize: fontSizes.base,
      color: colors.text,
      lineHeight: 22,
    },
    adminInfo: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginTop: spacing.sm,
      fontStyle: 'italic',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.base,
    },
    actionCard: {
      backgroundColor: colors.background,
      margin: spacing.base,
      borderRadius: borderRadius.md,
      padding: spacing.base,
    },
    actionTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: spacing.base,
    },
    formGroup: {
      marginBottom: spacing.base,
    },
    label: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    pickerContainer: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.base,
    },
    pickerText: {
      fontSize: fontSizes.base,
      color: colors.text,
    },
    pickerOptions: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    pickerOption: {
      padding: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    pickerOptionText: {
      fontSize: fontSizes.base,
      color: colors.text,
    },
    selectedOption: {
      backgroundColor: colors.primaryLight,
    },
    textArea: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      fontSize: fontSizes.base,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 120,
      textAlignVertical: 'top',
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.base,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: colors.primary,
      marginRight: spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
    },
    checkboxLabel: {
      fontSize: fontSizes.base,
      color: colors.text,
      flex: 1,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    updateButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      alignItems: 'center',
    },
    updateButtonText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    userButton: {
      backgroundColor: colors.info,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      alignItems: 'center',
      minWidth: 100,
    },
    userButtonText: {
      color: colors.textInverse,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
    },
  });

  const fetchTicketDetail = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await apiClient.get(`/tickets/${id}`);

      if (response.success && response.data) {
        setTicket(response.data);
        setSelectedStatus(response.data.status);
        setAdminResponse(response.data.adminResponse || '');
      } else {
        showError('Error', response.error?.message || 'Failed to fetch ticket details');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching ticket detail:', error);
      showError('Network Error', 'Please try again.');
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTicketDetail();
    }
  }, [id]);

  const onRefresh = () => {
    fetchTicketDetail(true);
  };

  const handleUpdateTicket = async () => {
    if (!adminResponse.trim() && selectedStatus === ticket?.status) {
      showError('Validation', 'Please provide a response or change the status');
      return;
    }

    setUpdating(true);
    try {
      const response = await apiClient.put(`/tickets/${id}`, {
        status: selectedStatus,
        adminResponse: adminResponse.trim(),
        unsuspendUser: unsuspendUser && ticket?.isSuspensionAppeal,
      });

      if (response.success) {
        showSuccess('Ticket updated successfully!');
        fetchTicketDetail();
      } else {
        showError('Error', response.error?.message || 'Failed to update ticket');
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      showError('Network Error', 'Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return { backgroundColor: colors.warning + '20', color: colors.warning };
      case 'in_progress':
        return { backgroundColor: colors.info + '20', color: colors.info };
      case 'resolved':
        return { backgroundColor: colors.success + '20', color: colors.success };
      case 'closed':
        return { backgroundColor: colors.textLight + '20', color: colors.textSecondary };
      default:
        return { backgroundColor: colors.textLight + '20', color: colors.textSecondary };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { backgroundColor: colors.error + '20', color: colors.error };
      case 'high':
        return { backgroundColor: colors.warning + '20', color: colors.warning };
      case 'medium':
        return { backgroundColor: colors.info + '20', color: colors.info };
      case 'low':
        return { backgroundColor: colors.success + '20', color: colors.success };
      default:
        return { backgroundColor: colors.textLight + '20', color: colors.textSecondary };
    }
  };

  const getTicketBorderColor = (status: string) => {
    switch (status) {
      case 'open':
        return colors.warning;
      case 'in_progress':
        return colors.info;
      case 'resolved':
        return colors.success;
      case 'closed':
        return colors.textLight;
      default:
        return colors.textLight;
    }
  };

  const getUserStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'suspended':
        return colors.error;
      case 'pending':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewUser = () => {
    if (ticket?.userId._id) {
      router.push(`/(admin)/users/${ticket.userId._id}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Ticket Details" showBack={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.container}>
        <Header title="Ticket Details" showBack={true} />
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.textSecondary }}>Ticket not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Ticket Details" showBack={true} />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.ticketCard,
          { borderLeftColor: getTicketBorderColor(ticket.status) }
        ]}>
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketNumber}>#{ticket.ticketNumber}</Text>
            <Text style={styles.ticketSubject}>{ticket.subject}</Text>
            
            <View style={styles.userInfo}>
              <Text style={styles.userInfoText}>
                <Text style={{ fontWeight: fontWeights.semibold }}>Customer:</Text> {ticket.userId.name}
              </Text>
              <Text style={styles.userInfoText}>
                <Text style={{ fontWeight: fontWeights.semibold }}>Email:</Text> {ticket.userId.email}
              </Text>
              <Text style={[styles.userStatus, { color: getUserStatusColor(ticket.userId.status) }]}>
                {ticket.userId.status}
              </Text>
            </View>
            
            <View style={styles.metaRow}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status).backgroundColor }]}>
                <Text style={[styles.statusText, { color: getStatusColor(ticket.status).color }]}>
                  {ticket.status.replace('_', ' ')}
                </Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(ticket.priority).backgroundColor }]}>
                <Text style={[styles.priorityText, { color: getPriorityColor(ticket.priority).color }]}>
                  {ticket.priority} priority
                </Text>
              </View>
              <TouchableOpacity style={styles.userButton} onPress={handleViewUser}>
                <Text style={styles.userButtonText}>View User</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.categoryText}>{ticket.category}</Text>
              <Text style={styles.dateText}>Created {formatDate(ticket.createdAt)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{ticket.description}</Text>

          {ticket.isSuspensionAppeal && ticket.appealReason && (
            <View style={styles.appealCard}>
              <Text style={styles.appealTitle}>Suspension Appeal</Text>
              <Text style={styles.appealText}>{ticket.appealReason}</Text>
            </View>
          )}

          {ticket.adminResponse && (
            <View style={styles.responseCard}>
              <Text style={styles.responseTitle}>Admin Response</Text>
              <Text style={styles.responseText}>{ticket.adminResponse}</Text>
              {ticket.adminId && (
                <Text style={styles.adminInfo}>
                  Responded by {ticket.adminId.name}
                </Text>
              )}
              {ticket.resolvedAt && (
                <Text style={styles.adminInfo}>
                  Resolved on {formatDate(ticket.resolvedAt)}
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>Update Ticket</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.pickerContainer}>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowStatusPicker(!showStatusPicker)}
              >
                <Text style={styles.pickerText}>
                  {STATUS_OPTIONS.find(s => s.value === selectedStatus)?.label}
                </Text>
                <Ionicons 
                  name={showStatusPicker ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
              {showStatusPicker && (
                <View style={styles.pickerOptions}>
                  {STATUS_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.pickerOption,
                        selectedStatus === option.value && styles.selectedOption
                      ]}
                      onPress={() => {
                        setSelectedStatus(option.value);
                        setShowStatusPicker(false);
                      }}
                    >
                      <Text style={styles.pickerOptionText}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Admin Response</Text>
            <TextInput
              style={styles.textArea}
              value={adminResponse}
              onChangeText={setAdminResponse}
              placeholder="Provide your response to the customer..."
              placeholderTextColor={colors.textLight}
              multiline
              maxLength={2000}
            />
          </View>

          {ticket.isSuspensionAppeal && ticket.userId.status === 'suspended' && (
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setUnsuspendUser(!unsuspendUser)}
            >
              <View style={[styles.checkbox, unsuspendUser && styles.checkboxChecked]}>
                {unsuspendUser && (
                  <Ionicons name="checkmark" size={14} color={colors.textInverse} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                Unsuspend user (only for suspension appeals)
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdateTicket}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={styles.updateButtonText}>Update Ticket</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
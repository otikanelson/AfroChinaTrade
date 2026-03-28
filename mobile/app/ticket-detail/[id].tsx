import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAlertContext } from '../../contexts/AlertContext';
import { Header } from '../../components/Header';
import { spacing } from '../../theme/spacing';
import TicketService from '../../services/TicketService';
import { Ticket } from '../../types/ticket';

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, fontSizes, fontWeights, borderRadius } = useTheme();
  const { token } = useAuth();
  const { showError } = useAlertContext();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    responseCard: {
      backgroundColor: colors.primaryLight,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      marginTop: spacing.base,
    },
    responseHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    responseIcon: {
      marginRight: spacing.sm,
    },
    responseTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.primary,
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
    noResponseCard: {
      backgroundColor: colors.warning + '10',
      borderRadius: borderRadius.md,
      padding: spacing.base,
      marginTop: spacing.base,
      alignItems: 'center',
    },
    noResponseText: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.base,
    },
  });

  const fetchTicketDetail = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await TicketService.getTicketById(token!, id!);
      setTicket(data.data);
    } catch (error: any) {
      console.error('Error fetching ticket detail:', error);
      showAlert(error.message || 'Failed to fetch ticket details', 'error');
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
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.categoryText}>{ticket.category}</Text>
              <Text style={styles.dateText}>Created {formatDate(ticket.createdAt)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{ticket.description}</Text>

          {ticket.adminResponse ? (
            <View style={styles.responseCard}>
              <View style={styles.responseHeader}>
                <Ionicons 
                  name="chatbubble-ellipses" 
                  size={20} 
                  color={colors.primary} 
                  style={styles.responseIcon}
                />
                <Text style={styles.responseTitle}>Admin Response</Text>
              </View>
              <Text style={styles.responseText}>{ticket.adminResponse}</Text>
              {ticket.adminId && (
                <Text style={styles.adminInfo}>
                  Responded by {typeof ticket.adminId === 'object' ? ticket.adminId.name : 'Admin'}
                </Text>
              )}
              {ticket.resolvedAt && (
                <Text style={styles.adminInfo}>
                  Resolved on {formatDate(ticket.resolvedAt)}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.noResponseCard}>
              <Ionicons 
                name="time-outline" 
                size={32} 
                color={colors.textSecondary}
              />
              <Text style={styles.noResponseText}>
                {ticket.status === 'open' 
                  ? 'Waiting for admin response...' 
                  : ticket.status === 'in_progress'
                  ? 'Your ticket is being reviewed...'
                  : 'No response available'
                }
              </Text>
            </View>
          )}

          {ticket.updatedAt !== ticket.createdAt && (
            <Text style={[styles.dateText, { marginTop: spacing.base, textAlign: 'center' }]}>
              Last updated {formatDate(ticket.updatedAt)}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
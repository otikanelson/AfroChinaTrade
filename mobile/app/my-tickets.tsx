import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useAlertContext } from '../contexts/AlertContext';
import { tokenManager } from '../services/api/tokenManager';
import { Header } from '../components/Header';
import { spacing } from '../theme/spacing';
import TicketService from '../services/TicketService';
import { Ticket } from '../types/ticket';



export default function MyTicketsScreen() {
  const router = useRouter();
  const { colors, fontSizes, fontWeights, borderRadius } = useTheme();
  const { user } = useAuth();
  const { showError } = useAlertContext();
  const [tickets, setTickets] = useState<Ticket[]>([]);
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
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyIcon: {
      marginBottom: spacing.base,
    },
    emptyTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
      lineHeight: 22,
    },
    createButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.base,
      borderRadius: borderRadius.md,
    },
    createButtonText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    ticketsList: {
      padding: spacing.base,
      gap: spacing.base,
    },
    ticketCard: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      borderLeftWidth: 4,
    },
    ticketHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    ticketNumber: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      color: colors.primary,
    },
    ticketSubject: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginTop: 2,
      flex: 1,
      marginRight: spacing.sm,
    },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
      alignSelf: 'flex-start',
    },
    statusText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      textTransform: 'uppercase',
    },
    ticketMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    ticketCategory: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      textTransform: 'capitalize',
    },
    ticketDate: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    priorityBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
      marginLeft: spacing.sm,
    },
    priorityText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.medium,
      textTransform: 'uppercase',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fabContainer: {
      position: 'absolute',
      bottom: spacing.xl,
      right: spacing.base,
    },
    fab: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
  });

  const fetchTickets = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const token = await tokenManager.getAccessToken();
      if (!token) {
        showError('Authentication required');
        return;
      }
      
      const data = await TicketService.getUserTickets(token);
      setTickets(data.data);
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      showError(error.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [])
  );

  const onRefresh = () => {
    fetchTickets(true);
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleTicketPress = (ticket: Ticket) => {
    router.push(`/ticket-detail/${ticket._id}`);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="My Support Tickets" showBack={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="My Support Tickets" showBack={true} />

      {tickets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name="document-text-outline" 
            size={64} 
            color={colors.textLight} 
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>No Support Tickets</Text>
          <Text style={styles.emptyText}>
            You haven't created any support tickets yet. If you need help, create a ticket and our team will assist you.
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/create-ticket')}
          >
            <Text style={styles.createButtonText}>Create Ticket</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.ticketsList}>
            {tickets.map((ticket) => (
              <TouchableOpacity
                key={ticket._id}
                style={[
                  styles.ticketCard,
                  { borderLeftColor: getTicketBorderColor(ticket.status) }
                ]}
                onPress={() => handleTicketPress(ticket)}
              >
                <View style={styles.ticketHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ticketNumber}>#{ticket.ticketNumber}</Text>
                    <Text style={styles.ticketSubject} numberOfLines={2}>
                      {ticket.subject}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status).backgroundColor }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(ticket.status).color }]}>
                      {ticket.status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>

                <View style={styles.ticketMeta}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.ticketCategory}>{ticket.category}</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(ticket.priority).backgroundColor }]}>
                      <Text style={[styles.priorityText, { color: getPriorityColor(ticket.priority).color }]}>
                        {ticket.priority}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.ticketDate}>{formatDate(ticket.createdAt)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/create-ticket')}
        >
          <Ionicons name="add" size={24} color={colors.textInverse} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
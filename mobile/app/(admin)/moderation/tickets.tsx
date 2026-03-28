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
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useAlertContext } from '../../../contexts/AlertContext';
import { tokenManager } from '../../../services/api/tokenManager';
import { Header } from '../../../components/Header';
import { spacing } from '../../../theme/spacing';
import TicketService from '../../../services/TicketService';
import { Ticket, TicketsResponse } from '../../../types/ticket';

interface TicketFilters {
  status?: string;
  category?: string;
  priority?: string;
}

const FILTER_OPTIONS = {
  status: [
    { value: '', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ],
  category: [
    { value: '', label: 'All Categories' },
    { value: 'order', label: 'Order Issues' },
    { value: 'payment', label: 'Payment Problems' },
    { value: 'product', label: 'Product Questions' },
    { value: 'account', label: 'Account Issues' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'suspension_appeal', label: 'Suspension Appeals' },
    { value: 'other', label: 'Other' },
  ],
  priority: [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ],
};

export default function AdminHelpSupportScreen() {
  const router = useRouter();
  const { colors, fontSizes, fontWeights, borderRadius } = useTheme();
  const { user } = useAuth();
  const { showError } = useAlertContext();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<TicketFilters>({
    status: '',
    category: '',
    priority: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    content: {
      flex: 1,
    },
    headerCard: {
      backgroundColor: colors.background,
      margin: spacing.base,
      borderRadius: borderRadius.md,
      padding: spacing.base,
    },
    headerTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    headerDescription: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: spacing.base,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.base,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.primaryLight,
      padding: spacing.sm,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.primary,
    },
    statLabel: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      alignSelf: 'flex-start',
    },
    filterButtonText: {
      color: colors.textInverse,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      marginRight: spacing.xs,
    },
    filtersContainer: {
      backgroundColor: colors.background,
      margin: spacing.base,
      marginTop: 0,
      borderRadius: borderRadius.md,
      padding: spacing.base,
    },
    filterRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    filterSelect: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterSelectButton: {
      padding: spacing.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    filterSelectText: {
      fontSize: fontSizes.sm,
      color: colors.text,
    },
    filterOptions: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    filterOption: {
      padding: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filterOptionText: {
      fontSize: fontSizes.sm,
      color: colors.text,
    },
    selectedOption: {
      backgroundColor: colors.primaryLight,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
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
    ticketInfo: {
      flex: 1,
      marginRight: spacing.sm,
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
    },
    userInfo: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginTop: 2,
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
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.base,
    },
  });

  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showPriorityFilter, setShowPriorityFilter] = useState(false);

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
      
      const data = await TicketService.getAllTickets(token, {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });

      setTickets(data.data.tickets);
      setPagination(data.data.pagination);
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
    }, [filters, pagination.page])
  );

  const onRefresh = () => {
    fetchTickets(true);
  };

  const handleFilterChange = (filterType: keyof TicketFilters, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowStatusFilter(false);
    setShowCategoryFilter(false);
    setShowPriorityFilter(false);
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
    router.push(`/(admin)/ticket/${ticket._id}`);
  };

  const getTicketStats = () => {
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    const urgent = tickets.filter(t => t.priority === 'urgent').length;
    
    return { open, inProgress, resolved, urgent };
  };

  const stats = getTicketStats();

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <Header title="Help & Support" showBack={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Help & Support" showBack={true} />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Support Ticket Management</Text>
          <Text style={styles.headerDescription}>
            Manage customer support tickets, respond to inquiries, and track resolution status.
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.open}</Text>
              <Text style={styles.statLabel}>Open</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.inProgress}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.urgent}</Text>
              <Text style={styles.statLabel}>Urgent</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{pagination.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterButtonText}>Filters</Text>
            <Ionicons 
              name={showFilters ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color={colors.textInverse} 
            />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filtersContainer}>
            <View style={styles.filterRow}>
              <View style={styles.filterSelect}>
                <TouchableOpacity
                  style={styles.filterSelectButton}
                  onPress={() => setShowStatusFilter(!showStatusFilter)}
                >
                  <Text style={styles.filterSelectText}>
                    {FILTER_OPTIONS.status.find(s => s.value === filters.status)?.label}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
                {showStatusFilter && (
                  <View style={styles.filterOptions}>
                    {FILTER_OPTIONS.status.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.filterOption,
                          filters.status === option.value && styles.selectedOption
                        ]}
                        onPress={() => handleFilterChange('status', option.value)}
                      >
                        <Text style={styles.filterOptionText}>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.filterSelect}>
                <TouchableOpacity
                  style={styles.filterSelectButton}
                  onPress={() => setShowCategoryFilter(!showCategoryFilter)}
                >
                  <Text style={styles.filterSelectText}>
                    {FILTER_OPTIONS.category.find(c => c.value === filters.category)?.label}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
                {showCategoryFilter && (
                  <View style={styles.filterOptions}>
                    {FILTER_OPTIONS.category.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.filterOption,
                          filters.category === option.value && styles.selectedOption
                        ]}
                        onPress={() => handleFilterChange('category', option.value)}
                      >
                        <Text style={styles.filterOptionText}>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.filterRow}>
              <View style={styles.filterSelect}>
                <TouchableOpacity
                  style={styles.filterSelectButton}
                  onPress={() => setShowPriorityFilter(!showPriorityFilter)}
                >
                  <Text style={styles.filterSelectText}>
                    {FILTER_OPTIONS.priority.find(p => p.value === filters.priority)?.label}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
                {showPriorityFilter && (
                  <View style={styles.filterOptions}>
                    {FILTER_OPTIONS.priority.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.filterOption,
                          filters.priority === option.value && styles.selectedOption
                        ]}
                        onPress={() => handleFilterChange('priority', option.value)}
                      >
                        <Text style={styles.filterOptionText}>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }} />
            </View>
          </View>
        )}

        {tickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyText}>No support tickets found</Text>
          </View>
        ) : (
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
                  <View style={styles.ticketInfo}>
                    <Text style={styles.ticketNumber}>#{ticket.ticketNumber}</Text>
                    <Text style={styles.ticketSubject} numberOfLines={2}>
                      {ticket.subject}
                    </Text>
                    <Text style={styles.userInfo}>
                      {typeof ticket.userId === 'object' ? ticket.userId.name : 'Unknown User'} • {typeof ticket.userId === 'object' ? ticket.userId.email : ''}
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
        )}
      </ScrollView>
    </View>
  );
}
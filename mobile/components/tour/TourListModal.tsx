import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tour } from '../../services/TourGuideService';
import { useTheme } from '../../contexts/ThemeContext';
import { useTourGuide } from '../../contexts/TourGuideContext';

interface TourListModalProps {
  visible: boolean;
  tours: Tour[];
  onClose: () => void;
}

export function TourListModal({ visible, tours, onClose }: TourListModalProps) {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const { startTour, isTourCompleted } = useTourGuide();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.xl,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: colors.text,
    },
    closeButton: {
      padding: spacing.xs,
    },
    content: {
      padding: spacing.lg,
    },
    tourCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tourHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    tourInfo: {
      flex: 1,
    },
    tourName: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginBottom: 2,
    },
    tourDescription: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    tourMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.sm,
      gap: spacing.md,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    metaText: {
      fontSize: fontSizes.xs,
      color: colors.textLight,
    },
    completedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.success + '20',
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
    },
    completedText: {
      fontSize: fontSizes.xs,
      color: colors.success,
      fontWeight: fontWeights.semibold,
    },
    startButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      marginTop: spacing.md,
      alignItems: 'center',
    },
    startButtonText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      color: colors.textInverse,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
  });

  const handleStartTour = (tourId: string) => {
    startTour(tourId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Available Tours</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {tours.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="information-circle-outline" size={48} color={colors.textLight} />
                <Text style={styles.emptyText}>
                  No tours available for this page
                </Text>
              </View>
            ) : (
              tours.map((tour) => {
                const completed = isTourCompleted(tour.id);
                return (
                  <View key={tour.id} style={styles.tourCard}>
                    <View style={styles.tourHeader}>
                      <View style={styles.iconContainer}>
                        <Ionicons
                          name={(tour.icon as any) || 'help-circle-outline'}
                          size={20}
                          color={colors.primary}
                        />
                      </View>
                      <View style={styles.tourInfo}>
                        <Text style={styles.tourName}>{tour.name}</Text>
                        <Text style={styles.tourDescription}>
                          {tour.description}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.tourMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons name="list-outline" size={14} color={colors.textLight} />
                        <Text style={styles.metaText}>
                          {tour.steps.length} steps
                        </Text>
                      </View>
                      {completed && (
                        <View style={styles.completedBadge}>
                          <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                          <Text style={styles.completedText}>Completed</Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.startButton}
                      onPress={() => handleStartTour(tour.id)}
                    >
                      <Text style={styles.startButtonText}>
                        {completed ? 'Restart Tour' : 'Start Tour'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

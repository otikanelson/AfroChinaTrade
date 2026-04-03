import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTourGuide } from '../../contexts/TourGuideContext';
import { useTheme } from '../../contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function TourOverlay() {
  const { activeTour, currentStep, isActive, nextStep, previousStep, skipTour, completeTour } = useTourGuide();
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();

  if (!activeTour || !isActive) return null;

  const step = activeTour.steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === activeTour.steps.length - 1;
  const progress = ((currentStep + 1) / activeTour.steps.length) * 100;

  const styles = StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    },
    tooltip: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      marginHorizontal: spacing.xl,
      maxWidth: SCREEN_WIDTH - spacing.xl * 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    title: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
      flex: 1,
      marginRight: spacing.sm,
    },
    closeButton: {
      padding: spacing.xs,
    },
    description: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: spacing.lg,
    },
    progressContainer: {
      marginBottom: spacing.lg,
    },
    progressBar: {
      height: 4,
      backgroundColor: colors.surface,
      borderRadius: 2,
      overflow: 'hidden',
      marginBottom: spacing.xs,
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
    },
    progressText: {
      fontSize: fontSizes.xs,
      color: colors.textLight,
      textAlign: 'center',
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    button: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: spacing.xs,
    },
    buttonPrimary: {
      backgroundColor: colors.primary,
    },
    buttonSecondary: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonText: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    buttonTextPrimary: {
      color: colors.textInverse,
    },
    buttonTextSecondary: {
      color: colors.text,
    },
    skipButton: {
      alignSelf: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      marginTop: spacing.sm,
    },
    skipText: {
      fontSize: fontSizes.sm,
      color: colors.textLight,
      textDecorationLine: 'underline',
    },
  });

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.tooltip}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{step.title}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={skipTour}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={styles.description}>{step.description}</Text>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              Step {currentStep + 1} of {activeTour.steps.length}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {!isFirstStep && (
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={previousStep}
              >
                <Ionicons name="chevron-back" size={18} color={colors.text} />
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                  Back
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, isFirstStep && { flex: 2 }]}
              onPress={isLastStep ? completeTour : nextStep}
            >
              <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
                {isLastStep ? 'Finish' : 'Next'}
              </Text>
              {!isLastStep && (
                <Ionicons name="chevron-forward" size={18} color={colors.textInverse} />
              )}
            </TouchableOpacity>
          </View>

          {/* Skip button */}
          {step.skippable && (
            <TouchableOpacity style={styles.skipButton} onPress={skipTour}>
              <Text style={styles.skipText}>Skip tour</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

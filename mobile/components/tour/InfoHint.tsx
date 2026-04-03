import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface InfoHintProps {
  text: string;
  variant?: 'inline' | 'tooltip';
  icon?: keyof typeof Ionicons.glyphMap;
}

/**
 * InfoHint - A subtle, non-intrusive way to provide contextual help
 * Use sparingly to avoid cluttering the UI
 */
export function InfoHint({ text, variant = 'inline', icon = 'information-circle-outline' }: InfoHintProps) {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.xs,
      padding: spacing.sm,
      backgroundColor: colors.primary + '10',
      borderRadius: borderRadius.md,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    iconButton: {
      padding: 2,
    },
    text: {
      flex: 1,
      fontSize: fontSizes.sm,
      color: colors.text,
      lineHeight: 18,
    },
    tooltipContainer: {
      position: 'relative',
    },
    tooltipTrigger: {
      padding: spacing.xs,
    },
    tooltipContent: {
      position: 'absolute',
      top: 30,
      right: 0,
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      minWidth: 200,
      maxWidth: 280,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
      zIndex: 1000,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tooltipText: {
      fontSize: fontSizes.sm,
      color: colors.text,
      lineHeight: 18,
    },
  });

  if (variant === 'tooltip') {
    return (
      <View style={styles.tooltipContainer}>
        <TouchableOpacity
          style={styles.tooltipTrigger}
          onPress={() => setExpanded(!expanded)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name={icon} size={18} color={colors.primary} />
        </TouchableOpacity>
        {expanded && (
          <View style={styles.tooltipContent}>
            <Text style={styles.tooltipText}>{text}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={16} color={colors.primary} style={{ marginTop: 1 }} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

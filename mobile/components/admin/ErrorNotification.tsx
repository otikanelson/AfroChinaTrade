/**
 * ErrorNotification
 *
 * A prominent, dismissible error banner for the admin section.
 * More visible than a toast — intended for operation failures
 * (e.g. failed API calls, form submission errors).
 *
 * Usage:
 *   const [error, setError] = useState<string | null>(null);
 *   <ErrorNotification message={error} onDismiss={() => setError(null)} />
 *
 * When backend integration is added, wire `onRetry` to re-trigger the failed call.
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface ErrorNotificationProps {
  /** The error message to display. Pass null/undefined to hide. */
  message: string | null | undefined;
  /** Optional title shown above the message */
  title?: string;
  /** Severity controls the colour scheme */
  severity?: ErrorSeverity;
  /** Called when the user taps the dismiss (×) button */
  onDismiss?: () => void;
  /** Optional retry callback — shown as a "Try again" link */
  onRetry?: () => void;
  /** Auto-dismiss after this many ms. Omit to keep visible until dismissed. */
  autoDismissMs?: number;
  /** Extra container style */
  style?: ViewStyle;
  testID?: string;
}

// ---------------------------------------------------------------------------
// Severity config
// ---------------------------------------------------------------------------

const SEVERITY_CONFIG: Record<
  ErrorSeverity,
  { bg: string; border: string; icon: React.ComponentProps<typeof Ionicons>['name']; iconColor: string; titleColor: string; textColor: string }
> = {
  error: {
    bg: '#FEF2F2',
    border: theme.colors.error,
    icon: 'alert-circle',
    iconColor: theme.colors.error,
    titleColor: '#7F1D1D',
    textColor: '#991B1B',
  },
  warning: {
    bg: '#FFFBEB',
    border: theme.colors.warning,
    icon: 'warning',
    iconColor: '#D97706',
    titleColor: '#78350F',
    textColor: '#92400E',
  },
  info: {
    bg: '#EFF6FF',
    border: theme.colors.info,
    icon: 'information-circle',
    iconColor: theme.colors.info,
    titleColor: '#1E3A5F',
    textColor: '#1E40AF',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  message,
  title,
  severity = 'error',
  onDismiss,
  onRetry,
  autoDismissMs,
  style,
  testID,
}) => {
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const autoDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isVisible = Boolean(message);

  useEffect(() => {
    if (isVisible) {
      // Slide down + fade in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      if (autoDismissMs && onDismiss) {
        autoDismissTimer.current = setTimeout(onDismiss, autoDismissMs);
      }
    } else {
      // Slide up + fade out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -80,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      if (autoDismissTimer.current) {
        clearTimeout(autoDismissTimer.current);
      }
    }

    return () => {
      if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
    };
  }, [isVisible, autoDismissMs]);

  if (!isVisible) return null;

  const cfg = SEVERITY_CONFIG[severity];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: cfg.bg,
          borderLeftColor: cfg.border,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
      testID={testID}
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      {/* Icon */}
      <Ionicons
        name={cfg.icon}
        size={20}
        color={cfg.iconColor}
        style={styles.icon}
      />

      {/* Text content */}
      <View style={styles.textContainer}>
        {title ? (
          <Text style={[styles.title, { color: cfg.titleColor }]} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        <Text style={[styles.message, { color: cfg.textColor }]}>
          {message}
        </Text>
        {onRetry ? (
          <Pressable onPress={onRetry} hitSlop={8} accessibilityRole="button" accessibilityLabel="Retry">
            <Text style={[styles.retryLink, { color: cfg.border }]}>
              Try again
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* Dismiss button */}
      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          hitSlop={12}
          style={styles.dismissButton}
          accessibilityRole="button"
          accessibilityLabel="Dismiss error"
        >
          <Ionicons name="close" size={18} color={cfg.iconColor} />
        </Pressable>
      ) : null}
    </Animated.View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.md,
  },
  icon: {
    marginTop: 1,
    marginRight: theme.spacing.sm,
  },
  textContainer: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  title: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold as '600',
  },
  message: {
    fontSize: theme.fontSizes.sm,
    lineHeight: theme.lineHeights.normal,
  },
  retryLink: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold as '600',
    textDecorationLine: 'underline',
    marginTop: 2,
  },
  dismissButton: {
    marginLeft: theme.spacing.sm,
    padding: 2,
  },
});

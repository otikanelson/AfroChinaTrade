import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { usePullToRefresh } from '../hooks/usePullToRefresh';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  refreshThreshold?: number;
  autoRefreshInterval?: number;
  enableAutoRefresh?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  refreshThreshold = 80,
  autoRefreshInterval = 30000,
  enableAutoRefresh = true,
}) => {
  const { colors, spacing, fontSizes } = useTheme();
  const [showAutoRefreshIndicator, setShowAutoRefreshIndicator] = useState(false);
  
  const {
    isRefreshing,
    translateY,
    panResponder,
    startAutoRefresh,
    stopAutoRefresh,
  } = usePullToRefresh({
    onRefresh: async () => {
      setShowAutoRefreshIndicator(true);
      await onRefresh();
      setTimeout(() => setShowAutoRefreshIndicator(false), 1000);
    },
    refreshThreshold,
    autoRefreshInterval,
  });

  useEffect(() => {
    if (enableAutoRefresh) {
      startAutoRefresh();
      return () => stopAutoRefresh();
    }
  }, [enableAutoRefresh, startAutoRefresh, stopAutoRefresh]);

  const refreshIndicatorOpacity = translateY.interpolate({
    inputRange: [0, refreshThreshold / 2, refreshThreshold],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const refreshIndicatorScale = translateY.interpolate({
    inputRange: [0, refreshThreshold],
    outputRange: [0.5, 1],
    extrapolate: 'clamp',
  });

  const refreshIconRotation = translateY.interpolate({
    inputRange: [0, refreshThreshold],
    outputRange: ['0deg', '180deg'],
    extrapolate: 'clamp',
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    refreshIndicator: {
      position: 'absolute',
      top: -60,
      left: 0,
      right: 0,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      zIndex: 1000,
    },
    refreshContent: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
    },
    refreshText: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    contentContainer: {
      flex: 1,
    },
    autoRefreshIndicator: {
      position: 'absolute',
      top: 10,
      right: 16,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 20,
      zIndex: 1001,
      gap: spacing.xs,
    },
    autoRefreshText: {
      fontSize: fontSizes.xs,
      color: colors.textInverse,
      fontWeight: '500',
    },
  });

  const renderRefreshIndicator = () => {
    const progress = Math.min(Math.max(translateY._value / refreshThreshold, 0), 1);
    
    return (
      <Animated.View
        style={[
          styles.refreshIndicator,
          {
            opacity: refreshIndicatorOpacity,
            transform: [{ scale: refreshIndicatorScale }],
          },
        ]}
      >
        <View style={styles.refreshContent}>
          {isRefreshing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Animated.View
              style={{
                transform: [{ rotate: refreshIconRotation }],
              }}
            >
              <Ionicons
                name="arrow-down"
                size={20}
                color={progress >= 1 ? colors.primary : colors.textSecondary}
              />
            </Animated.View>
          )}
          <Text style={styles.refreshText}>
            {isRefreshing
              ? 'Refreshing...'
              : progress >= 1
              ? 'Release to refresh'
              : 'Pull to refresh'}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {renderRefreshIndicator()}
      
      {/* Auto-refresh indicator */}
      {showAutoRefreshIndicator && (
        <View style={styles.autoRefreshIndicator}>
          <ActivityIndicator size="small" color={colors.textInverse} />
          <Text style={styles.autoRefreshText}>Auto-refreshing</Text>
        </View>
      )}
      
      <Animated.View
        style={[
          styles.contentContainer,
          {
            transform: [
              {
                translateY: translateY.interpolate({
                  inputRange: [0, refreshThreshold * 2],
                  outputRange: [0, refreshThreshold],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};
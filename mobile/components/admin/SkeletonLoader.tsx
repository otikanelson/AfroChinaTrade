import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '../../theme';

export interface SkeletonLoaderProps {
  /** Number of skeleton rows to render */
  rows?: number;
  /** Height of each row in pixels */
  height?: number;
  /** Width of each row — number (px) or percentage string e.g. '80%' */
  width?: number | `${number}%` | 'auto';
  /** Border radius of each row */
  borderRadius?: number;
  /** Gap between rows */
  gap?: number;
  /** Container style override */
  style?: ViewStyle;
}

/**
 * Reusable animated shimmer skeleton loader.
 * Use this on detail screens and form loading states where DataList's
 * built-in SkeletonList is not available.
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  rows = 4,
  height = 20,
  width = '100%',
  borderRadius = theme.borderRadius.base,
  gap = theme.spacing.sm,
  style,
}) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.85],
  });

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: rows }).map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.row,
            {
              height,
              width,
              borderRadius,
              opacity,
              marginBottom: i < rows - 1 ? gap : 0,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    backgroundColor: theme.colors.borderLight,
  },
});

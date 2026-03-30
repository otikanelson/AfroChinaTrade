import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius } from '../theme/spacing';

interface ProductCardSkeletonProps {
  variant?: 'grid' | 'list';
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ 
  variant = 'grid' 
}) => {
  const { colors } = useTheme();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      marginBottom: 5,
    },
    listContainer: {
      flexDirection: 'row',
      minHeight: 120,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
    },
    gridContainer: {
      width: '100%',
      minHeight: 200,
    },
    imageContainer: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.sm,
    },
    listImage: {
      width: 100,
      height: 100,
    },
    gridImage: {
      width: '100%',
      aspectRatio: 1,
    },
    content: {
      padding: spacing.sm,
      flex: 1,
    },
    gridContent: {
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xs,
      gap: spacing.xs,
    },
    titleLine: {
      height: 14,
      backgroundColor: colors.surface,
      borderRadius: 4,
      marginBottom: spacing.xs,
    },
    priceLine: {
      height: 16,
      backgroundColor: colors.surface,
      borderRadius: 4,
      width: '60%',
      marginBottom: spacing.xs,
    },
    supplierLine: {
      height: 12,
      backgroundColor: colors.surface,
      borderRadius: 4,
      width: '40%',
    },
  });

  if (variant === 'list') {
    return (
      <View style={[styles.container, styles.listContainer]}>
        <Animated.View style={[styles.imageContainer, styles.listImage, { opacity }]} />
        <View style={styles.content}>
          <Animated.View style={[styles.titleLine, { opacity }]} />
          <Animated.View style={[styles.titleLine, { opacity, width: '80%' }]} />
          <View style={{ marginTop: spacing.sm }}>
            <Animated.View style={[styles.priceLine, { opacity }]} />
            <Animated.View style={[styles.supplierLine, { opacity }]} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.gridContainer]}>
      <Animated.View style={[styles.imageContainer, styles.gridImage, { opacity }]} />
      <View style={styles.gridContent}>
        <Animated.View style={[styles.titleLine, { opacity }]} />
        <Animated.View style={[styles.titleLine, { opacity, width: '70%' }]} />
        <View style={{ marginTop: spacing.xs }}>
          <Animated.View style={[styles.priceLine, { opacity }]} />
          <Animated.View style={[styles.supplierLine, { opacity }]} />
        </View>
      </View>
    </View>
  );
};
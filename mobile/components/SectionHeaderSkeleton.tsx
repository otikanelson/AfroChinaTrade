import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { spacing } from '../theme/spacing';

export const SectionHeaderSkeleton: React.FC = () => {
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
    },
    titleLine: {
      height: 20,
      width: 150,
      backgroundColor: colors.surface,
      borderRadius: 4,
    },
    actionLine: {
      height: 16,
      width: 60,
      backgroundColor: colors.surface,
      borderRadius: 4,
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.titleLine, { opacity }]} />
      <Animated.View style={[styles.actionLine, { opacity }]} />
    </View>
  );
};
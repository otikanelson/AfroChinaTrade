import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';

interface AnimatedCartBadgeProps {
  count: number;
  color: string;
  textColor: string;
}

export const AnimatedCartBadge: React.FC<AnimatedCartBadgeProps> = ({ count, color, textColor }) => {
  const scale = useRef(new Animated.Value(count > 0 ? 1 : 0)).current;
  const prevCount = useRef(count);

  useEffect(() => {
    if (count > 0 && prevCount.current === 0) {
      // Badge appearing — pop in
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 300, useNativeDriver: true }).start();
    } else if (count > 0 && count !== prevCount.current) {
      // Count changed — quick pulse that stays within bounds
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.15, duration: 100, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 5, tension: 300, useNativeDriver: true }),
      ]).start();
    } else if (count === 0) {
      Animated.timing(scale, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    }
    prevCount.current = count;
  }, [count]);

  if (count <= 0) return null;

  return (
    <Animated.View style={[styles.badge, { backgroundColor: color, transform: [{ scale }] }]}>
      <Text style={[styles.text, { color: textColor }]}>
        {count > 99 ? '99+' : count}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
    paddingHorizontal: 3,
  },
  text: {
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 11,
  },
});

import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

interface StaggeredItemProps {
  index: number;
  children: React.ReactNode;
  delay?: number;
}

export const StaggeredItem: React.FC<StaggeredItemProps> = ({ index, children, delay = 50 }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const d = index * delay;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: d,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        delay: d,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

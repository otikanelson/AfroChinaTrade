import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

interface SpringTabIconProps {
  focused: boolean;
  children: React.ReactNode;
}

// Expo Router renders tab icons outside the normal React tree,
// so we use a simple scale animation triggered by the focused prop.
export const SpringTabIcon: React.FC<SpringTabIconProps> = ({ focused, children }) => {
  const scale = useRef(new Animated.Value(focused ? 1.2 : 1)).current;
  const isFirst = useRef(true);

  useEffect(() => {
    // Skip animation on first render to avoid initial bounce on all tabs
    if (isFirst.current) {
      isFirst.current = false;
      scale.setValue(focused ? 1.2 : 1);
      return;
    }
    Animated.spring(scale, {
      toValue: focused ? 1.2 : 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      {children}
    </Animated.View>
  );
};

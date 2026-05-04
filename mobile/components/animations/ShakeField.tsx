import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Animated } from 'react-native';

export interface ShakeFieldRef {
  shake: () => void;
}

interface ShakeFieldProps {
  children: React.ReactNode;
  hasError?: boolean;
}

export const ShakeField = forwardRef<ShakeFieldRef, ShakeFieldProps>(
  ({ children, hasError }, ref) => {
    const translateX = useRef(new Animated.Value(0)).current;

    const shake = () => {
      Animated.sequence([
        Animated.timing(translateX, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: -6, duration: 50, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 6, duration: 50, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: -4, duration: 50, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    };

    useImperativeHandle(ref, () => ({ shake }));

    useEffect(() => {
      if (hasError) shake();
    }, [hasError]);

    return (
      <Animated.View style={{ transform: [{ translateX }] }}>
        {children}
      </Animated.View>
    );
  }
);

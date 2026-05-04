import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

interface SuccessCheckmarkProps {
  visible: boolean;
  size?: number;
  color?: string;
  onComplete?: () => void;
}

export const SuccessCheckmark: React.FC<SuccessCheckmarkProps> = ({
  visible,
  size = 80,
  color = '#16a34a',
  onComplete,
}) => {
  const circleScale = useRef(new Animated.Value(0)).current;
  const circleOpacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0.5)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(circleOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(circleScale, { toValue: 1, speed: 20, bounciness: 8, useNativeDriver: true }),
      ]).start(() => {
        Animated.parallel([
          Animated.timing(checkOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.sequence([
            Animated.spring(checkScale, { toValue: 1.2, speed: 30, bounciness: 6, useNativeDriver: true }),
            Animated.spring(checkScale, { toValue: 1, speed: 20, bounciness: 8, useNativeDriver: true }),
          ]),
        ]).start(() => { if (onComplete) onComplete(); });
      });
    } else {
      Animated.parallel([
        Animated.timing(circleScale, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(circleOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(checkOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(checkScale, { toValue: 0.5, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const strokeWidth = size * 0.06;

  return (
    <Animated.View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color + '20', justifyContent: 'center', alignItems: 'center',
      opacity: circleOpacity, transform: [{ scale: circleScale }],
    }}>
      <Animated.View style={{
        width: size * 0.75, height: size * 0.75, borderRadius: (size * 0.75) / 2,
        backgroundColor: color, justifyContent: 'center', alignItems: 'center',
        opacity: checkOpacity, transform: [{ scale: checkScale }],
      }}>
        <View style={{ width: size * 0.4, height: size * 0.25, justifyContent: 'flex-end' }}>
          <View style={{ position: 'absolute', bottom: 0, left: 0, width: size * 0.15, height: strokeWidth, backgroundColor: '#fff', borderRadius: strokeWidth, transform: [{ rotate: '45deg' }, { translateY: -size * 0.04 }] }} />
          <View style={{ position: 'absolute', bottom: 0, right: 0, width: size * 0.28, height: strokeWidth, backgroundColor: '#fff', borderRadius: strokeWidth, transform: [{ rotate: '-55deg' }, { translateY: -size * 0.06 }] }} />
        </View>
      </Animated.View>
    </Animated.View>
  );
};

import React, { useEffect, useRef } from 'react';
import { RefreshControl, RefreshControlProps, Animated, Easing } from 'react-native';

interface BrandedRefreshControlProps extends Omit<RefreshControlProps, 'refreshing'> {
  refreshing: boolean;
  primaryColor: string;
  backgroundColor?: string;
}

export const BrandedRefreshControl: React.FC<BrandedRefreshControlProps> = ({
  refreshing, primaryColor, backgroundColor = 'transparent', ...rest
}) => (
  <RefreshControl
    refreshing={refreshing}
    colors={[primaryColor]}
    tintColor={primaryColor}
    progressBackgroundColor={backgroundColor}
    {...rest}
  />
);

export const SpinningRing: React.FC<{ size?: number; color?: string; visible?: boolean }> = ({
  size = 32, color = '#C41E3A', visible = true,
}) => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.timing(rotation, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true })
      ).start();
    } else {
      rotation.setValue(0);
    }
  }, [visible]);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  if (!visible) return null;

  return (
    <Animated.View style={{
      width: size, height: size, borderRadius: size / 2,
      borderWidth: size * 0.1, borderColor: color + '30', borderTopColor: color,
      transform: [{ rotate: spin }],
    }} />
  );
};

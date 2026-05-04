import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, ViewStyle } from 'react-native';

interface SkeletonBoxProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  baseColor?: string;
}

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 6,
  style,
  baseColor = '#E0E0E0',
}) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.4, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[{ width: width as any, height: height as any, borderRadius, backgroundColor: baseColor, opacity }, style]}
    />
  );
};

export const ProductCardSkeleton: React.FC<{ baseColor?: string }> = ({ baseColor }) => (
  <View style={{ width: '100%', overflow: 'hidden' }}>
    <SkeletonBox width="100%" height={140} borderRadius={0} baseColor={baseColor} />
    <View style={{ padding: 8, gap: 6 }}>
      <SkeletonBox width="80%" height={12} baseColor={baseColor} />
      <SkeletonBox width="50%" height={12} baseColor={baseColor} />
      <SkeletonBox width="40%" height={16} baseColor={baseColor} />
    </View>
  </View>
);

export const ListItemSkeleton: React.FC<{ baseColor?: string }> = ({ baseColor }) => (
  <View style={{ flexDirection: 'row', padding: 12, gap: 12, alignItems: 'center' }}>
    <SkeletonBox width={80} height={80} borderRadius={8} baseColor={baseColor} />
    <View style={{ flex: 1, gap: 8 }}>
      <SkeletonBox width="70%" height={12} baseColor={baseColor} />
      <SkeletonBox width="50%" height={12} baseColor={baseColor} />
      <SkeletonBox width="30%" height={16} baseColor={baseColor} />
    </View>
  </View>
);

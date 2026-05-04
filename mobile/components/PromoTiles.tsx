import React, { useEffect, useRef } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Ad } from '../services/AdService';

const TILE_SIZE = 110;
const AUTO_SCROLL_INTERVAL = 3000;

const PromoTile: React.FC<{ ad: Ad; index: number; onPress: (ad: Ad) => void }> = ({ ad, index, onPress }) => {
  const { colors, fontSizes, spacing } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay: index * 60, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 350, delay: index * 60, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ width: TILE_SIZE, alignItems: 'center', marginRight: spacing.sm, opacity, transform: [{ translateY }, { scale }] }}>
      <TouchableOpacity
        onPress={() => onPress(ad)}
        onPressIn={() => Animated.spring(scale, { toValue: 0.93, useNativeDriver: true, speed: 30, bounciness: 6 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start()}
        disabled={!ad.linkPath}
        activeOpacity={1}
      >
        <View style={{ width: TILE_SIZE, height: TILE_SIZE, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight }}>
          <Image source={{ uri: ad.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        </View>
        <Text style={{ fontSize: fontSizes.xs, color: colors.text, textAlign: 'center', marginTop: 5, lineHeight: 15 }} numberOfLines={2}>
          {ad.title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const PromoTiles: React.FC<{ ads: Ad[] }> = ({ ads }) => {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const currentIndex = useRef(0);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      currentIndex.current = (currentIndex.current + 1) % ads.length;
      scrollRef.current?.scrollTo({ x: currentIndex.current * (TILE_SIZE + spacing.sm), animated: true });
    }, AUTO_SCROLL_INTERVAL);
    return () => clearInterval(interval);
  }, [ads.length]);

  if (!ads.length) return null;

  const handlePress = (ad: Ad) => {
    if (ad.linkPath) router.push({ pathname: ad.linkPath as any, params: ad.linkParams });
  };

  return (
    <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ backgroundColor: colors.background, marginBottom: 20, paddingBottom: spacing.sm, paddingLeft: spacing.sm }}>
      {ads.map((ad, index) => <PromoTile key={ad._id} ad={ad} index={index} onPress={handlePress} />)}
    </ScrollView>
  );
};

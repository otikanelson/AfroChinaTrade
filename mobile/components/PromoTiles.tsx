import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Ad } from '../services/AdService';

const TILE_SIZE = 110;

interface PromoTilesProps {
  ads: Ad[];
}

export const PromoTiles: React.FC<PromoTilesProps> = ({ ads }) => {
  const { colors, spacing, fontSizes, borderRadius } = useTheme();
  const router = useRouter();

  if (!ads.length) return null;

  const handlePress = (ad: Ad) => {
    if (ad.linkPath) {
      router.push({ pathname: ad.linkPath as any, params: ad.linkParams });
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ backgroundColor: colors.background, marginBottom: 20, paddingHorizontal: spacing.base, gap: spacing.sm, paddingTop: spacing.lg, paddingBottom: spacing.sm }}
    >
      {ads.map(ad => (
        <TouchableOpacity
          key={ad._id}
          activeOpacity={ad.linkPath ? 0.8 : 1}
          onPress={() => handlePress(ad)}
          style={{ width: TILE_SIZE, alignItems: 'center' }}
        >
          <View style={{
            width: TILE_SIZE,
            height: TILE_SIZE,
            overflow: 'hidden',
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.borderLight,
          }}>
            <Image
              source={{ uri: ad.imageUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
          <Text
            style={{
              fontSize: fontSizes.xs,
              color: colors.text,
              textAlign: 'center',
              marginTop: 5,
              lineHeight: 15,
            }}
            numberOfLines={2}
          >
            {ad.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

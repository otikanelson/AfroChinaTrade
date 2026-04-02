import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: W, height: H } = Dimensions.get('window');

// Icons that feel commerce/chat themed
const ICONS: Array<keyof typeof Ionicons.glyphMap> = [
  'chatbubble-ellipses',
  'storefront',
  'bag-handle',
  'pricetag',
  'star',
  'heart',
  'cube',
  'cart',
  'ribbon',
  'sparkles',
];

const TILE_SIZE = 72;
const COLS = Math.ceil(W / TILE_SIZE) + 1;
const ROWS = Math.ceil(H / TILE_SIZE) + 1;

interface ChatBackgroundProps {
  /** Base color for the icons — should be a dark theme color */
  color?: string;
  opacity?: number;
}

export const ChatBackground: React.FC<ChatBackgroundProps> = ({
  color = '#1B3A28',   // darkColors.secondary
  opacity = 0.07,
}) => {
  const tiles = useMemo(() => {
    const result: { key: string; icon: keyof typeof Ionicons.glyphMap; row: number; col: number; rotate: number }[] = [];
    let iconIndex = 0;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        // Checkerboard offset for odd rows
        const offset = row % 2 === 1 ? TILE_SIZE / 2 : 0;
        result.push({
          key: `${row}-${col}`,
          icon: ICONS[iconIndex % ICONS.length],
          row,
          col,
          rotate: (iconIndex * 17) % 30 - 15, // subtle random-ish rotation -15..+15
        });
        iconIndex++;
      }
    }
    return result;
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {tiles.map(({ key, icon, row, col, rotate }) => {
        const offset = row % 2 === 1 ? TILE_SIZE / 2 : 0;
        return (
          <View
            key={key}
            style={{
              position: 'absolute',
              left: col * TILE_SIZE + offset - TILE_SIZE / 2,
              top: row * TILE_SIZE - TILE_SIZE / 2,
              width: TILE_SIZE,
              height: TILE_SIZE,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ rotate: `${rotate}deg` }],
              opacity,
            }}
          >
            <Ionicons name={icon} size={22} color={color} />
          </View>
        );
      })}
    </View>
  );
};

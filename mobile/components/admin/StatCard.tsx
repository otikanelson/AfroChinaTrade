import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface StatCardProps {
  label: string;
  value: string;
  accent: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, accent, icon }) => {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  return (
    <View style={{
      width: '48%',
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      borderLeftWidth: 3,
      borderLeftColor: accent,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    }}>
      <View style={{
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: accent + '20',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Ionicons name={icon} size={14} color={accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: fontSizes.base, fontWeight: fontWeights.bold as any, color: colors.text }} numberOfLines={1}>
          {value}
        </Text>
        <Text style={{ fontSize: 10, color: colors.textSecondary, marginTop: 1 }}>{label}</Text>
      </View>
    </View>
  );
};

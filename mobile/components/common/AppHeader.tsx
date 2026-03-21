import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
}

export function AppHeader({ 
  title, 
  showBackButton = true, 
  rightComponent,
  onBackPress 
}: AppHeaderProps) {
  const router = useRouter();
  const { colors, fonts, fontSizes, spacing } = useTheme();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      minHeight: 56, // Standardized header height
    },
    backButton: {
      marginRight: spacing.md,
      padding: spacing.xs,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: fontSizes.xl,
      fontFamily: fonts.bold,
      color: colors.text,
      fontWeight: '700',
    },
    rightContainer: {
      marginLeft: spacing.md,
    },
  });

  return (
    <View style={styles.header}>
      {showBackButton && (
        <TouchableOpacity 
          onPress={handleBackPress} 
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      )}
      
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      
      {rightComponent && (
        <View style={styles.rightContainer}>
          {rightComponent}
        </View>
      )}
    </View>
  );
}
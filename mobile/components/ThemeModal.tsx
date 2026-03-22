import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeMode } from '../contexts/ThemeContext';
import { spacing } from '../theme/spacing';

interface ThemeModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const ThemeModal: React.FC<ThemeModalProps> = ({ visible, onClose }) => {
  const { themeMode, toggleTheme, colors, fonts, fontSizes } = useTheme();

  const handleThemeSelect = (selectedMode: ThemeMode) => {
    if (selectedMode !== themeMode) {
      toggleTheme();
    }
    onClose();
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modal: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: spacing.lg,
      width: screenWidth - spacing.xl * 2,
      maxWidth: 320,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: fontSizes.lg,
      fontFamily: fonts.bold,
      color: colors.text,
    },
    closeButton: {
      padding: spacing.xs,
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderRadius: 12,
      marginBottom: spacing.sm,
    },
    themeOptionActive: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    themeOptionInactive: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeIcon: {
      marginRight: spacing.md,
    },
    themeContent: {
      flex: 1,
    },
    themeTitle: {
      fontSize: fontSizes.base,
      fontFamily: fonts.medium,
      color: colors.text,
      marginBottom: 2,
    },
    themeDescription: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.regular,
      color: colors.textSecondary,
    },
    checkIcon: {
      marginLeft: spacing.sm,
    },
  });

  const themeOptions = [
    {
      mode: 'light' as ThemeMode,
      title: 'Light Mode',
      description: 'Clean and bright interface',
      icon: 'sunny-outline',
    },
    {
      mode: 'dark' as ThemeMode,
      title: 'Dark Mode',
      description: 'Easy on the eyes in low light',
      icon: 'moon-outline',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.title}>Choose Theme</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {themeOptions.map((option) => {
              const isActive = option.mode === themeMode;
              return (
                <TouchableOpacity
                  key={option.mode}
                  style={[
                    styles.themeOption,
                    isActive ? styles.themeOptionActive : styles.themeOptionInactive,
                  ]}
                  onPress={() => handleThemeSelect(option.mode)}
                  activeOpacity={0.7}
                >
                  <View style={styles.themeIcon}>
                    <Ionicons
                      name={option.icon as any}
                      size={24}
                      color={isActive ? colors.primary : colors.textSecondary}
                    />
                  </View>
                  <View style={styles.themeContent}>
                    <Text style={styles.themeTitle}>{option.title}</Text>
                    <Text style={styles.themeDescription}>
                      {option.description}
                    </Text>
                  </View>
                  {isActive && (
                    <View style={styles.checkIcon}>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={colors.primary}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
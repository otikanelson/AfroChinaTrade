import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing } from '../../theme/spacing';

interface CategoryFilterModalProps {
  visible: boolean;
  onClose: () => void;
  categories: Array<{label: string, value: string}>;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const CategoryFilterModal: React.FC<CategoryFilterModalProps> = ({
  visible,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const { colors, fonts, fontSizes, borderRadius } = useTheme();

  const handleCategorySelect = (categoryValue: string) => {
    onSelectCategory(categoryValue);
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
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      width: screenWidth - spacing.xl * 2,
      maxWidth: 400,
      maxHeight: '80%',
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
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: fontSizes.lg,
      fontFamily: fonts.bold,
      color: colors.text,
    },
    closeButton: {
      padding: spacing.xs,
    },
    scrollContainer: {
      maxHeight: 400,
    },
    categoryOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.md,
      marginBottom: spacing.xs,
    },
    categoryOptionActive: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    categoryOptionInactive: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryContent: {
      flex: 1,
    },
    categoryTitle: {
      fontSize: fontSizes.base,
      fontFamily: fonts.medium,
      color: colors.text,
    },
    checkIcon: {
      marginLeft: spacing.sm,
    },
  });

  const allCategories = [
    { label: 'All Categories', value: 'all' },
    ...categories,
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
              <Text style={styles.title}>Filter by Category</Text>
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

            <ScrollView
              style={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              {allCategories.map((category) => {
                const isActive = category.value === selectedCategory;
                return (
                  <TouchableOpacity
                    key={category.value}
                    style={[
                      styles.categoryOption,
                      isActive ? styles.categoryOptionActive : styles.categoryOptionInactive,
                    ]}
                    onPress={() => handleCategorySelect(category.value)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.categoryContent}>
                      <Text style={styles.categoryTitle}>{category.label}</Text>
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
            </ScrollView>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
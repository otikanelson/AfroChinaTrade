import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ChatOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onAskQuestion: () => void;
  onRequestQuote: () => void;
  productName?: string;
}

export const ChatOptionsModal: React.FC<ChatOptionsModalProps> = ({
  visible,
  onClose,
  onAskQuestion,
  onRequestQuote,
  productName,
}) => {
  const { colors: themeColors, spacing: themeSpacing, fontSizes, fontWeights, borderRadius } = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: themeColors.background,
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
      paddingTop: themeSpacing.base,
      paddingBottom: themeSpacing.xl,
      paddingHorizontal: themeSpacing.base,
      maxHeight: screenHeight * 0.6,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: themeColors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: themeSpacing.lg,
    },
    header: {
      marginBottom: themeSpacing.lg,
    },
    title: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: themeColors.text,
      textAlign: 'center',
      marginBottom: themeSpacing.xs,
    },
    subtitle: {
      fontSize: fontSizes.sm,
      color: themeColors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    productInfo: {
      backgroundColor: themeColors.surface,
      padding: themeSpacing.sm,
      borderRadius: borderRadius.base,
      marginBottom: themeSpacing.lg,
    },
    productLabel: {
      fontSize: fontSizes.xs,
      color: themeColors.textSecondary,
      marginBottom: 2,
    },
    productName: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: themeColors.text,
    },
    optionsContainer: {
      gap: themeSpacing.sm,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: themeSpacing.base,
      backgroundColor: themeColors.surface,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    optionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: themeColors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: themeSpacing.sm,
    },
    optionContent: {
      flex: 1,
    },
    optionTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: themeColors.text,
      marginBottom: 2,
    },
    optionDescription: {
      fontSize: fontSizes.sm,
      color: themeColors.textSecondary,
      lineHeight: 18,
    },
    optionArrow: {
      marginLeft: themeSpacing.sm,
    },
    cancelButton: {
      marginTop: themeSpacing.lg,
      padding: themeSpacing.sm,
      alignItems: 'center',
    },
    cancelText: {
      fontSize: fontSizes.base,
      color: themeColors.textSecondary,
      fontWeight: fontWeights.medium,
    },
  });

  const options = [
    {
      id: 'question',
      icon: 'help-circle-outline',
      title: 'Ask a Question',
      description: 'Get help with product details, specifications, or availability',
      onPress: onAskQuestion,
    },
    {
      id: 'quote',
      icon: 'document-text-outline',
      title: 'Request Quote',
      description: 'Get pricing for bulk orders or custom requirements',
      onPress: onRequestQuote,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.handle} />
              
              <View style={styles.header}>
                <Text style={styles.title}>Contact Support</Text>
                <Text style={styles.subtitle}>
                  How would you like to get help with this product?
                </Text>
              </View>

              {productName && (
                <View style={styles.productInfo}>
                  <Text style={styles.productLabel}>Product</Text>
                  <Text style={styles.productName} numberOfLines={2}>
                    {productName}
                  </Text>
                </View>
              )}

              <View style={styles.optionsContainer}>
                {options.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.option}
                    onPress={() => {
                      option.onPress();
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionIcon}>
                      <Ionicons
                        name={option.icon as any}
                        size={24}
                        color={themeColors.primary}
                      />
                    </View>
                    <View style={styles.optionContent}>
                      <Text style={styles.optionTitle}>{option.title}</Text>
                      <Text style={styles.optionDescription}>
                        {option.description}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={themeColors.textSecondary}
                      style={styles.optionArrow}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
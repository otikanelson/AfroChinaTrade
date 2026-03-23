import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Animated,
  ScrollView,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing } from '../../theme/spacing';

export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen';
export type ModalPosition = 'center' | 'bottom';

export interface CustomModalProps {
  visible: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: ModalSize;
  position?: ModalPosition;
  showCloseButton?: boolean;
  scrollable?: boolean;
  headerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const getSizeStyles = (size: ModalSize) => {
  switch (size) {
    case 'small':
      return { width: screenWidth - spacing.xl * 2, maxWidth: 280 };
    case 'medium':
      return { width: screenWidth - spacing.xl * 2, maxWidth: 380 };
    case 'large':
      return { width: screenWidth - spacing.lg * 2, maxWidth: 500 };
    case 'fullscreen':
      return { width: screenWidth, height: screenHeight };
    default:
      return { width: screenWidth - spacing.xl * 2, maxWidth: 380 };
  }
};

export const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  title,
  children,
  onClose,
  size = 'medium',
  position = 'center',
  showCloseButton = true,
  scrollable = false,
  headerStyle,
  contentStyle,
}) => {
  const { colors, fonts, fontSizes, fontWeights, borderRadius, spacing: themeSpacing } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    if (visible) {
      if (position === 'center') {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 70,
          friction: 10,
        }).start();
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 70,
          friction: 10,
        }).start();
      }
    } else {
      if (position === 'center') {
        scaleAnim.setValue(0);
      } else {
        slideAnim.setValue(screenHeight);
      }
    }
  }, [visible, position]);

  const handleClose = () => {
    if (position === 'center') {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        onClose();
      });
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        onClose();
      });
    }
  };

  const sizeStyles = getSizeStyles(size);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: position === 'center' ? 'center' : 'flex-end',
      alignItems: 'center',
    },
    container: {
      backgroundColor: colors.background,
      borderRadius: position === 'bottom' ? borderRadius.xl : borderRadius.lg,
      overflow: 'hidden',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
      ...sizeStyles,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: themeSpacing.base,
      paddingVertical: themeSpacing.base,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      minHeight: 56,
    },
    title: {
      fontSize: fontSizes.lg,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    closeButton: {
      padding: themeSpacing.sm,
      marginRight: -themeSpacing.sm,
    },
    closeIcon: {
      fontSize: 24,
      color: colors.textSecondary,
    },
    content: {
      flex: 1,
      paddingHorizontal: themeSpacing.base,
      paddingVertical: themeSpacing.base,
    },
    scrollContent: {
      paddingHorizontal: themeSpacing.base,
      paddingVertical: themeSpacing.base,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: themeSpacing.sm,
    },
  });

  const animatedStyle = position === 'center'
    ? { transform: [{ scale: scaleAnim }] }
    : { transform: [{ translateY: slideAnim }] };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.container, animatedStyle]}>
              {position === 'bottom' && <View style={styles.handle} />}

              <View style={[styles.header, headerStyle]}>
                <Text style={styles.title}>{title}</Text>
                {showCloseButton && (
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" style={styles.closeIcon} />
                  </TouchableOpacity>
                )}
              </View>

              {scrollable ? (
                <ScrollView
                  style={styles.content}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={true}
                >
                  {children}
                </ScrollView>
              ) : (
                <View style={[styles.content, contentStyle, { flex: 0 }]}>
                  {children}
                </View>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

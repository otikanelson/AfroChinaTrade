import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  onRemove?: () => void;
  hasImage?: boolean;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  visible,
  onClose,
  onCamera,
  onGallery,
  onRemove,
  hasImage = false,
}) => {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modal: {
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
    },
    header: {
      alignItems: 'center',
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: spacing.md,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      marginBottom: spacing.sm,
    },
    title: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
      color: colors.text,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      gap: spacing.md,
    },
    optionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionText: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
      color: colors.text,
    },
    optionSubtext: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    removeOption: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: spacing.sm,
      paddingTop: spacing.md,
    },
    cancelOption: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: spacing.sm,
      paddingTop: spacing.md,
    },
  });

  const handleCamera = () => {
    onClose();
    setTimeout(() => onCamera(), 100);
  };

  const handleGallery = () => {
    onClose();
    setTimeout(() => onGallery(), 100);
  };

  const handleRemove = () => {
    onClose();
    if (onRemove) {
      Alert.alert(
        'Remove Photo',
        'Are you sure you want to remove your profile photo?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: onRemove },
        ]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.handle} />
            <Text style={styles.title}>Change Profile Photo</Text>
          </View>

          <TouchableOpacity style={styles.option} onPress={handleCamera}>
            <View style={[styles.optionIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={20} color={colors.textInverse} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionText}>Take Photo</Text>
              <Text style={styles.optionSubtext}>Use camera to take a new photo</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handleGallery}>
            <View style={[styles.optionIcon, { backgroundColor: colors.secondary }]}>
              <Ionicons name="images" size={20} color={colors.textInverse} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionText}>Choose from Gallery</Text>
              <Text style={styles.optionSubtext}>Select from your photo library</Text>
            </View>
          </TouchableOpacity>

          {hasImage && onRemove && (
            <TouchableOpacity style={[styles.option, styles.removeOption]} onPress={handleRemove}>
              <View style={[styles.optionIcon, { backgroundColor: colors.error }]}>
                <Ionicons name="trash" size={20} color={colors.textInverse} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionText, { color: colors.error }]}>Remove Photo</Text>
                <Text style={styles.optionSubtext}>Delete current profile photo</Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.option, styles.cancelOption]} onPress={onClose}>
            <View style={[styles.optionIcon, { backgroundColor: colors.textSecondary }]}>
              <Ionicons name="close" size={20} color={colors.textInverse} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionText}>Cancel</Text>
              <Text style={styles.optionSubtext}>Keep current photo</Text>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
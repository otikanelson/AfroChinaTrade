import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { useToast } from '../../../hooks/useToast';
import { Toast } from '../../ui/Toast';
import { apiClient } from '../../../services/api/apiClient';

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
  mimeType?: string;
  fileName?: string;
  uploaded?: boolean;
  uploadedUrl?: string;
}

export interface ImagePickerFieldProps {
  /** Field label */
  label: string;
  /** Currently selected images */
  images: PickedImage[];
  /** Called when images change (add or remove) */
  onImagesChange: (images: PickedImage[]) => void;
  /** Maximum number of images allowed */
  maxImages?: number;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Disable the field */
  disabled?: boolean;
  /** Container style override */
  style?: ViewStyle;
  /** Whether to automatically upload images to server */
  autoUpload?: boolean;
  testID?: string;
}

const IMAGE_SIZE = 90;
const COMPRESSION_QUALITY = 0.7;

export const ImagePickerField: React.FC<ImagePickerFieldProps> = ({
  label,
  images,
  onImagesChange,
  maxImages = 10,
  error,
  helperText,
  required = false,
  disabled = false,
  autoUpload = true,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [uploadingImages, setUploadingImages] = React.useState<Set<string>>(new Set());
  const toast = useToast();
  const hasError = Boolean(error);
  const canAddMore = images.length < maxImages;

  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      toast.error('Please allow camera access in your device settings to take photos.');
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      toast.error('Please allow photo library access in your device settings to select images.');
      return false;
    }
    return true;
  };

  const mapAssets = (assets: ImagePicker.ImagePickerAsset[]): PickedImage[] =>
    assets.map((asset) => ({
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      mimeType: asset.mimeType ?? undefined,
      fileName: asset.fileName ?? undefined,
      uploaded: false,
    }));

  const uploadImage = async (image: PickedImage): Promise<PickedImage> => {
    if (!autoUpload || image.uploaded) return image;

    const imageId = image.uri;
    setUploadingImages(prev => new Set(prev).add(imageId));

    try {
      const response = await apiClient.uploadFile('/upload/image', {
        uri: image.uri,
        type: image.mimeType || 'image/jpeg',
        name: image.fileName || 'image.jpg',
      }, undefined, 'image');

      if (response.success && response.data?.url) {
        return {
          ...image,
          uploaded: true,
          uploadedUrl: response.data.url, // Backend returns 'url' not 'imageUrl'
        };
      } else {
        throw new Error(response.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload image. Please try again.');
      return image;
    } finally {
      setUploadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
    }
  };

  const launchCamera = async () => {
    const granted = await requestCameraPermission();
    if (!granted) return;

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: COMPRESSION_QUALITY,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newImages = mapAssets(result.assets);
        const combined = [...images, ...newImages].slice(0, maxImages);
        onImagesChange(combined);

        // Upload images if auto-upload is enabled
        if (autoUpload) {
          for (const image of newImages) {
            const uploadedImage = await uploadImage(image);
            if (uploadedImage.uploaded) {
              const currentImages = [...images, ...newImages].slice(0, maxImages);
              const updatedImages = currentImages.map((img: PickedImage) => 
                img.uri === image.uri ? uploadedImage : img
              );
              onImagesChange(updatedImages);
            }
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const launchGallery = async () => {
    const granted = await requestMediaLibraryPermission();
    if (!granted) return;

    const remaining = maxImages - images.length;

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: COMPRESSION_QUALITY,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newImages = mapAssets(result.assets);
        const combined = [...images, ...newImages].slice(0, maxImages);
        onImagesChange(combined);

        // Upload images if auto-upload is enabled
        if (autoUpload) {
          for (const image of newImages) {
            const uploadedImage = await uploadImage(image);
            if (uploadedImage.uploaded) {
              const currentImages = [...images, ...newImages].slice(0, maxImages);
              const updatedImages = currentImages.map((img: PickedImage) => 
                img.uri === image.uri ? uploadedImage : img
              );
              onImagesChange(updatedImages);
            }
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onImagesChange(updated);
  };

  const showPickerOptions = () => {
    if (disabled || !canAddMore) return;
    toast.info('Choose a source', 2000);
    // In a real app, you'd show an action sheet here
    // For now, we'll just show the gallery
    launchGallery();
  };

  const dynamicStyles = {
      label: {
        fontSize: theme.fontSizes.base,
        fontWeight: theme.fontWeights.semibold,
        color: colors.text,
      },
    };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Label */}
      <Text style={[dynamicStyles.label, disabled && styles.labelDisabled]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      {/* Image grid */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.grid}
      >
        {images.map((img, index) => {
          const isUploading = uploadingImages.has(img.uri);
          return (
            <View key={`${img.uri}-${index}`} style={styles.imageWrapper}>
              <Image
                source={{ uri: img.uri }}
                style={styles.image}
                accessibilityLabel={`Selected image ${index + 1}`}
                testID={testID ? `${testID}-image-${index}` : undefined}
              />
              {isUploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="small" color={theme.colors.background} />
                </View>
              )}
              {img.uploaded && (
                <View style={styles.uploadedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                </View>
              )}
              {!disabled && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove image ${index + 1}`}
                  testID={testID ? `${testID}-remove-${index}` : undefined}
                >
                  <Ionicons name="close-circle" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* Add button */}
        {canAddMore && !disabled && (
          <TouchableOpacity
            style={[styles.addButton, hasError && styles.addButtonError]}
            onPress={showPickerOptions}
            accessibilityRole="button"
            accessibilityLabel="Add image"
            accessibilityHint="Opens camera or photo library to select an image"
            disabled={loading}
            testID={testID ? `${testID}-add` : undefined}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <>
                <Ionicons
                  name="camera-outline"
                  size={24}
                  color={hasError ? theme.colors.error : theme.colors.textSecondary}
                />
                <Text style={[styles.addLabel, hasError && styles.addLabelError]}>
                  {images.length === 0 ? 'Add Photos' : 'Add More'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Count indicator */}
      {maxImages > 1 && (
        <Text style={styles.countText}>
          {images.length} / {maxImages} photos
        </Text>
      )}

      {/* Error / helper text */}
      {hasError ? (
        <View style={styles.messageRow}>
          <Ionicons
            name="alert-circle-outline"
            size={14}
            color={theme.colors.error}
            style={styles.messageIcon}
          />
          <Text
            style={styles.errorText}
            accessibilityRole="alert"
            testID={testID ? `${testID}-error` : undefined}
          >
            {error}
          </Text>
        </View>
      ) : helperText ? (
        <Text
          style={styles.helperText}
          testID={testID ? `${testID}-helper` : undefined}
        >
          {helperText}
        </Text>
      ) : null}

      {/* Toast Component */}
      <Toast {...toast} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.base,
  },
  label: {
    ...theme.typography.bodySmall,
    fontWeight: theme.fontWeights.semibold as '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  labelDisabled: {
    color: theme.colors.textLight,
  },
  required: {
    color: theme.colors.error,
  },
  grid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  imageWrapper: {
    position: 'relative',
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: theme.borderRadius.base,
    backgroundColor: theme.colors.surface,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.full,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: theme.borderRadius.base,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  addButtonError: {
    borderColor: theme.colors.error,
    backgroundColor: '#FFF8F8',
  },
  addLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  addLabelError: {
    color: theme.colors.error,
  },
  countText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  messageIcon: {
    marginRight: 4,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    flex: 1,
  },
  helperText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: theme.borderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.full,
    padding: 2,
  },
});

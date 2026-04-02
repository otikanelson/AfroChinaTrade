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
  Modal,
  Pressable,
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
  label: string;
  images: PickedImage[];
  onImagesChange: (images: PickedImage[]) => void;
  maxImages?: number;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  autoUpload?: boolean;
  /** Force a specific crop aspect ratio e.g. [1, 1] for square logos */
  aspectRatio?: [number, number];
  /** Preview shape: 'square' or 'circle' — defaults to 'square' */
  previewShape?: 'square' | 'circle';
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
  aspectRatio,
  previewShape = 'square',
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [uploadingImages, setUploadingImages] = React.useState<Set<string>>(new Set());
  const [showSourceSheet, setShowSourceSheet] = React.useState(false);
  const toast = useToast();
  const hasError = Boolean(error);
  const canAddMore = images.length < maxImages;
  const isCircle = previewShape === 'circle';
  const previewRadius = isCircle ? IMAGE_SIZE / 2 : theme.borderRadius.base;

  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      toast.error('Please allow camera access in your device settings.');
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      toast.error('Please allow photo library access in your device settings.');
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
        return { ...image, uploaded: true, uploadedUrl: response.data.url };
      }
      throw new Error(response.error?.message || 'Upload failed');
    } catch {
      toast.error('Failed to upload image. Please try again.');
      return image;
    } finally {
      setUploadingImages(prev => { const s = new Set(prev); s.delete(imageId); return s; });
    }
  };

  const processNewImages = async (newImages: PickedImage[], base: PickedImage[]) => {
    const combined = [...base, ...newImages].slice(0, maxImages);
    onImagesChange(combined);
    if (!autoUpload) return;
    for (const image of newImages) {
      const uploaded = await uploadImage(image);
      if (uploaded.uploaded) {
        onImagesChange(
          [...base, ...newImages].slice(0, maxImages).map(img =>
            img.uri === image.uri ? uploaded : img
          )
        );
      }
    }
  };

  const launchCamera = async () => {
    setShowSourceSheet(false);
    const granted = await requestCameraPermission();
    if (!granted) return;
    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: aspectRatio,
        quality: COMPRESSION_QUALITY,
      });
      if (!result.canceled && result.assets.length > 0) {
        await processNewImages(mapAssets(result.assets), images);
      }
    } finally {
      setLoading(false);
    }
  };

  const launchGallery = async () => {
    setShowSourceSheet(false);
    const granted = await requestMediaLibraryPermission();
    if (!granted) return;
    const remaining = maxImages - images.length;
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: maxImages > 1,
        allowsEditing: maxImages === 1,
        aspect: aspectRatio,
        selectionLimit: remaining,
        quality: COMPRESSION_QUALITY,
      });
      if (!result.canceled && result.assets.length > 0) {
        await processNewImages(mapAssets(result.assets), images);
      }
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Text style={[styles.label, { color: colors.text }, disabled && styles.labelDisabled]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.grid}>
        {images.map((img, index) => {
          const isUploading = uploadingImages.has(img.uri);
          return (
            <View key={`${img.uri}-${index}`} style={[styles.imageWrapper, { borderRadius: previewRadius }]}>
              <Image
                source={{ uri: img.uri }}
                style={[styles.image, { borderRadius: previewRadius }]}
                resizeMode="contain"
              />
              {isUploading && (
                <View style={[styles.uploadingOverlay, { borderRadius: previewRadius }]}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              )}
              {img.uploaded && (
                <View style={styles.uploadedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                </View>
              )}
              {!disabled && (
                <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
                  <Ionicons name="close-circle" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {canAddMore && !disabled && (
          <TouchableOpacity
            style={[styles.addButton, hasError && styles.addButtonError, { borderRadius: previewRadius }]}
            onPress={() => setShowSourceSheet(true)}
            disabled={loading}
            testID={testID ? `${testID}-add` : undefined}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={26} color={hasError ? theme.colors.error : theme.colors.textSecondary} />
                <Text style={[styles.addLabel, hasError && styles.addLabelError]}>
                  {images.length === 0 ? 'Add Photo' : 'Add More'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {maxImages > 1 && (
        <Text style={styles.countText}>{images.length} / {maxImages} photos</Text>
      )}

      {hasError ? (
        <View style={styles.messageRow}>
          <Ionicons name="alert-circle-outline" size={14} color={theme.colors.error} style={styles.messageIcon} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}

      <Modal visible={showSourceSheet} transparent animationType="slide" onRequestClose={() => setShowSourceSheet(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setShowSourceSheet(false)}>
          <View style={[styles.sheet, { backgroundColor: colors.background }]}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Choose a source</Text>

            <TouchableOpacity style={[styles.sheetOption, { borderColor: colors.border }]} onPress={launchCamera}>
              <View style={[styles.sheetIconBg, { backgroundColor: theme.colors.primary + '18' }]}>
                <Ionicons name="camera" size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.sheetOptionText}>
                <Text style={[styles.sheetOptionTitle, { color: colors.text }]}>Camera</Text>
                <Text style={[styles.sheetOptionSub, { color: colors.textSecondary }]}>Take a new photo</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.sheetOption, { borderColor: colors.border }]} onPress={launchGallery}>
              <View style={[styles.sheetIconBg, { backgroundColor: theme.colors.secondary + '18' }]}>
                <Ionicons name="images" size={22} color={theme.colors.secondary} />
              </View>
              <View style={styles.sheetOptionText}>
                <Text style={[styles.sheetOptionTitle, { color: colors.text }]}>Photo Library</Text>
                <Text style={[styles.sheetOptionSub, { color: colors.textSecondary }]}>Choose from your gallery</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.sheetCancel, { borderColor: colors.border }]} onPress={() => setShowSourceSheet(false)}>
              <Text style={[styles.sheetCancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <Toast {...toast} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: theme.spacing.base },
  label: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold as '600',
    marginBottom: theme.spacing.xs,
  },
  labelDisabled: { color: theme.colors.textLight },
  required: { color: theme.colors.error },
  grid: { flexDirection: 'row', gap: theme.spacing.sm, paddingVertical: theme.spacing.xs },
  imageWrapper: { position: 'relative', width: IMAGE_SIZE, height: IMAGE_SIZE },
  image: { width: IMAGE_SIZE, height: IMAGE_SIZE },
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
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addButtonError: { borderColor: theme.colors.error, backgroundColor: '#FFF8F8' },
  addLabel: { fontSize: 10, color: theme.colors.textSecondary, textAlign: 'center' },
  addLabelError: { color: theme.colors.error },
  countText: { fontSize: theme.fontSizes.xs, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
  messageRow: { flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.xs },
  messageIcon: { marginRight: 4 },
  errorText: { fontSize: theme.fontSizes.xs, color: theme.colors.error, flex: 1 },
  helperText: { fontSize: theme.fontSizes.xs, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
  uploadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36, gap: 12 },
  sheetTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  sheetOption: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 14, gap: 12 },
  sheetIconBg: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sheetOptionText: { flex: 1 },
  sheetOptionTitle: { fontSize: 15, fontWeight: '600' },
  sheetOptionSub: { fontSize: 12, marginTop: 1 },
  sheetCancel: { borderWidth: 1, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 4 },
  sheetCancelText: { fontSize: 15, fontWeight: '500' },
});

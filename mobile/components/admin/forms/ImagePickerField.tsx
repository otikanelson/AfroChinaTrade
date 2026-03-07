import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  ViewStyle,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme';

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
  mimeType?: string;
  fileName?: string;
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
  style,
  testID,
}) => {
  const [loading, setLoading] = React.useState(false);
  const hasError = Boolean(error);
  const canAddMore = images.length < maxImages;

  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please allow camera access in your device settings to take photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Photo Library Permission Required',
        'Please allow photo library access in your device settings to select images.',
        [{ text: 'OK' }]
      );
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
    }));

  const launchCamera = async () => {
    const granted = await requestCameraPermission();
    if (!granted) return;

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: COMPRESSION_QUALITY,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newImages = mapAssets(result.assets);
        const combined = [...images, ...newImages].slice(0, maxImages);
        onImagesChange(combined);
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: COMPRESSION_QUALITY,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newImages = mapAssets(result.assets);
        const combined = [...images, ...newImages].slice(0, maxImages);
        onImagesChange(combined);
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
    Alert.alert('Add Photo', 'Choose a source', [
      { text: 'Camera', onPress: launchCamera },
      { text: 'Photo Library', onPress: launchGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Label */}
      <Text style={[styles.label, disabled && styles.labelDisabled]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      {/* Image grid */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.grid}
      >
        {images.map((img, index) => (
          <View key={`${img.uri}-${index}`} style={styles.imageWrapper}>
            <Image
              source={{ uri: img.uri }}
              style={styles.image}
              accessibilityLabel={`Selected image ${index + 1}`}
              testID={testID ? `${testID}-image-${index}` : undefined}
            />
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
        ))}

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
});

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { imageSearchService, ImageSearchResult } from '../services/ImageSearchService';
import { ProductCard } from './ProductCard';
import { Product } from '../types/product';
import { spacing, borderRadius } from '../theme';

interface CameraSearchModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CameraSearchModal: React.FC<CameraSearchModalProps> = ({ visible, onClose }) => {
  const { colors, fonts, fontSizes } = useTheme();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ImageSearchResult | null>(null);
  const [isCapturingCamera, setIsCapturingCamera] = useState(false);
  const [isCapturingGallery, setIsCapturingGallery] = useState(false);

  const handleCameraPress = async () => {
    try {
      setIsCapturingCamera(true);
      const result = await imageSearchService.launchCamera();
      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to open camera');
    } finally {
      setIsCapturingCamera(false);
    }
  };

  const handleGalleryPress = async () => {
    try {
      setIsCapturingGallery(true);
      const result = await imageSearchService.launchImageLibrary();
      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to open gallery');
    } finally {
      setIsCapturingGallery(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedImage) return;
    try {
      setIsSearching(true);
      const result = await imageSearchService.searchByImage({ imageUri: selectedImage, limit: 20 });
      if (result.success && result.data) {
        setSearchResults(result.data);
      } else {
        Alert.alert('Search Failed', result.error?.message || 'Unable to search with this image');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleProductPress = (product: Product) => {
    const productId = (product as any)._id || product.id;
    onClose();
    router.push({ pathname: '/product-detail/[id]', params: { id: productId } });
  };

  const handleRetry = () => {
    setSelectedImage(null);
    setSearchResults(null);
  };

  const renderContent = () => {
    if (isSearching) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: fontSizes.base }]}>
            Searching for similar products...
          </Text>
        </View>
      );
    }

    if (searchResults) {
      return (
        <ScrollView style={styles.resultsScroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.resultsTitle, { color: colors.text, fontFamily: fonts.semibold, fontSize: fontSizes.lg }]}>
            {searchResults.products.length} products found
          </Text>
          {searchResults.searchTags.length > 0 && (
            <Text style={[styles.resultsSubtitle, { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: fontSizes.sm }]}>
              Detected: {searchResults.searchTags.join(', ')}
            </Text>
          )}
          {searchResults.products.length > 0 ? (
            <View style={styles.productGrid}>
              {searchResults.products.map((product) => {
                const productId = (product as any)._id || product.id;
                return (
                  <View key={productId} style={styles.productWrapper}>
                    <ProductCard product={product} onPress={() => handleProductPress(product)} showViewCount={false} />
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.centered}>
              <Ionicons name="search-outline" size={48} color={colors.textLight} />
              <Text style={[styles.noResultsText, { color: colors.textSecondary, fontFamily: fonts.medium, fontSize: fontSizes.base }]}>
                No similar products found. Try a different image or angle.
              </Text>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={handleRetry}>
                <Text style={[styles.actionButtonText, { color: colors.background, fontFamily: fonts.medium, fontSize: fontSizes.sm }]}>
                  Try Another Image
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      );
    }

    if (selectedImage) {
      return (
        <View style={styles.centered}>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          <TouchableOpacity
            style={[styles.actionButton, styles.searchButtonRow, { backgroundColor: colors.primary }]}
            onPress={handleSearch}
          >
            <Ionicons name="search" size={20} color={colors.background} />
            <Text style={[styles.actionButtonText, { color: colors.background, fontFamily: fonts.medium, fontSize: fontSizes.base }]}>
              Search Similar Products
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[styles.optionRow, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={handleCameraPress}
          disabled={isCapturingCamera || isCapturingGallery}
        >
          <View style={[styles.optionIconWrap, { backgroundColor: colors.primaryLight }]}>
            {isCapturingCamera
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Ionicons name="camera" size={24} color={colors.primary} />
            }
          </View>
          <View style={styles.optionTextWrap}>
            <Text style={[styles.optionTitle, { color: colors.text, fontFamily: fonts.medium, fontSize: fontSizes.base }]}>
              Take Photo
            </Text>
            <Text style={[styles.optionSubtitle, { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: fontSizes.sm }]}>
              Capture a product to find similar items
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionRow, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={handleGalleryPress}
          disabled={isCapturingCamera || isCapturingGallery}
        >
          <View style={[styles.optionIconWrap, { backgroundColor: colors.primaryLight }]}>
            {isCapturingGallery
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Ionicons name="images" size={24} color={colors.primary} />
            }
          </View>
          <View style={styles.optionTextWrap}>
            <Text style={[styles.optionTitle, { color: colors.text, fontFamily: fonts.medium, fontSize: fontSizes.base }]}>
              Choose from Gallery
            </Text>
            <Text style={[styles.optionSubtitle, { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: fontSizes.sm }]}>
              Select an existing photo to search
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.semibold, fontSize: fontSizes.lg }]}>
              Search by Image
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.body}>
            {renderContent()}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flex: 1,
  },
  body: {
    paddingVertical: spacing.md,
  },
  optionsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  optionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionTextWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  optionTitle: {
    marginBottom: 2,
  },
  optionSubtitle: {
    lineHeight: 18,
  },
  centered: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  actionButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  searchButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  actionButtonText: {
    marginLeft: spacing.sm,
  },
  resultsScroll: {
    maxHeight: 400,
    paddingHorizontal: spacing.lg,
  },
  resultsTitle: {
    marginBottom: spacing.xs,
  },
  resultsSubtitle: {
    marginBottom: spacing.lg,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productWrapper: {
    width: '48%',
    marginBottom: spacing.sm,
  },
  noResultsText: {
    textAlign: 'center',
    marginVertical: spacing.md,
  },
});

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
      <View style={styles.sheetBackdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>Search by Image</Text>

          <TouchableOpacity
            style={[styles.sheetOption, { borderColor: colors.border }]}
            onPress={handleCameraPress}
            disabled={isCapturingCamera || isCapturingGallery}
          >
            <View style={[styles.sheetIconBg, { backgroundColor: colors.primary + '18' }]}>
              {isCapturingCamera
                ? <ActivityIndicator size="small" color={colors.primary} />
                : <Ionicons name="camera" size={22} color={colors.primary} />
              }
            </View>
            <View style={styles.sheetOptionText}>
              <Text style={[styles.sheetOptionTitle, { color: colors.text }]}>Camera</Text>
              <Text style={[styles.sheetOptionSub, { color: colors.textSecondary }]}>Capture a product to find similar items</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sheetOption, { borderColor: colors.border }]}
            onPress={handleGalleryPress}
            disabled={isCapturingCamera || isCapturingGallery}
          >
            <View style={[styles.sheetIconBg, { backgroundColor: colors.secondary + '18' }]}>
              {isCapturingGallery
                ? <ActivityIndicator size="small" color={colors.secondary} />
                : <Ionicons name="images" size={22} color={colors.secondary} />
              }
            </View>
            <View style={styles.sheetOptionText}>
              <Text style={[styles.sheetOptionTitle, { color: colors.text }]}>Photo Library</Text>
              <Text style={[styles.sheetOptionSub, { color: colors.textSecondary }]}>Choose from your gallery</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.sheetCancel, { borderColor: colors.border }]} onPress={onClose}>
            <Text style={[styles.sheetCancelText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {!selectedImage && !searchResults && !isSearching ? (
        renderContent()
      ) : (
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
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Bottom sheet (source picker)
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

  // Centered card (search / results states)
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
  headerTitle: { flex: 1 },
  body: { paddingVertical: spacing.md },
  centered: { alignItems: 'center', padding: spacing.xl },
  loadingText: { marginTop: spacing.md, textAlign: 'center' },
  previewImage: { width: 200, height: 200, borderRadius: borderRadius.lg, marginBottom: spacing.lg },
  actionButton: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.lg },
  searchButtonRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg },
  actionButtonText: { marginLeft: spacing.sm },
  resultsScroll: { maxHeight: 400, paddingHorizontal: spacing.lg },
  resultsTitle: { marginBottom: spacing.xs },
  resultsSubtitle: { marginBottom: spacing.lg },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  productWrapper: { width: '48%', marginBottom: spacing.sm },
  noResultsText: { textAlign: 'center', marginVertical: spacing.md },
});

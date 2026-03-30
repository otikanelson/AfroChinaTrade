import * as ImagePicker from 'expo-image-picker';
import { apiClient, ApiResponse } from './api/apiClient';
import { Product } from '../types/product';

export interface ImageSearchResult {
  products: Product[];
  confidence: number;
  searchTags: string[];
}

export interface ImageSearchParams {
  imageUri: string;
  limit?: number;
  minConfidence?: number;
}

class ImageSearchService {
  /**
   * Request camera permissions
   */
  async requestCameraPermission(): Promise<boolean> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Request media library permissions
   */
  async requestMediaLibraryPermission(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Launch camera to take a photo for search
   */
  async launchCamera(): Promise<ImagePicker.ImagePickerResult> {
    const hasPermission = await this.requestCameraPermission();
    if (!hasPermission) {
      throw new Error('Camera permission denied');
    }

    return await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      aspect: [1, 1],
    });
  }

  /**
   * Launch image library to select a photo for search
   */
  async launchImageLibrary(): Promise<ImagePicker.ImagePickerResult> {
    const hasPermission = await this.requestMediaLibraryPermission();
    if (!hasPermission) {
      throw new Error('Media library permission denied');
    }

    return await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      aspect: [1, 1],
    });
  }

  /**
   * Search for products using an image
   */
  async searchByImage(params: ImageSearchParams): Promise<ApiResponse<ImageSearchResult>> {
    try {
      // Upload image and get search results
      const response = await apiClient.uploadFile(
        '/search/image',
        {
          uri: params.imageUri,
          type: 'image/jpeg',
          name: 'search-image.jpg',
        },
        {
          limit: params.limit?.toString() || '20',
          minConfidence: params.minConfidence?.toString() || '0.3',
        },
        'image'
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: {
            products: response.data.products || [],
            confidence: response.data.confidence || 0,
            searchTags: response.data.searchTags || [],
          },
        };
      }

      return {
        success: false,
        error: response.error || { message: 'Image search failed' },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to search by image',
          code: 'IMAGE_SEARCH_ERROR',
        },
      };
    }
  }

  /**
   * Get similar products based on image analysis
   * This is a fallback method that uses text-based search with extracted tags
   */
  async getSimilarProducts(searchTags: string[], limit: number = 20): Promise<ApiResponse<Product[]>> {
    try {
      if (searchTags.length === 0) {
        return {
          success: true,
          data: [],
        };
      }

      // Use the existing product search with extracted tags
      const searchQuery = searchTags.join(' ');
      const response = await apiClient.get<{ products: Product[] }>(
        `/search/products?q=${encodeURIComponent(searchQuery)}&limit=${limit}`
      );

      return response;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to get similar products',
          code: 'SIMILAR_PRODUCTS_ERROR',
        },
      };
    }
  }
}

export const imageSearchService = new ImageSearchService();
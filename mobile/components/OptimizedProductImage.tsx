import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Dimensions, PixelRatio } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, borderRadius } from '../theme/spacing';
import { fontSizes, fontWeights } from '../theme/typography';

interface OptimizedProductImageProps {
  /** Image URL - can be Cloudinary URL or regular URL */
  source: string;
  /** Width of the image container */
  width: number;
  /** Height of the image container */
  height: number;
  /** Border radius for the image */
  borderRadius?: number;
  /** Resize mode for the image */
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  /** Quality for Cloudinary optimization (1-100) */
  quality?: number;
  /** Format for Cloudinary optimization */
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  /** Placeholder text when no image */
  placeholder?: string;
  /** Custom placeholder component */
  PlaceholderComponent?: React.ComponentType;
  /** Loading component */
  LoadingComponent?: React.ComponentType;
  /** Error component */
  ErrorComponent?: React.ComponentType<{ onRetry: () => void }>;
  /** Callback when image loads successfully */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: (error: any) => void;
  /** Additional styles for the container */
  style?: any;
}

/**
 * OptimizedProductImage Component
 * 
 * A high-performance image component that:
 * - Optimizes images based on device pixel ratio for better performance
 * - Integrates with Cloudinary for dynamic resizing and format optimization
 * - Provides loading states and error handling
 * - Supports fallback to regular images when Cloudinary is not available
 * - Automatically selects optimal image size based on container dimensions
 * 
 * Features:
 * - Device pixel ratio optimization
 * - Cloudinary integration with automatic format selection
 * - Loading and error states
 * - Customizable placeholder and error components
 * - Automatic retry on error
 * - Memory efficient image loading
 */
export const OptimizedProductImage: React.FC<OptimizedProductImageProps> = ({
  source,
  width,
  height,
  borderRadius: customBorderRadius = borderRadius.md,
  resizeMode = 'cover',
  quality = 80,
  format = 'auto',
  placeholder = 'No Image',
  PlaceholderComponent,
  LoadingComponent,
  ErrorComponent,
  onLoad,
  onError,
  style
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [optimizedSource, setOptimizedSource] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  // Get device pixel ratio for optimization
  const pixelRatio = PixelRatio.get();
  const screenScale = PixelRatio.getFontScale();

  /**
   * Generate optimized Cloudinary URL based on device capabilities
   */
  const generateOptimizedUrl = (originalUrl: string): string => {
    if (!originalUrl) return '';

    // Check if it's already a Cloudinary URL
    const isCloudinaryUrl = originalUrl.includes('cloudinary.com') || originalUrl.includes('res.cloudinary.com');
    
    if (!isCloudinaryUrl) {
      // Return original URL if not Cloudinary
      return originalUrl;
    }

    try {
      // Calculate optimal dimensions based on device pixel ratio
      const optimalWidth = Math.ceil(width * pixelRatio);
      const optimalHeight = Math.ceil(height * pixelRatio);

      // Parse Cloudinary URL to inject transformations
      const urlParts = originalUrl.split('/upload/');
      if (urlParts.length !== 2) {
        return originalUrl; // Return original if URL structure is unexpected
      }

      const [baseUrl, imagePath] = urlParts;
      
      // Build transformation parameters
      const transformations = [
        `w_${optimalWidth}`,
        `h_${optimalHeight}`,
        `c_fill`, // Crop to fill the exact dimensions
        `q_${quality}`,
        `f_${format}`,
        'dpr_auto', // Automatic device pixel ratio
        'fl_progressive', // Progressive JPEG loading
        'fl_immutable_cache' // Enable immutable caching
      ];

      // Add additional optimizations based on device capabilities
      if (pixelRatio >= 3) {
        // High DPI devices - prioritize quality
        transformations.push('q_auto:good');
      } else if (pixelRatio >= 2) {
        // Medium DPI devices - balance quality and size
        transformations.push('q_auto:eco');
      } else {
        // Low DPI devices - prioritize size
        transformations.push('q_auto:low');
      }

      const transformationString = transformations.join(',');
      const optimizedUrl = `${baseUrl}/upload/${transformationString}/${imagePath}`;

      return optimizedUrl;
    } catch (error) {
      console.warn('Failed to optimize Cloudinary URL:', error);
      return originalUrl;
    }
  };

  /**
   * Handle image loading with retry logic
   */
  const handleImageLoad = () => {
    setImageState('loaded');
    setRetryCount(0);
    onLoad?.();
  };

  /**
   * Handle image error with retry logic
   */
  const handleImageError = (error: any) => {
    console.warn('Image load error:', error);
    setImageState('error');
    onError?.(error);
  };

  /**
   * Retry loading the image
   */
  const retryImageLoad = () => {
    if (retryCount < 2) { // Max 2 retries
      setRetryCount(prev => prev + 1);
      setImageState('loading');
      // Force re-generation of optimized URL
      setOptimizedSource(generateOptimizedUrl(source));
    }
  };

  // Generate optimized URL when source changes
  useEffect(() => {
    if (source) {
      const optimized = generateOptimizedUrl(source);
      setOptimizedSource(optimized);
      setImageState('loading');
    } else {
      setOptimizedSource('');
      setImageState('error');
    }
  }, [source, width, height, quality, format, pixelRatio]);

  // Container styles
  const containerStyles = [
    styles.container,
    {
      width,
      height,
      borderRadius: customBorderRadius,
    },
    style
  ];

  // Render loading state
  if (imageState === 'loading' && LoadingComponent) {
    return (
      <View style={containerStyles}>
        <LoadingComponent />
      </View>
    );
  }

  // Render loading state (default)
  if (imageState === 'loading') {
    return (
      <View style={[containerStyles, styles.loadingContainer]}>
        <View style={styles.loadingContent}>
          <Ionicons 
            name="image-outline" 
            size={Math.min(width, height) * 0.3} 
            color={colors.textLight} 
          />
          <Text style={[styles.loadingText, { fontSize: fontSizes.xs, color: colors.textLight }]}>
            Loading...
          </Text>
        </View>
      </View>
    );
  }

  // Render error state
  if (imageState === 'error' && ErrorComponent) {
    return (
      <View style={containerStyles}>
        <ErrorComponent onRetry={retryImageLoad} />
      </View>
    );
  }

  // Render error state (default)
  if (imageState === 'error') {
    return (
      <View style={[containerStyles, styles.errorContainer]}>
        <View style={styles.errorContent}>
          <Ionicons 
            name="image-outline" 
            size={Math.min(width, height) * 0.3} 
            color={colors.textLight} 
          />
          <Text style={[styles.errorText, { fontSize: fontSizes.xs, color: colors.textLight }]}>
            {placeholder}
          </Text>
          {retryCount < 2 && (
            <Text 
              style={[styles.retryText, { fontSize: fontSizes.xs, color: colors.primary }]}
              onPress={retryImageLoad}
            >
              Tap to retry
            </Text>
          )}
        </View>
      </View>
    );
  }

  // Render placeholder when no source
  if (!optimizedSource) {
    if (PlaceholderComponent) {
      return (
        <View style={containerStyles}>
          <PlaceholderComponent />
        </View>
      );
    }

    return (
      <View style={[containerStyles, styles.placeholderContainer]}>
        <View style={styles.placeholderContent}>
          <Ionicons 
            name="image-outline" 
            size={Math.min(width, height) * 0.3} 
            color={colors.textLight} 
          />
          <Text style={[styles.placeholderText, { fontSize: fontSizes.xs, color: colors.textLight }]}>
            {placeholder}
          </Text>
        </View>
      </View>
    );
  }

  // Render optimized image
  return (
    <View style={containerStyles}>
      <Image
        source={{ uri: optimizedSource }}
        style={[
          styles.image,
          {
            width,
            height,
            borderRadius: customBorderRadius,
          }
        ]}
        resizeMode={resizeMode}
        onLoad={handleImageLoad}
        onError={handleImageError}
        // Performance optimizations
        fadeDuration={200}
        progressiveRenderingEnabled={true}
        // Cache the image - removed cache prop as it's not supported in React Native Image
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  image: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  loadingContent: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  loadingText: {
    fontWeight: fontWeights.medium,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  errorContent: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  errorText: {
    fontWeight: fontWeights.medium,
    textAlign: 'center',
  },
  retryText: {
    fontWeight: fontWeights.semibold,
    textDecorationLine: 'underline',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  placeholderContent: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  placeholderText: {
    fontWeight: fontWeights.medium,
    textAlign: 'center',
  },
});

export default OptimizedProductImage;
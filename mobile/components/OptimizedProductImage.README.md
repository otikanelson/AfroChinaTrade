# OptimizedProductImage Component

A high-performance React Native image component designed specifically for product images with Cloudinary integration and device pixel ratio optimization.

## Features

- **Device Pixel Ratio Optimization**: Automatically adjusts image dimensions based on device pixel ratio for optimal performance
- **Cloudinary Integration**: Seamlessly integrates with Cloudinary for dynamic resizing, format optimization, and progressive loading
- **Loading States**: Built-in loading indicators with customizable components
- **Error Handling**: Robust error handling with retry functionality and custom error components
- **Fallback Support**: Gracefully handles non-Cloudinary URLs without transformation
- **Memory Efficient**: Optimized for performance with proper caching and progressive rendering
- **Customizable**: Extensive customization options for different use cases

## Installation

The component is already included in the project. Import it from the components directory:

```tsx
import { OptimizedProductImage } from '../components/OptimizedProductImage';
```

## Basic Usage

```tsx
import React from 'react';
import { OptimizedProductImage } from './OptimizedProductImage';

const ProductCard = ({ product }) => {
  return (
    <OptimizedProductImage
      source={product.images[0]}
      width={200}
      height={200}
      quality={85}
      format="auto"
      placeholder="Product Image"
    />
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `source` | `string` | **Required** | Image URL (Cloudinary or regular URL) |
| `width` | `number` | **Required** | Width of the image container |
| `height` | `number` | **Required** | Height of the image container |
| `borderRadius` | `number` | `borderRadius.md` | Border radius for the image |
| `resizeMode` | `'cover' \| 'contain' \| 'stretch' \| 'center'` | `'cover'` | How the image should be resized |
| `quality` | `number` | `80` | Quality for Cloudinary optimization (1-100) |
| `format` | `'auto' \| 'webp' \| 'jpg' \| 'png'` | `'auto'` | Format for Cloudinary optimization |
| `placeholder` | `string` | `'No Image'` | Placeholder text when no image |
| `PlaceholderComponent` | `React.ComponentType` | `undefined` | Custom placeholder component |
| `LoadingComponent` | `React.ComponentType` | `undefined` | Custom loading component |
| `ErrorComponent` | `React.ComponentType<{ onRetry: () => void }>` | `undefined` | Custom error component |
| `onLoad` | `() => void` | `undefined` | Callback when image loads successfully |
| `onError` | `(error: any) => void` | `undefined` | Callback when image fails to load |
| `style` | `any` | `undefined` | Additional styles for the container |

## Cloudinary Integration

The component automatically detects Cloudinary URLs and applies optimizations:

### URL Transformation

For Cloudinary URLs, the component automatically adds:
- Dynamic width and height based on container size and device pixel ratio
- Quality optimization based on device capabilities
- Format optimization (WebP for supported devices)
- Progressive loading for better perceived performance
- Immutable caching for better CDN performance

### Example Transformation

Input URL:
```
https://res.cloudinary.com/demo/image/upload/sample.jpg
```

Optimized URL (for 200x200 container on 2x pixel ratio device):
```
https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,q_80,f_auto,dpr_auto,fl_progressive,fl_immutable_cache/sample.jpg
```

## Device Pixel Ratio Optimization

The component automatically calculates optimal image dimensions based on:
- Container dimensions (width × height)
- Device pixel ratio (`PixelRatio.get()`)
- Device capabilities (high/medium/low DPI)

### Quality Optimization by Device

- **High DPI devices (3x+)**: `q_auto:good` - Prioritizes quality
- **Medium DPI devices (2x)**: `q_auto:eco` - Balances quality and size
- **Low DPI devices (1x)**: `q_auto:low` - Prioritizes smaller file size

## Usage Examples

### Product Card (Small Thumbnail)

```tsx
<OptimizedProductImage
  source={product.images[0]}
  width={80}
  height={80}
  quality={75}
  format="webp"
  borderRadius={8}
/>
```

### Product Detail (Large Image)

```tsx
<OptimizedProductImage
  source={product.images[0]}
  width={300}
  height={300}
  quality={95}
  format="auto"
  resizeMode="contain"
  borderRadius={12}
/>
```

### With Custom Loading and Error States

```tsx
<OptimizedProductImage
  source={product.images[0]}
  width={200}
  height={200}
  LoadingComponent={() => (
    <View style={styles.customLoading}>
      <ActivityIndicator size="large" />
      <Text>Loading product image...</Text>
    </View>
  )}
  ErrorComponent={({ onRetry }) => (
    <View style={styles.customError}>
      <Text>Failed to load image</Text>
      <TouchableOpacity onPress={onRetry}>
        <Text>Retry</Text>
      </TouchableOpacity>
    </View>
  )}
  onLoad={() => console.log('Image loaded successfully')}
  onError={(error) => console.log('Image failed to load:', error)}
/>
```

### List View (Rectangular)

```tsx
<OptimizedProductImage
  source={product.images[0]}
  width={100}
  height={80}
  quality={80}
  format="auto"
  borderRadius={10}
  resizeMode="cover"
/>
```

## Performance Considerations

### Memory Optimization
- Uses progressive rendering for better perceived performance
- Implements proper image caching with `cache="force-cache"`
- Automatically selects optimal image dimensions to reduce memory usage

### Network Optimization
- Cloudinary integration provides automatic format selection (WebP when supported)
- Progressive JPEG loading for faster initial display
- Immutable caching for better CDN performance

### Error Handling
- Automatic retry mechanism (up to 2 retries)
- Graceful fallback to placeholder when image fails
- Silent error handling to prevent app crashes

## Integration with ProductCard

The component is already integrated into the `ProductCard` component:

```tsx
// In ProductCard.tsx
<OptimizedProductImage
  source={product.images && product.images.length > 0 ? product.images[0] : ''}
  width={200}
  height={200}
  resizeMode="cover"
  placeholder="No Image"
  quality={85}
  format="auto"
  style={styles.image}
/>
```

## Best Practices

1. **Use appropriate quality settings**:
   - Thumbnails: 70-80 quality
   - Product cards: 80-85 quality
   - Detail images: 90-95 quality

2. **Choose optimal dimensions**:
   - Match container size to avoid unnecessary scaling
   - Consider device pixel ratio for crisp images

3. **Handle loading states**:
   - Always provide meaningful placeholders
   - Consider custom loading components for better UX

4. **Error handling**:
   - Implement retry mechanisms for network issues
   - Provide fallback images when possible

5. **Performance**:
   - Use WebP format when possible
   - Enable progressive loading for large images
   - Implement proper caching strategies

## Troubleshooting

### Common Issues

1. **Images not loading**: Check if the URL is accessible and properly formatted
2. **Poor quality on high-DPI devices**: Ensure quality settings are appropriate
3. **Slow loading**: Consider reducing image dimensions or quality
4. **Cloudinary transformations not working**: Verify URL format and Cloudinary configuration

### Debug Mode

Enable debug logging by adding console logs in the component:

```tsx
// Add to generateOptimizedUrl function
console.log('Original URL:', originalUrl);
console.log('Optimized URL:', optimizedUrl);
console.log('Device pixel ratio:', pixelRatio);
```

## Requirements Fulfilled

This component fulfills the following requirements from task 7.4:

✅ **Image optimization based on device pixel ratio**: Automatically calculates optimal dimensions using `PixelRatio.get()`

✅ **Loading states and error handling**: Comprehensive loading, error, and placeholder states with customizable components

✅ **Cloudinary integration for dynamic resizing**: Full Cloudinary URL transformation with quality, format, and dimension optimization

✅ **Suitable for ProductCard and other components**: Already integrated into ProductCard with flexible API for other use cases

✅ **Performance improvements**: Memory efficient loading, progressive rendering, and optimal image sizing

The component provides a complete solution for optimized product image display with modern performance best practices and robust error handling.
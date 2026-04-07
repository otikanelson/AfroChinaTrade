# FloatingCartButton Component

A floating action button that displays the current cart count and provides quick access to the cart page.

## Features

- **Dynamic Visibility**: Only shows when cart has items
- **Real-time Updates**: Automatically updates when cart count changes
- **Bounce Animation**: Animates when new items are added to cart
- **Customizable Position**: Configurable bottom and right positioning
- **Cart Count Badge**: Shows current number of items in cart
- **Quick Navigation**: Taps navigate directly to cart page

## Usage

```tsx
import { FloatingCartButton } from '../components/FloatingCartButton';

// Default positioning (bottom: 20, right: 20)
<FloatingCartButton />

// Custom positioning
<FloatingCartButton bottom={30} right={15} />
```

## Props

- `bottom`: Distance from bottom of screen in pixels (default: 20)
- `right`: Distance from right edge of screen in pixels (default: 20)

## Integration

The component automatically integrates with:
- **CartContext**: Gets real-time cart count and updates
- **Theme System**: Uses app colors and spacing
- **Navigation**: Routes to cart page on tap

## Behavior

- Hidden when cart is empty (cartCount === 0)
- Shows cart icon with count badge
- Bounces when items are added to cart
- Maintains high z-index for visibility over other content
- Includes shadow/elevation for visual prominence

## Implementation Notes

- Uses React Native's Animated API for smooth animations
- Tracks previous cart count to detect additions
- Positioned absolutely to float over page content
- Optimized for both iOS and Android with appropriate shadows
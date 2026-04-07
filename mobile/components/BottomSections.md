# BottomSections Component

A reusable component that displays ads, recommendations, and recently viewed products at the bottom of pages.

## Features

- **Ads Carousel**: Displays promotional carousel ads for the specific context
- **Promo Tiles**: Shows promotional tile ads
- **Recommended Products**: Personalized product recommendations (authenticated users only)
- **Recently Viewed**: Shows user's browsing history (authenticated users only)
- **Context-Aware**: Different ads based on page context (checkout vs account)
- **Smart Divider**: Only shows divider when content is available
- **Responsive Layout**: Horizontal scrolling product lists with proper spacing

## Usage

```tsx
import { BottomSections } from '../components/BottomSections';

// In checkout page
<BottomSections context="checkout" />

// In account page
<BottomSections context="account" />
```

## Props

- `context`: 'checkout' | 'account' - Determines which ads to load and display

## Sections Displayed

### 1. Ads Carousel
- Loads carousel ads for the specified context
- Auto-scrolling promotional banners
- Only shows if ads are available

### 2. Promo Tiles
- Displays tile-style promotional content
- Grid layout for multiple promotions
- Context-specific content

### 3. Recommended Products (Authenticated Users Only)
- Personalized product recommendations
- Horizontal scrolling list
- "See All" action to view more recommendations
- Limited to 6 products for performance

### 4. Recently Viewed (Authenticated Users Only)
- User's browsing history
- Shows last 6 viewed products
- "See All" action to view full browsing history
- Filters out deleted/unavailable products

## Behavior

- **Guest Users**: Only shows ads and tiles, with sign-in prompt
- **Authenticated Users**: Shows all sections including personalized content
- **Empty State**: Component doesn't render if no content is available
- **Error Handling**: Gracefully handles API failures without breaking the page
- **Performance**: Limits product lists to prevent excessive rendering

## Integration

The component automatically integrates with:
- **AdService**: Fetches context-specific ads
- **AuthContext**: Determines user authentication status
- **RecommendationsHook**: Gets personalized recommendations
- **BrowsingHistory API**: Fetches recently viewed products
- **Navigation**: Handles product and section navigation

## Styling

- Uses theme colors and spacing for consistency
- Responsive design with proper margins and padding
- Horizontal scrolling with appropriate item spacing
- Visual divider to separate from main content
# Splash Ads Feature

## Overview
The splash ads feature allows admins to create modal overlay advertisements that appear when users open the app, similar to Temu's splash screen ads. These ads appear with a dimmed background and can be configured with different frequency settings.

## Features

### 🎯 Smart Frequency Control
- **Once Ever**: Shows only once per user, never again
- **Daily**: Shows once per day maximum
- **Per Session**: Shows once per app session (resets when app comes to foreground)
- **Always**: Shows every time the app opens (not recommended)

### 🎨 Customizable Display
- **Duration**: Configurable display time (1-10 seconds)
- **Portrait Images**: Optimized for mobile splash screens (720×1280px recommended)
- **Auto-close**: Automatically closes after the specified duration
- **Manual Close**: Users can close manually with the X button
- **Action Button**: Optional "Explore Now" button for navigation

### 📱 User Experience
- Smooth fade-in/scale animation
- Dimmed background overlay
- Non-intrusive close button
- Responsive design for different screen sizes
- Automatic navigation to specified app routes

## Admin Management

### Creating Splash Ads
1. Go to Admin Panel → Ads Management
2. Click "Create New Ad"
3. Select "App Launch (Splash)" placement
4. Upload a portrait image (720×1280px recommended)
5. Configure frequency and duration settings
6. Set optional navigation link
7. Save and activate

### Splash Ad Settings
- **Show Frequency**: How often the ad appears
- **Display Duration**: How long it stays visible (3-10 seconds recommended)
- **Link Path**: Optional in-app route for navigation (e.g., `/product-listing`)

## Technical Implementation

### Backend Changes
- Extended `Ad` model with `splashFrequency` and `splashDuration` fields
- Added support for `app: 'splash'` placement type
- New endpoint: `POST /api/ads/:id/view` for analytics tracking

### Frontend Components
- `SplashAdModal`: Main modal component with animations
- Updated `AdService` with splash ad logic and session management
- Integrated into main app layout (`_layout.tsx`)

### Frequency Logic
```typescript
// Daily: Check if 24+ hours have passed
const daysSinceLastShown = Math.floor((now - lastShown) / (1000 * 60 * 60 * 24));
return daysSinceLastShown >= 1;

// Session: Reset flag when app comes to foreground
AppState.addEventListener('change', (nextAppState) => {
  if (nextAppState === 'active') {
    adService.resetSessionFlag();
  }
});
```

## Usage Examples

### Creating a Welcome Splash Ad
```json
{
  "title": "Welcome to Our App!",
  "description": "Discover amazing products and deals",
  "imageUrl": "https://example.com/splash-image.jpg",
  "linkPath": "/product-listing",
  "placement": { "app": "splash" },
  "splashFrequency": "daily",
  "splashDuration": 4000,
  "isActive": true
}
```

### Testing Splash Ads
Run the test script to create and verify splash ad functionality:
```bash
cd backend
npm run ts-node src/scripts/testSplashAds.ts
```

## Best Practices

### Image Guidelines
- **Aspect Ratio**: 9:16 (portrait) for splash ads
- **Resolution**: 720×1280px minimum
- **File Size**: Keep under 500KB for fast loading
- **Content**: Clear, engaging visuals with minimal text

### Frequency Recommendations
- **New Users**: Use "once" or "daily" for onboarding
- **Promotions**: Use "daily" for limited-time offers
- **Regular Content**: Use "session" to avoid annoyance
- **Avoid "always"**: Can negatively impact user experience

### Duration Guidelines
- **3-4 seconds**: Good for simple messages
- **5-6 seconds**: Suitable for detailed promotions
- **7+ seconds**: Only for very important announcements
- **Auto-close**: Always provide manual close option

## Analytics & Tracking
- View tracking via `POST /api/ads/:id/view`
- Frequency compliance stored in AsyncStorage
- Session management for per-session ads
- Admin can monitor ad performance through placement statistics

## Future Enhancements
- A/B testing for different splash ad variants
- Advanced targeting based on user segments
- Rich media support (video splash ads)
- Detailed analytics dashboard
- Geolocation-based splash ads
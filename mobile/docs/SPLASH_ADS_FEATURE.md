# Splash Ads & Account Page Ads Feature

## Overview

This document describes the implementation of two new advertising features:
1. **Splash Ads** - Full-screen ads that appear when opening the app (like Temu)
2. **Account Page Ads** - Promotional tiles on the customer account page

## Features Implemented

### 1. Splash Ads

Splash ads are full-screen promotional ads that appear when users open the app, similar to Temu's approach.

#### Key Features:
- **Smart Frequency Control** - Ads don't show every time, controlled by frequency settings
- **Countdown Timer** - Shows a countdown before users can close the ad
- **Auto-dismiss** - Automatically closes after the specified duration
- **Deep Linking** - Tapping the ad navigates to the specified link
- **Analytics Tracking** - Tracks when ads are shown and viewed

#### Frequency Options:
- `once` - Show only once ever (first app open)
- `daily` - Show once per day
- `session` - Show once per app session
- `always` - Show every time the app opens

#### Technical Implementation:

**Service Layer** (`mobile/services/AdService.ts`):
```typescript
async getSplashAd(): Promise<ApiResponse<Ad | null>>
```
- Checks if splash ad should be shown based on frequency rules
- Stores last shown timestamp in AsyncStorage
- Returns null if ad shouldn't be shown

**Component** (`mobile/components/SplashAdModal.tsx`):
- Full-screen modal with fade-in animation
- Countdown badge showing seconds remaining
- Close button (appears after countdown)
- Pressable image that navigates to link

**Integration** (`mobile/app/_layout.tsx`):
- Loads splash ad after fonts are loaded
- Shows modal if ad is available and should be displayed
- Marks ad as seen for analytics

#### Ad Type Definition:
```typescript
interface Ad {
  // ... existing fields
  placement: {
    app?: 'splash';  // New placement type
  };
  splashFrequency?: 'once' | 'daily' | 'session' | 'always';
  splashDuration?: number; // Duration in milliseconds (default 3000)
}
```

### 2. Account Page Ads

Promotional tile ads now appear on the customer account page, similar to the Home and Buy Now pages.

#### Implementation:
- Added `PromoTiles` component to account page
- Tiles appear between the "Features" section title and the feature grid
- Uses existing `PromoTiles` component with `page="account"` prop
- Supports same tile ad format as other pages

#### Location:
`mobile/app/(tabs)/account.tsx` - Added after "Features" section title

### Backend Requirements

To fully support these features, the backend needs to:

1. **Update Ad Model** (`backend/src/models/Ad.ts`):
```typescript
{
  placement: {
    home?: 'carousel' | 'tile',
    'buy-now'?: 'carousel' | 'tile',
    'product-detail'?: 'carousel' | 'tile',
    account?: 'tile',  // NEW
    app?: 'splash',    // NEW
  },
  splashFrequency?: 'once' | 'daily' | 'session' | 'always',  // NEW
  splashDuration?: number,  // NEW (milliseconds)
}
```

2. **Update Ad Controller** to handle new placement types and splash-specific fields

3. **Add Analytics Endpoint**:
```typescript
POST /ads/:id/view
```
- Track when splash ads are viewed
- Store view count and timestamps

### Admin Interface Updates Needed

The admin ads form (`mobile/app/(admin)/ads/[id].tsx`) needs updates to support:

1. **New Placement Options**:
   - Add "Account Page" option (tile only)
   - Add "App Launch" option (splash only)

2. **Splash Ad Settings** (when "App Launch" is selected):
   - Frequency dropdown: Once / Daily / Session / Always
   - Duration input: Milliseconds (default 3000)
   - Preview button to test the splash ad

3. **Validation**:
   - Splash ads require an image
   - Splash ads should have appropriate dimensions (e.g., 1080x1920 for portrait)
   - Account page ads use tile format only

### Usage Examples

#### Creating a Splash Ad (Admin):
1. Go to Ads Management
2. Click "Create New Ad"
3. Upload a full-screen image (portrait orientation recommended)
4. Set title and description
5. Select "App Launch" placement
6. Choose frequency (e.g., "Daily")
7. Set duration (e.g., 3000ms = 3 seconds)
8. Add optional link path
9. Activate the ad

#### Creating Account Page Ad (Admin):
1. Go to Ads Management
2. Click "Create New Ad"
3. Upload a tile image
4. Set title and description
5. Select "Account Page" placement
6. Set as "Tile" type
7. Add optional link path
8. Activate the ad

### User Experience

#### Splash Ad Flow:
1. User opens the app
2. App checks if splash ad should be shown (based on frequency)
3. If yes, splash ad appears with fade-in animation
4. Countdown shows (e.g., "3s", "2s", "1s")
5. After countdown, close button appears
6. Ad auto-closes after duration OR user taps close
7. If user taps the ad image, navigates to link and closes

#### Account Page Ads:
- Appear as tiles in the account page
- Same behavior as Home/Buy Now page tiles
- Tapping navigates to the specified link

### Storage & Privacy

- Last shown timestamp stored in AsyncStorage (`@splash_ad_last_shown`)
- No personal data collected
- Users can't disable splash ads (controlled by admin frequency settings)
- Frequency settings respect user experience

### Best Practices

#### For Admins:
1. **Don't overuse splash ads** - Use "Daily" or "Session" frequency, not "Always"
2. **Keep duration short** - 3-5 seconds is ideal
3. **Use high-quality images** - Full-screen ads should be visually appealing
4. **Test before activating** - Preview the ad to ensure it looks good
5. **Rotate ads regularly** - Keep content fresh
6. **Track performance** - Monitor view counts and click-through rates

#### Image Specifications:
- **Splash Ads**: 1080x1920px (portrait) or 1920x1080px (landscape)
- **Account Tiles**: 800x400px (same as other tiles)
- Format: JPG or PNG
- Max file size: 2MB recommended

### Analytics Tracking

The system tracks:
- When splash ads are shown
- When splash ads are viewed (seen)
- When splash ads are tapped
- Frequency of displays per user

### Future Enhancements

Potential improvements:
1. **A/B Testing** - Test different splash ads with different user segments
2. **Targeting** - Show different ads based on user behavior or demographics
3. **Skip Option** - Allow users to skip after X seconds
4. **Video Splash Ads** - Support video content
5. **Interactive Elements** - Add buttons or forms to splash ads
6. **User Preferences** - Let users opt-out of splash ads
7. **Geolocation** - Show different ads based on user location
8. **Time-based** - Show different ads at different times of day

### Testing Checklist

- [ ] Splash ad appears on first app open
- [ ] Splash ad respects frequency settings (daily, session, etc.)
- [ ] Countdown timer works correctly
- [ ] Close button appears after countdown
- [ ] Ad auto-closes after duration
- [ ] Tapping ad navigates to correct link
- [ ] Account page tiles display correctly
- [ ] Account page tiles navigate correctly
- [ ] Analytics tracking works
- [ ] Ads don't show when none are active
- [ ] Multiple splash ads rotate correctly (if applicable)

### Troubleshooting

**Splash ad not showing:**
- Check if ad is active in admin panel
- Verify placement is set to "app" with type "splash"
- Check AsyncStorage for last shown timestamp
- Verify frequency settings

**Splash ad showing too often:**
- Check frequency setting (should not be "always")
- Clear AsyncStorage key `@splash_ad_last_shown` for testing

**Account page ads not showing:**
- Check if ads are active
- Verify placement is set to "account" with type "tile"
- Check PromoTiles component is rendering

---

**Last Updated**: 2026-04-03
**Version**: 1.0.0

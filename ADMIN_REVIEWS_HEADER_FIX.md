# Admin Product Reviews Header Fix

## Issue
The admin product reviews page had the same header issue as the profile page - using `SafeAreaView` wrapper which caused layout problems in APK builds.

## Root Cause
The page was using `SafeAreaView` as a conditional wrapper when not embedded, which doesn't handle safe areas consistently across different build types (development vs APK).

## Solution
Replaced `SafeAreaView` with standard `View` wrapper and relied on the `Header` component for proper safe area handling.

## Changes Made

### File: `mobile/app/(admin)/moderation/reviews.tsx`

**Before:**
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

// ...

const Wrapper = embedded ? View : SafeAreaView;

return (
  <Wrapper style={{ flex: 1, backgroundColor: colors.surface }}>
    {!embedded && <Header title="Product Reviews" subtitle="Manage and respond to reviews" showBack />}
    // ... rest of content
  </Wrapper>
);
```

**After:**
```typescript
// Removed SafeAreaView import

// ...

const Wrapper = embedded ? View : View;

return (
  <Wrapper style={{ flex: 1, backgroundColor: colors.surface }}>
    {!embedded && <Header title="Product Reviews" subtitle="Manage and respond to reviews" showBack />}
    // ... rest of content
  </Wrapper>
);
```

## Benefits

1. **Consistent Header Behavior**: Uses the same Header component as other pages
2. **Proper Safe Area Handling**: Header component handles safe areas correctly across all build types
3. **APK Build Compatibility**: Eliminates layout issues specific to APK builds
4. **Code Consistency**: Aligns with the pattern used throughout the app

## Technical Details

- **Removed**: `SafeAreaView` import and usage
- **Simplified**: Wrapper logic to always use `View`
- **Maintained**: All existing functionality and embedded mode support
- **Preserved**: Header visibility logic for embedded vs standalone usage

## Testing Recommendations

1. Test the admin product reviews page in APK build
2. Verify header layout and navigation
3. Test both embedded and standalone modes
4. Confirm safe area handling on different devices
5. Verify all review management functionality still works

## Related Issues

This fix follows the same pattern as the profile page header fix, ensuring consistency across admin pages. Other pages using `SafeAreaView` with custom headers may need similar fixes if they exhibit the same APK build issues.

## Future Considerations

- Monitor other pages with `SafeAreaView` + custom headers for similar issues
- Consider standardizing all pages to use the `Header` component for consistency
- Implement automated testing for APK builds to catch these issues earlier
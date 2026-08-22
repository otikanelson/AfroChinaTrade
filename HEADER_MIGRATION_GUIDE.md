# Header Component Migration Guide

## Summary
All pages in the mobile app should use the centralized `Header` component for consistent status bar handling across iOS and Android devices.

## What was fixed
- Created `useStatusBarPadding()` hook that provides consistent status bar padding
  - Android: `insets.top + 10px`
  - iOS: `insets.top + 8px`
- Updated `Header` component to use this hook
- Updated `Sidebar` component to use this hook

## Pages that need migration

The following pages currently use `SafeAreaView` with custom headers and should be migrated to use the `Header` component:

### Already Updated ✅
1. `mobile/app/my-orders.tsx` - ✅ Updated

### Need Migration 🔧

#### Authentication Pages
2. `mobile/app/auth/login.tsx`
3. `mobile/app/auth/register.tsx`

#### Address Management
4. `mobile/app/addresses.tsx`
5. `mobile/app/addresses/[id].tsx`
6. `mobile/app/addresses/new-address.tsx`

#### Payment Methods
7. `mobile/app/payment-methods/new.tsx`
8. `mobile/app/payment-methods/[id].tsx`

#### Order Management
9. `mobile/app/order-detail/[id].tsx`

#### Settings/Profile
10. `mobile/app/change-password.tsx`
11. `mobile/app/privacy-policy.tsx`

## Migration Steps

For each page:

### Step 1: Update imports
```typescript
// Remove:
import { SafeAreaView } from 'react-native-safe-area-context';

// Add:
import { Header } from '../components/Header';
```

### Step 2: Remove custom header styles
Remove these style definitions:
- `header: { flexDirection: 'row', ... }`
- `backButton: { ... }`
- `headerTitle: { ... }`
- Any other header-related styles

### Step 3: Replace SafeAreaView with View
```typescript
// Before:
<SafeAreaView style={styles.container}>
  <View style={styles.header}>
    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
      <Ionicons name="arrow-back" size={24} color={colors.text} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Page Title</Text>
    <View style={styles.placeholder} />
  </View>
  {/* content */}
</SafeAreaView>

// After:
<View style={styles.container}>
  <Header title="Page Title" showBack={true} />
  {/* content */}
</View>
```

### Step 4: Header Component Props
Available props for the Header component:
- `title?: string` - Page title
- `subtitle?: string` - Optional subtitle
- `showLogo?: boolean` - Show app logo instead of title
- `showBack?: boolean` - Show back button
- `showCart?: boolean` - Show cart icon
- `showMenu?: boolean` - Show menu icon (default: true)
- `onBackPress?: () => void` - Custom back handler
- Other actions: `showRefresh`, `showFilter`, etc.

## Benefits
✅ Consistent status bar handling across iOS and Android
✅ No more fluctuating header positions
✅ Automatic handling of iPhone notches and Android status bars
✅ Centralized header logic - easier to maintain
✅ Reduced code duplication

## Testing Checklist
For each migrated page, test:
- [ ] Header renders correctly on iPhone (with notch)
- [ ] Header renders correctly on Android
- [ ] Status bar doesn't overlap content
- [ ] Back button works correctly
- [ ] No visual glitches or fluctuations

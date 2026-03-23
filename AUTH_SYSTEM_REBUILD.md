# Authentication System Rebuild

## Overview
The authentication system has been completely rebuilt to fix token expiry issues and implement guest browsing functionality.

## Key Changes

### 1. Fixed Token Expiry Issues

#### Problem
- Tokens were expiring earlier than the configured 30 minutes
- Token expiry warnings were unreliable and only showed occasionally
- Used setTimeout which could be unreliable for long durations

#### Solution
- **Interval-based monitoring**: Changed from setTimeout to setInterval (checks every 30 seconds)
- **Proper token validation**: Added `isAuthenticated()` check that validates token hasn't expired
- **Reliable warning system**: Shows warning at 5 minutes before expiry with proper state management
- **Automatic token refresh**: Attempts to refresh token when warning is triggered

#### Implementation Details
```typescript
// Token Manager (mobile/services/api/tokenManager.ts)
- Uses setInterval to check token expiry every 30 seconds
- Validates token expiry time from JWT payload
- Shows warning at 5 minutes (300 seconds) before expiry
- Triggers expiry callback when token expires
- Properly cleans up intervals on token clear
```

### 2. Guest Browsing Mode

#### Features
- Users can browse the app without signing in
- Access to:
  - Home screen with products
  - Product listings and categories
  - Product details
  - Search functionality
  - Supplier information
  
#### Protected Features (Require Sign In)
- Checkout
- Orders
- Wishlist
- Addresses
- Payment methods
- Messages
- Profile management
- Cart operations (can view but need to sign in to checkout)

#### Implementation
```typescript
// AuthContext (mobile/contexts/AuthContext.tsx)
- Added isGuestMode state
- Stores guest mode preference in AsyncStorage
- Automatically enables guest mode on:
  - No tokens found
  - Backend connection failure
  - Authentication errors
  
// useRequireAuth Hook (mobile/hooks/useRequireAuth.ts)
- Checks if user is authenticated
- Shows informative message
- Redirects to login if not authenticated
- Used in protected screens
```

### 3. Improved User Experience

#### Session Expiry Warnings
- Clear warning message 5 minutes before expiry
- Uses AlertContext for consistent UI
- Automatic redirect to login after expiry
- Prevents duplicate warnings with proper state management

#### Seamless Guest-to-Authenticated Flow
1. User browses as guest
2. Attempts to use protected feature (e.g., checkout)
3. Sees friendly message: "Please sign in to complete your purchase"
4. Redirected to login
5. After login, can continue with their action

## Backend Configuration

### Token Expiry Settings
```typescript
// backend/src/controllers/authController.ts
const generateToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, secret, { expiresIn: '30m' }); // 30 minutes
};

const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId, type: 'refresh' }, secret, { expiresIn: '7d' }); // 7 days
};
```

### Optional Authentication Middleware
```typescript
// backend/src/middleware/auth.ts
export const optionalAuth = async (req, res, next) => {
  // Allows requests without token
  // Sets user info if valid token provided
  // Continues without error if no token or invalid token
};
```

## Usage Examples

### Protecting a Screen
```typescript
import { useRequireAuth } from '../hooks/useRequireAuth';

export default function CheckoutScreen() {
  // Require authentication with custom message
  const { isAuthenticated, isLoading } = useRequireAuth(
    'Please sign in to complete your purchase'
  );
  
  // Screen content only renders if authenticated
  // Otherwise redirects to login
}
```

### Checking Auth Status
```typescript
import { useAuth } from '../contexts/AuthContext';

const { isAuthenticated, isGuestMode, user } = useAuth();

if (isGuestMode) {
  // Show guest-specific UI
}

if (isAuthenticated) {
  // Show authenticated user features
}
```

### Enabling Guest Mode Manually
```typescript
const { enableGuestMode } = useAuth();

// Skip login and continue as guest
await enableGuestMode();
```

## Testing Checklist

### Token Expiry
- [ ] Token expires exactly at 30 minutes
- [ ] Warning shows at 25 minutes (5 minutes before expiry)
- [ ] Warning shows consistently every time
- [ ] User is redirected to login after expiry
- [ ] Token refresh works when warning triggers

### Guest Mode
- [ ] App starts in guest mode if no tokens
- [ ] Can browse products as guest
- [ ] Can view product details as guest
- [ ] Can search as guest
- [ ] Checkout requires sign in
- [ ] Orders require sign in
- [ ] Wishlist requires sign in
- [ ] Profile requires sign in
- [ ] After login, guest data is cleared

### User Experience
- [ ] Clear messages when sign in is required
- [ ] Smooth transition from guest to authenticated
- [ ] No unexpected logouts
- [ ] Session persists across app restarts
- [ ] Proper error messages for auth failures

## Migration Notes

### For Existing Users
- Existing tokens will continue to work
- Token expiry monitoring starts automatically
- No action required from users

### For Developers
- Update any screens that should require auth to use `useRequireAuth`
- Test protected features to ensure they redirect properly
- Update API calls that should work for guests to use `optionalAuth` middleware

## Troubleshooting

### Token Expires Too Early
- Check backend JWT_SECRET is set correctly
- Verify token generation uses '30m' expiry
- Check device time is synchronized

### Warning Not Showing
- Verify AlertContext is properly initialized
- Check tokenManager.onExpiryWarning is called
- Ensure monitoring interval is running

### Guest Mode Not Working
- Check AsyncStorage for GUEST_MODE_KEY
- Verify AuthContext initialization
- Check backend connection status

## Future Enhancements

1. **Remember Me**: Option to extend session duration
2. **Biometric Auth**: Quick re-authentication with fingerprint/face
3. **Session Management**: View and manage active sessions
4. **Auto-save**: Save cart/wishlist for guests and restore after login
5. **Social Login**: Sign in with Google/Facebook for easier onboarding

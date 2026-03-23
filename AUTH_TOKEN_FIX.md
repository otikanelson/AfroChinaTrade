# Auth Token Expiry Fix - Implementation Summary

## Problem
- Access tokens were expiring at 15 minutes instead of the intended 30 minutes
- No automatic token refresh mechanism existed on the mobile app
- Users received no warning before token expiration
- When tokens expired, the app would crash or force re-login without explanation

## Solution Implemented

### 1. Backend Changes

**File: `backend/src/controllers/authController.ts`**
- Updated token expiry from 15 minutes to 30 minutes
- Access tokens now expire after 30 minutes as designed
- Refresh tokens remain at 7 days

### 2. Mobile Token Manager Enhancement

**File: `mobile/services/api/tokenManager.ts`**
- Added JWT token decoding to extract expiry time
- Implemented automatic token expiry monitoring
- Added callbacks for:
  - `onExpiryWarning()`: Triggered 5 minutes before expiry
  - `onTokenExpired()`: Triggered when token expires
- Added `getTimeUntilExpiry()` method to check remaining time
- Automatic monitoring starts when tokens are set

### 3. API Client Automatic Refresh

**File: `mobile/services/api/apiClient.ts`**
- Implemented automatic token refresh interceptor
- When token expires (401 + TOKEN_EXPIRED error):
  - Automatically attempts to refresh using refresh token
  - Retries the original request with new token
  - No user interruption needed
- Prevents multiple simultaneous refresh attempts
- Queues requests during refresh and retries them

### 4. User Feedback Hook

**File: `mobile/hooks/useAuthTokenMonitor.ts`**
- New hook for handling user notifications
- Shows alert 5 minutes before expiry: "Session Expiring Soon"
- Shows alert when token expires: "Session Expired - Please log in again"
- Automatically redirects to login if session expires

### 5. App Integration

**File: `mobile/app/_layout.tsx`**
- Integrated `useAuthTokenMonitor` hook into root layout
- Ensures token monitoring is active throughout the app lifecycle
- Provides consistent user feedback across all screens

### 6. Dependencies

**File: `mobile/package.json`**
- Added `jwt-decode` library for token parsing

## User Experience Flow

### Normal Operation (Token Valid)
1. User logs in → tokens stored
2. Token manager monitors expiry
3. 5 minutes before expiry → warning alert shown
4. User can continue working
5. Token automatically refreshes in background
6. No interruption to user workflow

### Token Expiry Scenario
1. If refresh fails or user ignores warning
2. Next API call triggers 401 error
3. App automatically attempts refresh
4. If successful → request retried transparently
5. If failed → user redirected to login with clear message

## Testing Checklist

- [ ] Login and verify tokens are stored
- [ ] Wait 25 minutes and verify warning appears
- [ ] Verify token refreshes automatically
- [ ] Verify API calls continue working after refresh
- [ ] Test with expired refresh token (should redirect to login)
- [ ] Test network error during refresh (should handle gracefully)
- [ ] Verify logout clears all tokens and monitoring

## Configuration

Token expiry times can be adjusted in:
- **Access token**: `backend/src/controllers/authController.ts` - `generateToken()` function
- **Refresh token**: `backend/src/controllers/authController.ts` - `generateRefreshToken()` function
- **Warning time**: `mobile/services/api/tokenManager.ts` - `warningTime` variable (currently 5 minutes)

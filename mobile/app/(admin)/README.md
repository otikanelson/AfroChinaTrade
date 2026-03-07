# Admin Dashboard Route Group

This directory contains the protected admin section of the mobile app, accessible only to seller accounts.

## Authentication & Access Control

The admin section is protected by the `AuthContext` which provides:
- User authentication state
- Account type verification (seller vs customer)
- Automatic redirect for non-admin users

## Route Structure

- `_layout.tsx` - Protected layout with authentication check
- `index.tsx` - Admin dashboard home page

## Access Control Logic

The `_layout.tsx` file implements the following access control:

1. Checks if user is authenticated
2. Verifies user has `accountType: 'seller'`
3. Redirects to home page if either check fails
4. Shows loading state during authentication check

## Testing Access Control

To test the admin route protection:

### Test Case 1: Unauthenticated User
1. Ensure no user is logged in
2. Navigate to `/(admin)`
3. Expected: Redirect to `/(tabs)/home`

### Test Case 2: Customer Account
1. Login with a customer account:
   ```typescript
   const customerUser: AuthUser = {
     id: '1',
     name: 'Test Customer',
     email: 'customer@test.com',
     accountType: 'customer'
   };
   await login(customerUser);
   ```
2. Navigate to `/(admin)`
3. Expected: Redirect to `/(tabs)/home`

### Test Case 3: Seller Account
1. Login with a seller account:
   ```typescript
   const sellerUser: AuthUser = {
     id: '1',
     name: 'Test Seller',
     email: 'seller@test.com',
     accountType: 'seller'
   };
   await login(sellerUser);
   ```
2. Navigate to `/(admin)`
3. Expected: Access granted, admin dashboard displayed

## Implementation Details

### AuthContext (`mobile/contexts/AuthContext.tsx`)
- Provides authentication state management
- Persists user data to AsyncStorage
- Exposes `isAuthenticated` and `isSeller` flags

### Auth Types (`mobile/types/auth.ts`)
- `AccountType`: 'customer' | 'seller'
- `AuthUser`: User object with account type
- `AuthContextType`: Context interface

### Root Layout (`mobile/app/_layout.tsx`)
- Wraps app with `AuthProvider`
- Registers both `(tabs)` and `(admin)` route groups

## Future Enhancements

The following features will be added in subsequent tasks:
- Product management screens
- Order management screens
- Customer communication interface
- Financial operations dashboard
- Content moderation tools
- User management interface

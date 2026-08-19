# Account Deletion Feature

## Overview
Customers can now delete their accounts from a dedicated deletion page with password confirmation and reason tracking.

## User Flow

### 1. Access Delete Account
- Navigate to **Profile** page
- Scroll down to the **Danger Zone** section
- Tap **Delete Account** button
- Navigate to the Delete Account page

### 2. Review Consequences
The page displays:
- **Warning banner** at the top
- **What you'll lose** section listing all consequences:
  - All order history and tracking
  - Saved addresses and payment methods
  - Wishlist items and favorites
  - Account preferences and settings
  - Access to ongoing orders and support

### 3. Provide Information
- **Select a reason** (required) - Choose from:
  - Not using the app anymore
  - Privacy concerns
  - Found a better alternative
  - Too many notifications
  - Difficult to use
  - Other (with custom text input)
- **Enter password** (required) for verification

### 4. Account Deactivation
- Tap "Delete My Account" button
- Account status is changed to `blocked`
- User is logged out automatically
- Redirected to home page

## Security Features

✅ **Password Required** - Users must confirm their identity  
✅ **Reason Tracking** - Deletion reasons are stored for analysis  
✅ **Admin Protection** - Admins/Super Admins cannot delete their accounts  
✅ **Soft Delete** - Account is deactivated, not permanently deleted

## Technical Implementation

### Backend (`userController.ts`)
```typescript
export const deleteAccount = async (req: AuthRequest, res: Response) => {
  // Validates password
  // Checks user role (blocks admin deletion)
  // Deactivates account with reason
  // Returns success response
}
```

**Endpoint:** `DELETE /api/users/profile`  
**Body:**
```json
{
  "password": "user_password",
  "reason": "Selected or custom reason"
}
```

### Frontend Components

#### Delete Account Page (`delete-account.tsx`)
**Full-page dedicated screen for account deletion**

**Features:**
- Warning banner at the top
- Comprehensive "What you'll lose" section
- Radio button selection for deletion reasons
- Custom reason text area for "Other"
- Password input with show/hide toggle
- Information box explaining password requirement
- Sticky action buttons at bottom
- Loading states and error handling
- Toast notifications
- Fully keyboard-accessible (no blocking issues)

**Navigation:**
```typescript
router.push('/delete-account');
```

#### Profile Page Updates (`profile.tsx`)
**New Navigation:**
```typescript
<TouchableOpacity onPress={() => router.push('/delete-account')}>
  <Text>Delete Account</Text>
</TouchableOpacity>
```

Removed modal state and modal component integration.

### UserService (`UserService.ts`)
```typescript
async deleteAccount(data: DeleteAccountData): Promise<ApiResponse<void>> {
  return apiClient.delete<void>(`${this.basePath}/profile`, data);
}
```

**Interface:**
```typescript
export interface DeleteAccountData {
  password: string;
  reason?: string;
}
```

## User Experience

### Warning Message
```
⚠️ Warning
Your account will be permanently deactivated. 
All your data, orders, and preferences will be lost.
```

### Deletion Reasons
1. **Not using the app anymore**
2. **Privacy concerns**
3. **Found a better alternative**
4. **Too many notifications**
5. **Difficult to use**
6. **Other** - with custom text input (max 200 characters)

### Success Flow
1. User navigates to Delete Account page ✅
2. User reviews consequences ✅
3. User selects deletion reason ✅
4. User enters correct password ✅
5. User taps "Delete My Account" ✅
6. Success toast: "Account deleted successfully"
7. User is logged out
8. Redirected to home page

### Error Handling
- **Missing password:** "Password is required"
- **Missing reason:** "Please select a reason for deletion"
- **Missing custom reason:** "Please provide a reason"
- **Wrong password:** "Password is incorrect"
- **Network error:** Displays error message via toast
- **Admin account:** "Admin accounts cannot be deleted"

## Security Considerations

### Password Verification
- Password is verified server-side using bcrypt
- No password is stored or logged
- Failed attempts return generic error to prevent enumeration

### Role Protection
```typescript
if (user.role === 'admin' || user.role === 'super_admin') {
  return res.status(403).json({
    status: 'error',
    message: 'Admin accounts cannot be deleted',
    errorCode: 'ADMIN_DELETE_FORBIDDEN'
  });
}
```

### Soft Delete
- Account is set to `status: 'blocked'`
- Original data is preserved for audit purposes
- Reason is stored in `suspensionReason` field

## Data Retention

When an account is deleted:
- ✅ **Preserved:** All order history, transactions, audit logs
- ✅ **Status:** Changed to `blocked`
- ✅ **Reason:** Stored in `suspensionReason`
- ❌ **Access:** User cannot log in
- ❌ **Recovery:** Account cannot be reactivated by user

## Admin View

Admins can:
- See deleted accounts in user management
- View deletion reason in user details
- Check when account was deleted
- Access full user history

## Testing

### Manual Test Cases

#### Happy Path
1. ✅ Customer logs in
2. ✅ Goes to Profile
3. ✅ Taps "Delete Account"
4. ✅ Selects a reason
5. ✅ Enters correct password
6. ✅ Taps "Delete Account"
7. ✅ Account is deactivated
8. ✅ User is logged out

#### Error Cases
- ❌ Empty password → Shows error
- ❌ Wrong password → Shows error
- ❌ No reason selected → Shows error
- ❌ Admin tries to delete → Shows error
- ❌ Network failure → Shows error

#### Edge Cases
- ✅ Cancel button closes modal without action
- ✅ Press outside modal closes it
- ✅ Long custom reason is accepted (up to 200 chars)
- ✅ Loading state prevents double submission

## Analytics & Insights

Track these metrics:
- Number of deletions per day/week/month
- Most common deletion reasons
- User tenure before deletion
- Total orders before deletion
- Recovery requests (users wanting to come back)

## Future Enhancements

### Possible Improvements
1. **Grace Period** - 7-day window to undo deletion
2. **Email Confirmation** - Send confirmation email
3. **Data Export** - Allow users to download their data before deletion
4. **Exit Survey** - More detailed feedback collection
5. **Recovery Process** - Allow users to reactivate within grace period
6. **Retention Offers** - Show special offers before deletion

## Code Locations

### Backend
- Controller: `backend/src/controllers/userController.ts` (Line ~599)
- Route: `backend/src/routes/userRoutes.ts`

### Frontend
- Page: `mobile/app/delete-account.tsx`
- Profile: `mobile/app/profile.tsx`
- Service: `mobile/services/UserService.ts`

## Support & Documentation

For issues or questions:
1. Check error messages in modal
2. Verify password is correct
3. Ensure reason is selected
4. Contact support if persistent issues

---

**Last Updated:** 2024  
**Feature Status:** ✅ Complete and Deployed

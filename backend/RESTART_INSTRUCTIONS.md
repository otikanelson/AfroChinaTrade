# Backend Restart Instructions

## The Problem
The account deletion code has been updated to **actually delete accounts** from the database instead of just blocking them. However, the backend server needs to be restarted to pick up these changes.

## Current Status
- ✅ Code is updated correctly in `src/controllers/userController.ts`
- ❌ Backend server is running old code (still blocks instead of deletes)
- ❌ Previously "deleted" accounts are still in the database with status "blocked"

## Solution - Follow These Steps:

### Step 1: Clean Up Old "Deleted" Accounts
Run this script to delete accounts that were previously marked as "blocked" when they should have been deleted:

```bash
cd backend
npm run db:cleanup:blocked
```

This will:
- Find all accounts with status "blocked" that have "deleted by user" in the reason
- Actually delete them from the database
- These accounts will now show "Invalid credentials" on login

### Step 2: Restart the Backend Server

#### If running locally:
1. Stop the current backend server (Ctrl+C in the terminal running it)
2. Start it again:
   ```bash
   cd backend
   npm run dev
   ```

#### If running on Vercel/production:
1. The changes are in the code, they will deploy automatically on next push
2. Or manually redeploy from Vercel dashboard

### Step 3: Test Account Deletion
1. Create a new test account
2. Go to Profile → Delete Account
3. Enter password and confirm deletion
4. Try to log in again with that account
5. You should see "Invalid email or password" (not "Account is blocked")

## Technical Details

### What Changed:

**Before (userController.ts - line 643):**
```typescript
// Instead of deleting, we'll deactivate the account with reason
const deletionReason = reason || 'Account deleted by user';
await User.findByIdAndUpdate(userId, { 
  status: 'blocked',
  suspensionReason: deletionReason
});
```

**After (userController.ts - line 643):**
```typescript
// Actually delete the user account from the database
await User.findByIdAndDelete(userId);
```

### Login Behavior:

**Before:**
- Deleted account → Status set to "blocked"
- Login attempt → Backend checks status → Returns "Account is blocked" error

**After:**
- Deleted account → Actually removed from database
- Login attempt → Backend can't find user → Returns "Invalid email or password" error

## Verifying the Fix

Run this query in MongoDB to check if any blocked accounts remain:
```javascript
db.users.find({ status: 'blocked', suspensionReason: /deleted/i })
```

Should return empty array after cleanup.

# Account Deletion Testing Checklist

## 🚀 PRE-TEST SETUP

### [ ] Step 1: Restart Backend Server
```bash
cd backend
npm run dev
```
⚠️ **CRITICAL**: Backend MUST be restarted to pick up all code changes!

### [ ] Step 2: Verify Test Account
The test account should already be set up:
- **Email**: `customer@example.com`
- **Status**: `deleted`
- **Password**: Wiped from database
- **Phone**: Wiped from database

If needed, run: `npm run db:fix:customer-email`

---

## ✅ TEST SCENARIOS

### Test 1: Login with Deleted Account
**Steps:**
1. Open mobile app
2. Go to login screen
3. Enter credentials:
   - Email: `customer@example.com`
   - Password: `Customer123!`
4. Click "Sign In"

**Expected Results:**
- [ ] No console logs appear
- [ ] DeletedAccountModal appears with:
  - [ ] "Account Deleted" title
  - [ ] Red trash bin icon
  - [ ] Formatted deletion date (e.g., "August 22, 2026")
  - [ ] Days remaining message (e.g., "30 days")
  - [ ] Three option cards:
    - [ ] "Wait X Days"
    - [ ] "Contact Support"
    - [ ] "Use a Different Email"
  - [ ] "I Understand" button
- [ ] No error toast appears
- [ ] No inline error message

---

### Test 2: Try to Signup with Deleted Email (Before 30 Days)
**Steps:**
1. Go to signup/register screen
2. Enter:
   - Name: Any name
   - Email: `customer@example.com`
   - Password: Any valid password
   - Phone: Any phone number
3. Click "Sign Up"

**Expected Results:**
- [ ] Error message appears:
  - "This email was used for a deleted account"
  - Shows days remaining (e.g., "Please wait 30 days")
  - Suggests using different email
- [ ] Registration is blocked
- [ ] No account created

---

### Test 3: Delete a New Account
**Steps:**
1. Create a new test account or use another account
2. Log in successfully
3. Go to Profile tab
4. Click "Delete Account"
5. **Step 1: Select Reason**
   - [ ] See visual consequence cards (2x2 grid)
   - [ ] Select a reason
   - [ ] Click "Continue"
6. **Step 2: Confirm Deletion**
   - [ ] See warning banner
   - [ ] See selected reason
   - [ ] Enter password
   - [ ] Click "Delete My Account"
7. Deletion completes
8. Try to log in again with same credentials

**Expected Results:**
- [ ] Account deletion succeeds
- [ ] Redirected to login screen
- [ ] When trying to login again: DeletedAccountModal appears
- [ ] Account status in database is `deleted`
- [ ] Password is wiped from database
- [ ] Phone is wiped from database
- [ ] Email is NOT changed (remains original)

---

### Test 4: Screen Recording Verification
**Steps:**
1. Start screen recording
2. Perform Test 1 (Login with deleted account)
3. Stop recording
4. Review the recording

**Expected Results:**
- [ ] NO console logs visible
- [ ] NO error messages in console
- [ ] NO stack traces
- [ ] Clean, professional UI only
- [ ] Smooth animations
- [ ] Modal appears and dismisses cleanly

---

## 🔍 DATABASE VERIFICATION

### Check Deleted Account in Database
```bash
cd backend
npm run db:list:deleted
```

**Expected Output:**
```
Found X deleted account(s):
- customer@example.com (deleted at: 2026-08-22)
  ID: xxx
  Reason: Account deleted by user
  Password: <WIPED>
  Phone: <WIPED>
```

---

## 🐛 TROUBLESHOOTING

### Issue: Modal doesn't appear
**Possible Causes:**
- Backend not restarted
- Error code not matching (`ACCOUNT_DELETED`)
- Modal import issue

**Fix:**
1. Restart backend: `npm run dev`
2. Check browser/app console for errors
3. Verify `DeletedAccountModal.tsx` exists

---

### Issue: Console logs still appearing
**Check:**
- [ ] `mobile/constants/config.ts` → `debug: false`
- [ ] No console.log in `login.tsx`
- [ ] No console.error in `MessagesContext.tsx`
- [ ] No console.log in `apiClient.ts`

---

### Issue: Days remaining shows wrong number
**Check:**
- [ ] Backend is calculating: `30 - daysSinceDeletion`
- [ ] Frontend is receiving `daysRemaining` from error data
- [ ] Calculation in login.tsx is correct

---

### Issue: "Email already in use" instead of "Email deleted"
**Possible Cause:**
- Account status is not set to `deleted`

**Fix:**
```bash
npm run db:convert:blocked-to-deleted
npm run db:rewipe:deleted
```

---

## ✨ SUCCESS CRITERIA

All tests pass when:
- ✅ Deleted account login shows modal (not error message)
- ✅ Modal displays correct days remaining
- ✅ Signup with deleted email is blocked for 30 days
- ✅ Account deletion wipes password and phone completely
- ✅ Email remains unchanged in database
- ✅ Zero console logs during screen recording
- ✅ Professional, clean user experience

---

## 📞 NEED HELP?

### Quick Commands
```bash
# List deleted accounts
npm run db:list:deleted

# Re-wipe deleted accounts (if password/phone not wiped)
npm run db:rewipe:deleted

# Fix customer email (restore to customer@example.com)
npm run db:fix:customer-email

# Convert old blocked accounts to deleted
npm run db:convert:blocked-to-deleted
```

### Check Backend Logs
Look for authentication logs:
```
[timestamp] Authentication attempt - Email: customer@example.com
[timestamp] Authentication failed - Account deleted
```

---

**Last Updated**: Context Transfer Session
**Status**: ✅ Implementation Complete - Ready for Testing

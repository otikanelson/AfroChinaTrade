# Account Deletion Flow - Visual Summary

## 🔄 COMPLETE USER JOURNEY

### Scenario 1: User Deletes Their Account

```
┌─────────────────────────────────────────┐
│  User Profile Screen                     │
│  ┌───────────────────────────────────┐  │
│  │ 👤 John Doe                       │  │
│  │ john@example.com                  │  │
│  └───────────────────────────────────┘  │
│                                          │
│  [Edit Profile]                          │
│  [Change Password]                       │
│  [Notification Settings]                 │
│  [❌ Delete Account]  ← User clicks      │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Delete Account - Step 1 of 2            │
│  ┌───────────────────────────────────┐  │
│  │ 🗑️ Why are you leaving?           │  │
│  │                                    │  │
│  │ ☐ Privacy concerns                │  │
│  │ ☑ Not using the app               │  │
│  │ ☐ Found better alternative        │  │
│  │ ☐ Too many notifications          │  │
│  │ ☐ Other                           │  │
│  └───────────────────────────────────┘  │
│                                          │
│  ⚠️ What you'll lose:                    │
│  ┌──────────┬──────────┐                │
│  │ 📦 Orders│ 💬 Chats │                │
│  ├──────────┼──────────┤                │
│  │ ❤️ Saved │ 🎯 Points│                │
│  └──────────┴──────────┘                │
│                                          │
│  [Continue →]                            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Delete Account - Step 2 of 2            │
│  ┌───────────────────────────────────┐  │
│  │ ⚠️ Final Warning                   │  │
│  │ This action cannot be undone       │  │
│  └───────────────────────────────────┘  │
│                                          │
│  Reason: Not using the app              │
│                                          │
│  Enter password to confirm:             │
│  [●●●●●●●●]                             │
│                                          │
│  [← Back] [Delete My Account]           │
└─────────────────────────────────────────┘
              ↓
    Account Deleted ✅
              ↓
┌─────────────────────────────────────────┐
│  Redirected to Login Screen              │
└─────────────────────────────────────────┘
```

---

### Scenario 2: User Tries to Login After Deletion

```
┌─────────────────────────────────────────┐
│  Login Screen                            │
│  ┌───────────────────────────────────┐  │
│  │ Email: john@example.com          │  │
│  │ Password: ●●●●●●●●               │  │
│  └───────────────────────────────────┘  │
│                                          │
│  [Sign In] ← User clicks                │
└─────────────────────────────────────────┘
              ↓
     Backend Processes Login
              ↓
    Finds email in database
              ↓
    Checks: status = 'deleted' ⚠️
              ↓
  Returns ACCOUNT_DELETED error
              ↓
┌─────────────────────────────────────────┐
│  🗑️ Account Deleted Modal               │
│  ┌───────────────────────────────────┐  │
│  │     🗑️                             │  │
│  │  Account Deleted                   │  │
│  │                                    │  │
│  │  This account was deleted on       │  │
│  │  August 22, 2026                   │  │
│  └───────────────────────────────────┘  │
│                                          │
│  ℹ️ Email unavailable for 28 days       │
│                                          │
│  What you can do:                       │
│  ┌───────────────────────────────────┐  │
│  │ ⏱️ Wait 28 Days                   │  │
│  │ Create new account after waiting   │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ 💬 Contact Support                │  │
│  │ Get immediate assistance           │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ 📧 Use Different Email            │  │
│  │ Sign up with another email         │  │
│  └───────────────────────────────────┘  │
│                                          │
│  [I Understand]                          │
└─────────────────────────────────────────┘
```

---

### Scenario 3: User Tries to Signup with Deleted Email (Before 30 Days)

```
┌─────────────────────────────────────────┐
│  Register Screen                         │
│  ┌───────────────────────────────────┐  │
│  │ Name: John Doe                    │  │
│  │ Email: john@example.com           │  │
│  │ Password: ●●●●●●●●                │  │
│  │ Phone: +1234567890                │  │
│  └───────────────────────────────────┘  │
│                                          │
│  [Sign Up] ← User clicks                │
└─────────────────────────────────────────┘
              ↓
     Backend Checks Email
              ↓
  Email exists with status='deleted'
              ↓
  Days since deletion: 2 days
  Days remaining: 28 days
              ↓
┌─────────────────────────────────────────┐
│  ❌ Error Message                        │
│  ┌───────────────────────────────────┐  │
│  │ ⚠️ This email was used for a      │  │
│  │    deleted account.               │  │
│  │                                    │  │
│  │    Please wait 28 days before     │  │
│  │    reusing it, or use a different │  │
│  │    email address.                 │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

### Scenario 4: User Tries to Signup After 30 Days

```
┌─────────────────────────────────────────┐
│  Register Screen (31 days later)         │
│  ┌───────────────────────────────────┐  │
│  │ Name: John Doe                    │  │
│  │ Email: john@example.com           │  │
│  │ Password: ●●●●●●●●                │  │
│  │ Phone: +1234567890                │  │
│  └───────────────────────────────────┘  │
│                                          │
│  [Sign Up] ← User clicks                │
└─────────────────────────────────────────┘
              ↓
     Backend Checks Email
              ↓
  Email exists with status='deleted'
              ↓
  Days since deletion: 31 days ✅
              ↓
  Old record HARD DELETED
              ↓
  New account CREATED
              ↓
┌─────────────────────────────────────────┐
│  ✅ Registration Successful              │
│  Redirected to Home                      │
└─────────────────────────────────────────┘
```

---

## 📊 DATABASE STATE CHANGES

### Before Deletion
```json
{
  "_id": "66c6e...",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$12$hashed...",
  "phone": "+1234567890",
  "role": "customer",
  "status": "active",
  "avatar": "https://...",
  "addresses": [...],
  "pushTokens": [...]
}
```

### After Deletion (Soft Delete)
```json
{
  "_id": "66c6e...",
  "name": "John Doe",
  "email": "john@example.com",  // ✅ KEPT
  "password": undefined,         // ❌ WIPED ($unset)
  "phone": undefined,            // ❌ WIPED ($unset)
  "role": "customer",
  "status": "deleted",           // ✅ Changed
  "deletionReason": "Not using the app",  // ✅ Added
  "deletedAt": "2026-08-22T07:48:00.000Z", // ✅ Added
  "avatar": undefined,           // ❌ WIPED ($unset)
  "addresses": [],               // ❌ CLEARED
  "pushTokens": []               // ❌ CLEARED
}
```

### After 30 Days (Hard Delete)
```
Record completely removed from database ✅
Email can be reused for new account ✅
```

---

## 🔐 SECURITY & PRIVACY

### What's Protected
- ✅ Password completely wiped (cannot login)
- ✅ Phone number removed
- ✅ Avatar/profile picture removed
- ✅ All addresses deleted
- ✅ Push notification tokens cleared
- ✅ Cannot perform any actions

### What's Retained (For 30 Days)
- ✅ User ID (for foreign key integrity)
- ✅ Name (for order history reference)
- ✅ Email (for login detection and messaging)
- ✅ Deletion metadata (reason, timestamp)

### Why Keep Email?
1. **User Experience**: Show custom message on login attempt
2. **Email Reuse Protection**: Prevent immediate reuse (30-day cooling period)
3. **Support**: Allow support team to identify deletion requests
4. **Audit Trail**: Track when and why account was deleted

---

## ⏱️ TIMELINE

```
Day 0:  User deletes account
        ↓
        Status = 'deleted'
        Password/Phone wiped
        
Day 1-29: Email locked
          ↓
          Login attempt → Show modal
          Signup attempt → Show error
          
Day 30+: Email unlocked
         ↓
         Old record hard deleted
         New signup allowed
```

---

## 🎯 KEY FEATURES

### 1. Professional UI
- ✅ Two-step deletion flow
- ✅ Clear consequence visualization
- ✅ Password confirmation required
- ✅ Informative modal on login

### 2. Data Privacy
- ✅ Immediate password wipe
- ✅ Phone number removal
- ✅ Profile data cleared
- ✅ 30-day email lock

### 3. User Communication
- ✅ Custom deletion message
- ✅ Days remaining calculation
- ✅ Three clear options provided
- ✅ No confusing error messages

### 4. Technical Excellence
- ✅ MongoDB $unset for proper deletion
- ✅ Conditional password validation
- ✅ Clean error handling
- ✅ Zero console logs

---

## ✨ RESULT

A professional, privacy-respecting account deletion system that:
- Protects user data immediately
- Provides clear communication
- Prevents email abuse
- Maintains data integrity
- Offers smooth user experience
- Ready for App Store approval ✅

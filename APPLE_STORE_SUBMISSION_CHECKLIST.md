# Apple App Store Submission Checklist

## ✅ Completed Items

### 1. Permission Purpose Strings
All required permission purpose strings have been added to `mobile/app.json`:

- **NSCameraUsageDescription** ✅
  - Clear explanation: Taking photos of products for sale
  - Specific example: Capturing product images when creating listings

- **NSPhotoLibraryUsageDescription** ✅
  - Clear explanation: Selecting and uploading product images
  - Specific example: Choosing existing photos for product listings

- **NSLocationWhenInUseUsageDescription** ✅
  - Clear explanation: Showing nearby products and sellers
  - Specific example: Filtering products by distance to find local deals

- **NSLocationAlwaysUsageDescription** ✅
  - Clear explanation: Personalized recommendations and nearby deal notifications
  - Specific example: Receiving alerts when sellers post new items nearby

- **NSUserNotificationsUsageDescription** ✅
  - Clear explanation: Stay informed about orders, messages, and updates
  - Specific example: Alerts for messages, order status changes, and purchases

### 2. Account Deletion
✅ Account deletion functionality is implemented:
- Dedicated screen at `mobile/app/delete-account.tsx`
- Backend endpoint at `/api/users/profile` (DELETE)
- User can delete account from within the app
- Password confirmation required
- Reason collection for feedback

### 3. App Configuration
✅ Basic app configuration in `mobile/app.json`:
- App name: "AfroChinaTrade"
- Bundle identifier: `com.afrochinatrade.mobile`
- Version: 3.0.2
- Icon and splash screens present
- Encryption export compliance: Set to false

## ⚠️ Items Requiring Attention

### 1. Privacy Policy and Terms of Service URLs
**CRITICAL - Required for submission**

Current status: Placeholder URLs detected
```typescript
// In mobile/app/settings/about.tsx
Linking.openURL('https://example.com/terms')
Linking.openURL('https://example.com/privacy')
```

**Action Required:**
- [ ] Replace placeholder URLs with actual hosted privacy policy
- [ ] Replace placeholder URLs with actual terms of service
- [ ] Ensure both documents are accessible and properly formatted
- [ ] URLs must be HTTPS and publicly accessible

**Where to update:**
- `mobile/app/settings/about.tsx` - Update both URLs
- `mobile/app/privacy-policy.tsx` - Consider linking to actual hosted policy

### 2. App Store Connect Metadata

**Required Information:**
- [ ] App description (clear explanation of marketplace features)
- [ ] Keywords (relevant search terms)
- [ ] Screenshots (all required sizes for iPhone and iPad if supporting tablets)
- [ ] App preview videos (optional but recommended)
- [ ] Support URL
- [ ] Marketing URL (optional)
- [ ] Copyright information
- [ ] Age rating (answer questionnaire)

### 3. Contact Information
**In app/privacy-policy.tsx:**
```typescript
If you have any questions about this Privacy Policy...
Email: utulubaf@yahoo.com
```

**Action Required:**
- [ ] Update contact email to real support email
- [ ] Add company name and address if required by jurisdiction
- [ ] Ensure contact information is accessible

### 4. App Store Screenshots
**Required Sizes:**
- [ ] 6.7" display (iPhone 14 Pro Max, iPhone 15 Pro Max)
- [ ] 6.5" display (iPhone 11 Pro Max, iPhone XS Max)
- [ ] 5.5" display (iPhone 8 Plus)
- [ ] 12.9" iPad Pro (if supporting tablets)
- [ ] Screenshots showing main features

### 5. Age Rating Considerations
Your app involves:
- E-commerce/shopping features
- User-generated content (product listings, messages)
- Payment processing
- Location services

**Apple's Age Rating Questionnaire:**
- [ ] Review and accurately answer all questions
- [ ] Expected rating: 12+ or 17+ (depending on content policy)

### 6. Location Services Justification
⚠️ **Important:** You have `NSLocationAlwaysUsageDescription` which requires strong justification.

**Apple's Requirements:**
- Must demonstrate clear user benefit
- Should consider if "When In Use" is sufficient
- Will be closely scrutinized during review

**Recommendation:**
- Consider removing "Always" location permission if not critical
- Most marketplace apps function well with "When In Use" only
- If keeping "Always", be prepared to demonstrate necessity

### 7. Data Collection Disclosure
**App Privacy Details in App Store Connect:**

Based on code analysis, your app collects:
- [ ] **Contact Info:** Email address
- [ ] **User Content:** Photos, product listings, messages
- [ ] **Identifiers:** User ID, device ID (for push notifications)
- [ ] **Location:** Precise location
- [ ] **Purchases:** Purchase history, payment info
- [ ] **Usage Data:** Product views, search history, browsing history

**For each data type, you must specify:**
- Whether it's linked to user identity
- Whether it's used for tracking
- Purposes for collection

### 8. Third-Party SDKs and Services
**Review dependencies for data collection:**
- [ ] Expo services
- [ ] Push notification services
- [ ] Analytics services (if any)
- [ ] Payment processors

### 9. Sign In with Apple
⚠️ **If you add social login in the future:**
- Facebook Login → Must also offer Sign in with Apple
- Google Sign In → Must also offer Sign in with Apple
- Any third-party authentication → Must also offer Sign in with Apple

**Current Status:** ✅ Only email/password authentication (no requirement)

### 10. TestFlight Beta Testing
**Recommended before submission:**
- [ ] Invite beta testers
- [ ] Test on multiple device sizes
- [ ] Test all user flows (registration, listing, purchasing, deletion)
- [ ] Verify deep linking and push notifications
- [ ] Test location services behavior

## 📋 Pre-Submission Checklist

### Testing
- [ ] Test on physical iOS device (not just simulator)
- [ ] Verify all permissions work correctly
- [ ] Test account deletion flow completely
- [ ] Verify privacy policy and terms links work
- [ ] Test push notifications
- [ ] Test location-based features
- [ ] Test payment flows (if implemented)
- [ ] Test with poor network conditions
- [ ] Test accessibility features (VoiceOver support)

### Legal & Compliance
- [ ] Privacy policy hosted and accessible
- [ ] Terms of service hosted and accessible
- [ ] Contact information updated
- [ ] Data collection practices documented
- [ ] GDPR compliance (if serving EU users)
- [ ] Age-appropriate content verification

### App Store Connect
- [ ] Create app listing
- [ ] Upload all required screenshots
- [ ] Write compelling app description
- [ ] Set age rating accurately
- [ ] Fill in App Privacy section completely
- [ ] Add support URL
- [ ] Configure pricing and availability
- [ ] Set up app review notes (test account credentials, etc.)

### Build Preparation
- [ ] Remove all debug code and console.logs
- [ ] Test production build (not development)
- [ ] Verify all API endpoints point to production
- [ ] Check for any hardcoded test data
- [ ] Verify analytics and crash reporting configured
- [ ] Ensure proper error handling throughout

## 🚨 Common Rejection Reasons to Avoid

1. **Incomplete Account Deletion** ✅ (Already implemented)
2. **Vague Permission Descriptions** ✅ (Already fixed)
3. **Broken Privacy Policy Links** ⚠️ (Need to fix)
4. **Missing App Privacy Details** ⚠️ (Need to complete in App Store Connect)
5. **Poor Quality Screenshots** ⚠️ (Need to create)
6. **Test/Demo Content in Production** ⚠️ (Verify removal)
7. **Unnecessary Location "Always" Permission** ⚠️ (Consider changing to "When In Use")
8. **Crashes or Major Bugs** ⚠️ (Test thoroughly)

## 📚 Additional Resources

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/)
- [TestFlight Beta Testing](https://developer.apple.com/testflight/)

## Next Steps

1. **Immediate Priority:**
   - Host and link real privacy policy and terms of service
   - Update contact information throughout the app
   
2. **Before Submission:**
   - Create all required screenshots
   - Complete App Store Connect metadata
   - Fill out App Privacy Details questionnaire
   
3. **Recommended:**
   - Run TestFlight beta with 5-10 testers
   - Get feedback and fix any issues
   - Consider changing location permission from "Always" to "When In Use"

---

**Last Updated:** Current as of version 3.0.2

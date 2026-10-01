# App Privacy Disclosure for App Store Connect

This document provides a detailed breakdown of all data collected by AfroChinaTrade mobile app for use in Apple's App Privacy section in App Store Connect.

---

## Data Collection Summary

### Contact Info
Data used to contact or identify the user.

#### ✅ Email Address
- **Collected:** YES
- **Linked to User:** YES
- **Used for Tracking:** NO
- **Purposes:**
  - App Functionality (account creation, authentication)
  - Customer Support (responding to user inquiries)
- **Where collected:**
  - Registration/signup
  - Profile settings
- **Required:** YES (for account creation)

#### ✅ Name
- **Collected:** YES
- **Linked to User:** YES
- **Used for Tracking:** NO
- **Purposes:**
  - App Functionality (user profile, orders)
  - Customer Support
- **Where collected:**
  - Registration/signup
  - Profile settings
- **Required:** YES

#### ✅ Phone Number
- **Collected:** YES
- **Linked to User:** YES
- **Used for Tracking:** NO
- **Purposes:**
  - App Functionality (delivery, contact between buyers/sellers)
  - Customer Support
- **Where collected:**
  - Profile settings
  - Delivery addresses
- **Required:** NO (optional for user profile, required for delivery)

#### ✅ Physical Address
- **Collected:** YES
- **Linked to User:** YES
- **Used for Tracking:** NO
- **Purposes:**
  - App Functionality (shipping/delivery)
- **Where collected:**
  - Delivery address management
  - Checkout process
- **Required:** YES (for order delivery)

---

### User Content
Content created by the user.

#### ✅ Photos or Videos
- **Collected:** YES
- **Linked to User:** YES
- **Used for Tracking:** NO
- **Purposes:**
  - App Functionality (product listings, profile pictures)
- **Where collected:**
  - Product creation/editing
  - Profile picture upload
- **Required:** NO (optional for sellers)

#### ✅ Customer Support
- **Collected:** YES
- **Linked to User:** YES
- **Used for Tracking:** NO
- **Purposes:**
  - Customer Support (help tickets, inquiries)
- **Data includes:**
  - Support messages
  - Issue descriptions
- **Where collected:**
  - Customer support/help section
  - Messaging system
- **Required:** NO (only when user contacts support)

#### ✅ Other User Content
- **Collected:** YES
- **Linked to User:** YES
- **Used for Tracking:** NO
- **Purposes:**
  - App Functionality (marketplace listings, reviews, messages)
- **Data includes:**
  - Product descriptions
  - Product reviews and ratings
  - Messages between buyers and sellers
  - Wishlist items
  - Shopping cart contents
- **Where collected:**
  - Product creation
  - Review submission
  - Messaging system
  - Shopping features
- **Required:** Varies by feature

---

### Identifiers
Data used to identify the user or device.

#### ✅ User ID
- **Collected:** YES
- **Linked to User:** YES
- **Used for Tracking:** NO
- **Purposes:**
  - App Functionality (account management, session management)
  - Analytics (understanding app usage patterns)
- **Where collected:**
  - Automatically generated at registration
- **Required:** YES (automatic)

#### ✅ Device ID
- **Collected:** YES
- **Linked to User:** YES
- **Used for Tracking:** NO
- **Purposes:**
  - App Functionality (push notifications)
  - Analytics (device-specific issues, crash reporting)
- **Data includes:**
  - Push notification tokens
  - Device identifiers for notifications
- **Where collected:**
  - Automatically when app is installed
  - When push notifications are enabled
- **Required:** NO (only if user enables notifications)

---

### Location
User's location.

#### ✅ Precise Location
- **Collected:** YES
- **Linked to User:** YES
- **Used for Tracking:** NO
- **Purposes:**
  - App Functionality (showing nearby products and sellers)
  - Product Personalization (location-based recommendations)
- **Where collected:**
  - When browsing products
  - When searching for nearby items
- **Required:** NO (user can decline, but some features won't work)

#### ⚠️ Coarse Location
- **Collected:** NO
- *Note: App requests precise location only*

---

### Purchases
User's purchase history.

#### ✅ Purchase History
- **Collected:** YES
- **Linked to User:** YES
- **Used for Tracking:** NO
- **Purposes:**
  - App Functionality (order tracking, order history)
  - Product Personalization (purchase-based recommendations)
  - Analytics (understanding popular products)
- **Data includes:**
  - Products purchased
  - Purchase dates
  - Order amounts
  - Order status
  - Payment methods used (not card details)
- **Where collected:**
  - Checkout/purchase flow
  - Order history section
- **Required:** YES (when user makes purchases)

#### ✅ Payment Info
- **Collected:** YES
- **Linked to User:** YES
- **Used for Tracking:** NO
- **Purposes:**
  - App Functionality (processing payments)
- **Data includes:**
  - Payment method type
  - Last 4 digits of payment method (for display)
  - Billing address
- **Where collected:**
  - Payment method management
  - Checkout process
- **Required:** YES (to complete purchases)
- **Note:** Full card details are NOT stored in app; handled by payment processor

---

### Browsing History
Information about content the user has viewed.

#### ✅ Browsing History
- **Collected:** YES
- **Linked to User:** YES
- **Used for Tracking:** NO
- **Purposes:**
  - Product Personalization (personalized recommendations)
  - Analytics (understanding user preferences)
- **Data includes:**
  - Products viewed
  - Product categories browsed
  - Search queries
  - Time spent viewing products
  - Items added to cart/wishlist
- **Where collected:**
  - Product browsing
  - Product search
  - Category exploration
- **Required:** NO (collected automatically to improve experience)

---

### Search History
Information about searches performed in the app.

#### ✅ Search History
- **Collected:** YES
- **Linked to User:** YES
- **Used for Tracking:** NO
- **Purposes:**
  - Product Personalization (better search suggestions)
  - App Functionality (search history feature)
  - Analytics (improving search results)
- **Data includes:**
  - Search terms entered
  - Search timestamps
  - Products clicked from search results
- **Where collected:**
  - Search bar usage
- **Required:** NO (collected automatically to improve experience)

---

### Usage Data
Information about how the user interacts with the app.

#### ✅ Product Interaction
- **Collected:** YES
- **Linked to User:** YES
- **Used for Tracking:** NO
- **Purposes:**
  - Analytics (app performance, feature usage)
  - Product Personalization (recommendations)
- **Data includes:**
  - Features used
  - Buttons tapped
  - Screens viewed
  - Session duration
  - App launches
- **Where collected:**
  - Throughout app usage
- **Required:** NO (collected automatically)

#### ✅ Advertising Data
- **Collected:** YES
- **Linked to User:** YES
- **Used for Tracking:** NO
- **Purposes:**
  - App Functionality (showing in-app promotional banners/ads)
- **Data includes:**
  - Ads viewed
  - Ad interactions
- **Where collected:**
  - When viewing splash ads or promotional content
- **Required:** NO (part of app experience)

---

### Diagnostics
Data used to measure app performance and diagnose issues.

#### ✅ Crash Data
- **Collected:** YES (if crash reporting is implemented)
- **Linked to User:** NO
- **Used for Tracking:** NO
- **Purposes:**
  - App Functionality (fixing bugs and crashes)
- **Data includes:**
  - Crash logs
  - Stack traces
  - Device state at crash
- **Where collected:**
  - Automatically when app crashes
- **Required:** NO (automatic)

#### ✅ Performance Data
- **Collected:** YES
- **Linked to User:** NO
- **Used for Tracking:** NO
- **Purposes:**
  - App Functionality (optimizing performance)
  - Analytics (identifying slow operations)
- **Data includes:**
  - App launch time
  - Screen load times
  - Network request duration
- **Where collected:**
  - Throughout app usage
- **Required:** NO (automatic)

---

## Data NOT Collected

The following data types are NOT collected by AfroChinaTrade:

- ❌ Health & Fitness data
- ❌ Financial Info (beyond payment method type and last 4 digits)
- ❌ Contacts (address book)
- ❌ Audio Data
- ❌ Gameplay Content
- ❌ Sensitive Info (racial/ethnic data, sexual orientation, pregnancy, disability, religious beliefs, political beliefs, union membership, biometric data, genetic data)

---

## Third-Party SDKs and Services

### Expo Services
- **Purpose:** App development framework and over-the-air updates
- **Data accessed:** Device info, app version, update status
- **Privacy Policy:** https://expo.dev/privacy

### Push Notification Service (via Expo)
- **Purpose:** Sending push notifications
- **Data accessed:** Device push tokens, notification preferences
- **Privacy Policy:** https://expo.dev/privacy

### Image Storage/CDN (if using Cloudinary or similar)
- **Purpose:** Storing and delivering product images
- **Data accessed:** Uploaded images only
- **Privacy Policy:** [Add your CDN provider's policy]

---

## Data Retention

- **Active accounts:** Data retained while account is active
- **Deleted accounts:** 
  - Personal data anonymized immediately upon deletion request
  - Account data retained for 30 days, then permanently deleted
  - Order history retained for legal/tax requirements (7 years in some jurisdictions)
- **Browsing history:** Retained for 2 years, then automatically deleted
- **Message history:** Retained while account is active

---

## User Rights

Users can:
- ✅ Access their data (via profile and settings)
- ✅ Update their data (via profile editing)
- ✅ Delete their account (via delete account feature)
- ✅ Export their data (contact support - if implemented)
- ✅ Opt out of location services (device settings)
- ✅ Opt out of push notifications (device settings)

---

## How to Fill Out App Store Connect

### Step-by-Step Guide

1. **Login to App Store Connect**
   - Go to your app's page
   - Click "App Privacy" in the left sidebar

2. **Get Started**
   - Click "Get Started"

3. **Data Collection Questions**
   Answer "Yes" to: "Does your app collect data from this app?"

4. **Select Data Types**
   For each category above marked with ✅, click to add it

5. **For Each Data Type Selected:**

   **Question 1:** How is this data used?
   - Check the boxes matching the "Purposes" listed above
   
   **Question 2:** Is this data linked to the user's identity?
   - Answer based on "Linked to User" field above
   
   **Question 3:** Is this data used for tracking purposes?
   - Answer "NO" for all (as listed above)

6. **Review**
   - Review all entries
   - Publish privacy information

---

## Important Notes

1. **Be Accurate:** Apple takes privacy disclosures seriously. Inaccurate information can lead to rejection or removal.

2. **Update When Changed:** If you add new features that collect additional data, update your privacy disclosure.

3. **Match Your Privacy Policy:** Ensure this disclosure matches what's in your hosted privacy policy.

4. **Tracking Definition:** Apple defines "tracking" as linking data collected from the app with data from third parties for advertising or data broker purposes. Since AfroChinaTrade doesn't do this, all "Used for Tracking" answers are NO.

5. **Third-Party Code:** If you add new SDKs (analytics, advertising, etc.), review their data collection and update this disclosure.

---

**Last Updated:** Prepared for version 3.0.2
**Review Date:** Before each App Store submission


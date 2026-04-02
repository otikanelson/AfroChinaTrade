# Requirements Document

## Introduction

This feature adds production-ready push notification delivery to the existing Expo + Node.js/MongoDB e-commerce application. The system currently stores in-app notifications in MongoDB and displays them in a notifications screen, but has no push delivery capability. This feature adds Expo Push Notification Service (EPNS) integration to deliver real-time push notifications to user devices, covering all agreed trigger points (order updates, refund status changes, message activity, admin alerts, and collection broadcasts), while respecting per-user notification settings and supporting admin-initiated broadcast campaigns.

## Glossary

- **Push_Token_Service**: The mobile-side service responsible for requesting OS push permission, obtaining an Expo push token, and registering it with the backend.
- **Push_Delivery_Service**: The backend service responsible for sending push notifications via the Expo Push Notification API, handling errors, and cleaning up invalid tokens.
- **Token_Registry**: The array of push token records stored on the User document, one entry per device.
- **EPNS**: Expo Push Notification Service — the third-party service that abstracts FCM (Android) and APNs (iOS) delivery.
- **In_App_Toast**: A custom foreground notification banner rendered within the mobile app when a push arrives while the app is in the foreground.
- **Deep_Link**: A URL scheme or route that navigates the user to a specific screen when a push notification is tapped from the background or killed state.
- **Notification_Settings**: Per-user preferences stored on the User document controlling which push categories are delivered.
- **Admin_Broadcast**: An admin-initiated push notification sent to all users or a filtered segment.
- **DeviceNotRegistered**: An error code returned by EPNS indicating a push token is no longer valid and should be removed.
- **Push_Token_Record**: A subdocument containing `{ token, deviceId, platform, createdAt }` stored in the Token_Registry.

---

## Requirements

### Requirement 1: Push Token Registration

**User Story:** As a user, I want the app to register my device for push notifications on login or app launch, so that I receive push notifications on my current device.

#### Acceptance Criteria

1. WHEN the app launches or a user logs in, THE Push_Token_Service SHALL request push notification permission from the OS.
2. WHEN the OS grants push notification permission, THE Push_Token_Service SHALL obtain a valid Expo push token from EPNS.
3. WHEN a valid Expo push token is obtained, THE Push_Token_Service SHALL send the token along with the device ID and platform (`ios` or `android`) to the backend registration endpoint.
4. WHEN the backend receives a token registration request for an authenticated user, THE Token_Registry SHALL store the Push_Token_Record if the token does not already exist for that user.
5. WHEN a user logs out, THE Push_Token_Service SHALL send a token removal request to the backend for the current device's token.
6. WHEN the backend receives a token removal request, THE Token_Registry SHALL remove the matching Push_Token_Record from the user's token array.
7. IF the OS denies push notification permission, THEN THE Push_Token_Service SHALL proceed without a token and SHALL NOT block the login or app launch flow.
8. IF the device is running in Expo Go, THEN THE Push_Token_Service SHALL skip token registration and log a warning, because Expo Go does not support production push tokens.

---

### Requirement 2: Push Token Storage

**User Story:** As a system, I need to store multiple push tokens per user (one per device), so that users receive notifications on all their active devices.

#### Acceptance Criteria

1. THE Token_Registry SHALL store an array of Push_Token_Record objects on the User document, where each record contains `token` (string), `deviceId` (string), `platform` (`ios` | `android`), and `createdAt` (Date).
2. THE Token_Registry SHALL enforce uniqueness of `token` values within a single user's token array.
3. WHEN a new Push_Token_Record is added, THE Token_Registry SHALL set `createdAt` to the current server timestamp.
4. THE Token_Registry SHALL support a maximum of 10 Push_Token_Records per user to prevent unbounded growth.
5. WHEN the Token_Registry already contains 10 records for a user and a new token is registered, THE Token_Registry SHALL remove the oldest Push_Token_Record before inserting the new one.

---

### Requirement 3: Push Delivery Service

**User Story:** As a system, I need a backend service that sends push notifications via EPNS, so that users receive real-time alerts on their devices.

#### Acceptance Criteria

1. THE Push_Delivery_Service SHALL accept a list of user IDs, a notification title, a notification body, and optional data payload, then retrieve all valid push tokens for those users and send push messages via the EPNS API.
2. WHEN EPNS returns a `DeviceNotRegistered` error for a token, THE Push_Delivery_Service SHALL remove that token from the Token_Registry.
3. WHEN EPNS returns a `MessageTooBig` or `MessageRateExceeded` error, THE Push_Delivery_Service SHALL log the error with the affected token and notification details.
4. THE Push_Delivery_Service SHALL send push messages in batches of no more than 100 tokens per EPNS API call, as required by the EPNS API limit.
5. IF a user has no tokens in the Token_Registry, THEN THE Push_Delivery_Service SHALL skip that user without returning an error.
6. THE Push_Delivery_Service SHALL operate independently of in-app notification creation — push delivery failure SHALL NOT prevent the in-app notification from being saved to the database.

---

### Requirement 4: Notification Settings Enforcement

**User Story:** As a user, I want my notification preferences to be respected so that I only receive push notifications for categories I have opted into.

#### Acceptance Criteria

1. WHEN the Push_Delivery_Service is about to send a push to a user, THE Push_Delivery_Service SHALL check the user's Notification_Settings before sending.
2. IF a user's `pushNotifications` setting is `false`, THEN THE Push_Delivery_Service SHALL skip sending a push to that user.
3. IF a user's `orderUpdates` setting is `false`, THEN THE Push_Delivery_Service SHALL skip sending order-related push notifications to that user.
4. IF a user's `promotions` setting is `false`, THEN THE Push_Delivery_Service SHALL skip sending promotion and collection broadcast push notifications to that user.
5. THE Push_Delivery_Service SHALL always save the in-app notification to the database regardless of the user's push settings, so that users who re-enable a setting can see past notifications in-app.

---

### Requirement 5: Order Status Push Notifications

**User Story:** As a customer, I want to receive a push notification when my order status changes, so that I am immediately informed of my order's progress.

#### Acceptance Criteria

1. WHEN an order's status is updated to `confirmed`, `processing`, `shipped`, `delivered`, or `cancelled`, THE Push_Delivery_Service SHALL send a push notification to the order's customer.
2. THE push notification SHALL include the order number and a human-readable status description in the notification body.
3. THE push notification data payload SHALL include `orderId` and `screen: 'order-detail'` to enable deep linking.
4. WHEN the push notification is tapped from the background or killed state, THE Deep_Link SHALL navigate the user to the order detail screen for the relevant order.

---

### Requirement 6: Refund Status Push Notifications

**User Story:** As a customer, I want to receive a push notification when my refund request is approved or rejected, so that I know the outcome without checking the app.

#### Acceptance Criteria

1. WHEN a refund status changes to `approved` or `rejected`, THE Push_Delivery_Service SHALL send a push notification to the refund's customer.
2. THE push notification body SHALL state whether the refund was approved or rejected and include the refund amount.
3. THE push notification data payload SHALL include `refundId` and `screen: 'my-refunds'` to enable deep linking.
4. WHEN the push notification is tapped from the background or killed state, THE Deep_Link SHALL navigate the user to the my-refunds screen.

---

### Requirement 7: Message Activity Push Notifications

**User Story:** As a user, I want to receive a push notification when there is new activity in a message thread I am part of, so that I can respond promptly.

#### Acceptance Criteria

1. WHEN a new message is sent in a thread, THE Push_Delivery_Service SHALL send a single summary push notification to the recipient of that thread.
2. THE push notification body SHALL read "You have new messages" and SHALL NOT include the message content.
3. THE push notification data payload SHALL include `threadId` and `screen: 'message-thread'` to enable deep linking.
4. WHEN the push notification is tapped from the background or killed state, THE Deep_Link SHALL navigate the user to the relevant message thread screen.
5. IF the recipient is the same user who sent the message, THEN THE Push_Delivery_Service SHALL NOT send a push notification to that user.

---

### Requirement 8: Admin Alert Push Notifications

**User Story:** As an admin, I want to receive push notifications when a new order is placed or a new refund request is submitted, so that I can act on them quickly.

#### Acceptance Criteria

1. WHEN a new order is placed, THE Push_Delivery_Service SHALL send a push notification to all users with the `admin` role.
2. WHEN a new refund request is submitted, THE Push_Delivery_Service SHALL send a push notification to all users with the `admin` role.
3. THE push notification for a new order SHALL include the order number and total amount in the notification body.
4. THE push notification for a new refund request SHALL include the customer name and refund amount in the notification body.
5. THE push notification data payload for admin alerts SHALL include the relevant `orderId` or `refundId` and the target admin screen route to enable deep linking.

---

### Requirement 9: New Collection Broadcast Push Notifications

**User Story:** As an admin, I want to send a push notification to all users when a new collection is published, so that users are aware of new curated product collections.

#### Acceptance Criteria

1. WHEN a new collection is published, THE Push_Delivery_Service SHALL send a push notification to all users who have `promotions` enabled in their Notification_Settings.
2. THE push notification SHALL include the collection name in the notification title and a brief description in the body.
3. THE push notification data payload SHALL include `collectionId` and `screen: 'collection'` to enable deep linking.
4. WHEN the push notification is tapped from the background or killed state, THE Deep_Link SHALL navigate the user to the relevant collection screen.

---

### Requirement 10: Admin Broadcast Push Notifications

**User Story:** As an admin, I want to send a custom push notification to all users or a filtered segment, so that I can communicate promotions and announcements directly.

#### Acceptance Criteria

1. THE Admin_Broadcast endpoint SHALL accept a `title`, `message`, `data` payload, and an optional `segment` filter (e.g., `all`).
2. WHEN an admin submits a broadcast, THE Push_Delivery_Service SHALL send the push notification to all users matching the segment filter who have `promotions` enabled in their Notification_Settings.
3. THE Admin_Broadcast endpoint SHALL be restricted to users with the `admin` or `super_admin` role.
4. WHEN an admin submits a broadcast, THE Push_Delivery_Service SHALL also save an in-app notification of type `promotion` to the database for each targeted user.
5. THE Admin_Broadcast endpoint SHALL return the count of users targeted and the count of push tokens the notification was dispatched to.

---

### Requirement 11: Foreground Push Handling (In-App Toast)

**User Story:** As a user, I want to see an in-app toast notification when a push arrives while the app is open, so that I am informed without being interrupted by an OS banner.

#### Acceptance Criteria

1. WHEN a push notification is received while the app is in the foreground, THE In_App_Toast SHALL display the notification title and body as an overlay banner within the app.
2. THE In_App_Toast SHALL be visible for 4 seconds and then automatically dismiss.
3. THE In_App_Toast SHALL support manual dismissal by the user before the 4-second timeout.
4. WHEN the user taps the In_App_Toast, THE Deep_Link SHALL navigate the user to the screen specified in the notification data payload.
5. THE In_App_Toast SHALL suppress the OS notification banner when the app is in the foreground, as required by the Expo notifications API.

---

### Requirement 12: Background and Killed State Deep Linking

**User Story:** As a user, I want tapping a push notification from the background or killed state to open the relevant screen in the app, so that I can act on the notification immediately.

#### Acceptance Criteria

1. WHEN the app is in the background and the user taps a push notification, THE Deep_Link SHALL navigate the user to the screen specified in the notification data payload.
2. WHEN the app is in the killed state and the user taps a push notification, THE Deep_Link SHALL open the app and navigate the user to the screen specified in the notification data payload.
3. THE Deep_Link SHALL support the following screen routes: `order-detail/:orderId`, `my-refunds`, `message-thread/:threadId`, `collection/:collectionId`, and `notifications`.
4. IF the notification data payload does not contain a recognized screen route, THEN THE Deep_Link SHALL navigate the user to the notifications screen as a fallback.

---

### Requirement 13: Invalid Token Cleanup

**User Story:** As a system, I need to automatically remove invalid push tokens, so that the Token_Registry stays clean and push delivery remains efficient.

#### Acceptance Criteria

1. WHEN EPNS returns a `DeviceNotRegistered` error for a specific token during a push send, THE Push_Delivery_Service SHALL immediately remove that token from the Token_Registry.
2. THE Push_Delivery_Service SHALL process `DeviceNotRegistered` errors for all tokens in a batch before returning, not just the first error encountered.
3. WHEN a token is removed due to a `DeviceNotRegistered` error, THE Push_Delivery_Service SHALL log the removal including the user ID and token value for audit purposes.

# Implementation Plan: Push Notification System

## Overview

Implement EPNS-backed push notifications on top of the existing in-app notification system. The work is split into backend (data model, delivery service, new endpoints, trigger wiring) and mobile (token registration, foreground toast, deep linking). Push delivery is always fire-and-forget — it never blocks the primary operation.

## Tasks

- [x] 1. Extend data models
  - [x] 1.1 Add `IPushTokenRecord` subdocument and `pushTokens` array to `backend/src/models/User.ts`
    - Define `IPushTokenRecord` interface with `token`, `deviceId`, `platform`, `createdAt`
    - Add `PushTokenRecordSchema` (no `_id`) with max-10 validator
    - Add `pushTokens` field to `IUser` interface and `UserSchema`
    - Add index `UserSchema.index({ 'pushTokens.token': 1 })`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 1.2 Write property tests for push token storage invariants
    - **Property 1: Token registration upsert** — Validates: Requirements 1.4
    - **Property 2: Token removal** — Validates: Requirements 1.6
    - **Property 3: Push token record shape** — Validates: Requirements 2.1, 2.3
    - **Property 4: Token uniqueness per user** — Validates: Requirements 2.2
    - **Property 5: Token array max-10 invariant** — Validates: Requirements 2.4
    - **Property 6: Oldest token evicted at cap** — Validates: Requirements 2.5
    - Use `fast-check`, min 100 iterations, tag each test with `// Feature: push-notification-system, Property N: ...`
    - _Requirements: 2.1–2.5_

  - [x] 1.3 Extend `backend/src/models/Notification.ts` type enum
    - Add `'new_order'` and `'new_refund_request'` to the `type` enum in both the interface and schema
    - Update `createNotification` and `createBulkNotifications` type signatures in `notificationController.ts` to accept the new values
    - _Requirements: 8.1, 8.2_

- [x] 2. Implement `PushDeliveryService`
  - [x] 2.1 Create `backend/src/services/PushDeliveryService.ts`
    - Install `expo-server-sdk` if not present (add to `backend/package.json`)
    - Implement `send(payload: PushPayload): Promise<void>` — fetches tokens, filters by `notificationSettings`, batches ≤100, calls EPNS
    - Implement `fetchTokens(userIds)` — queries `User.pushTokens` for all given user IDs
    - Implement `filterBySettings(tokens, settingKey?)` — skips users with `pushNotifications=false`; additionally skips by `settingKey` (`orderUpdates` or `promotions`)
    - Implement `sendBatch(messages)` — calls `expo.sendPushNotificationsAsync`
    - Implement `handleTickets(tickets, messages)` — processes `DeviceNotRegistered` errors, calls `removeInvalidToken` for each
    - Implement `removeInvalidToken(token)` — removes token from `User.pushTokens` and logs user ID + token value
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 13.1, 13.2, 13.3_

  - [ ]* 2.2 Write property tests for `PushDeliveryService` core invariants
    - **Property 7: EPNS message construction** — Validates: Requirements 3.1
    - **Property 8: DeviceNotRegistered cleanup — full batch** — Validates: Requirements 3.2, 13.1, 13.2
    - **Property 9: Batching ≤100 per EPNS call** — Validates: Requirements 3.4
    - **Property 10: Push failure does not block in-app notification** — Validates: Requirements 3.6, 4.5
    - Use `fast-check`, min 100 iterations
    - _Requirements: 3.1, 3.2, 3.4, 3.6_

  - [ ]* 2.3 Write property tests for notification settings enforcement
    - **Property 11: pushNotifications=false skips push** — Validates: Requirements 4.2
    - **Property 12: orderUpdates=false skips order push** — Validates: Requirements 4.3
    - **Property 13: promotions=false skips promotion and collection push** — Validates: Requirements 4.4, 9.1
    - Use `fast-check`, min 100 iterations
    - _Requirements: 4.2, 4.3, 4.4_

- [x] 3. Add push token endpoints to backend
  - [x] 3.1 Add `registerPushToken` and `removePushToken` to `backend/src/controllers/notificationController.ts`
    - `registerPushToken(req, res)` — upsert token into `user.pushTokens`; enforce uniqueness; evict oldest if length would exceed 10
    - `removePushToken(req, res)` — remove matching token from `user.pushTokens`
    - Return HTTP 400 for missing/invalid body fields
    - _Requirements: 1.3, 1.4, 1.6, 2.2, 2.4, 2.5_

  - [x] 3.2 Add `broadcastNotification` to `backend/src/controllers/notificationController.ts`
    - Accept `title`, `message`, `data`, optional `segment` (default `'all'`)
    - Restrict to `admin` / `super_admin` roles (return 403 otherwise)
    - Save in-app `promotion` notification for every targeted user
    - Call `PushDeliveryService.send` with `settingKey: 'promotions'`
    - Return `{ usersTargeted, tokensDispatched }` in response
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 3.3 Register new routes in `backend/src/routes/notificationRoutes.ts`
    - `POST /push-tokens` → `registerPushToken` (auth required)
    - `DELETE /push-tokens` → `removePushToken` (auth required)
    - `POST /notifications/broadcast` → `broadcastNotification` (auth + admin check)
    - _Requirements: 1.3, 1.6, 10.3_

  - [ ]* 3.4 Write property tests for broadcast and token endpoints
    - **Property 27: Broadcast endpoint is admin-only** — Validates: Requirements 10.3
    - **Property 28: Broadcast saves in-app notification for each targeted user** — Validates: Requirements 10.4
    - **Property 29: Broadcast response includes targeted counts** — Validates: Requirements 10.5
    - Use `fast-check`, min 100 iterations
    - _Requirements: 10.3, 10.4, 10.5_

- [x] 4. Checkpoint — Ensure all backend model and service tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Wire push delivery into existing backend controllers
  - [x] 5.1 Update `backend/src/controllers/orderController.ts`
    - After saving order status update in `updateOrderStatus`, `updateTrackingNumber`, `confirmDelivery`, and `cancelOrder`, call `PushDeliveryService.send` with the customer's user ID, order number, new status, and `data: { screen: 'order-detail', orderId }`
    - After creating a new order in `createOrder` / `checkout`, call `PushDeliveryService.send` targeting all admin users with `data: { screen: 'admin-order', orderId }`
    - Use `settingKey: 'orderUpdates'` for customer pushes; no `settingKey` for admin alerts
    - All `PushDeliveryService` calls must be fire-and-forget (wrapped in try/catch, never awaited in a way that blocks the response)
    - _Requirements: 5.1, 5.2, 5.3, 8.1, 8.3_

  - [ ]* 5.2 Write property tests for order push triggers
    - **Property 14: Order status transitions trigger push** — Validates: Requirements 5.1
    - **Property 15: Order push body contains order number and status** — Validates: Requirements 5.2
    - **Property 16: Notification data payload shape** — Validates: Requirements 5.3
    - **Property 21: Admin alerts sent to all admin users** — Validates: Requirements 8.1, 8.2
    - **Property 22: Admin order push body contains order number and amount** — Validates: Requirements 8.3
    - Use `fast-check`, min 100 iterations
    - _Requirements: 5.1, 5.2, 5.3, 8.1, 8.3_

  - [x] 5.3 Update `backend/src/controllers/refundController.ts`
    - In `updateRefundStatus`, after saving `approved` or `rejected` status, call `PushDeliveryService.send` with the customer's user ID, refund outcome, amount, and `data: { screen: 'my-refunds', refundId }`
    - In `createRefundRequest` / `createRefund`, call `PushDeliveryService.send` targeting all admin users with `data: { screen: 'admin-refund', refundId }`
    - Use `settingKey: 'orderUpdates'` for customer refund pushes; no `settingKey` for admin alerts
    - _Requirements: 6.1, 6.2, 6.3, 8.2, 8.4_

  - [ ]* 5.4 Write property tests for refund push triggers
    - **Property 17: Refund status transitions trigger push** — Validates: Requirements 6.1
    - **Property 18: Refund push body contains outcome and amount** — Validates: Requirements 6.2
    - **Property 23: Admin refund push body contains customer name and amount** — Validates: Requirements 8.4
    - Use `fast-check`, min 100 iterations
    - _Requirements: 6.1, 6.2, 8.4_

  - [x] 5.5 Update `backend/src/controllers/messageController.ts`
    - In `createMessage`, after saving the message, determine the recipient (the other party in the thread) and call `PushDeliveryService.send` with the recipient's user ID, body `"You have new messages"`, and `data: { screen: 'message-thread', threadId }`
    - Skip push if `senderId === recipientId`
    - No `settingKey` filter (message pushes are not gated by `orderUpdates` or `promotions`)
    - _Requirements: 7.1, 7.2, 7.3, 7.5_

  - [ ]* 5.6 Write property tests for message push triggers
    - **Property 19: Message push sent to recipient, not sender** — Validates: Requirements 7.1, 7.5
    - **Property 20: Message push body is fixed summary string** — Validates: Requirements 7.2
    - Use `fast-check`, min 100 iterations
    - _Requirements: 7.1, 7.2, 7.5_

  - [x] 5.7 Update `backend/src/controllers/collectionController.ts`
    - In `toggleCollectionStatus` (when toggling to active/published), call `PushDeliveryService.send` targeting all users with `settingKey: 'promotions'`, collection name in title, and `data: { screen: 'collection', collectionId }`
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ]* 5.8 Write property tests for collection push triggers
    - **Property 24: Collection push sent only to users with promotions enabled** — Validates: Requirements 9.1
    - **Property 25: Collection push body contains collection name** — Validates: Requirements 9.2
    - **Property 26: Broadcast respects promotions setting** — Validates: Requirements 10.2
    - Use `fast-check`, min 100 iterations
    - _Requirements: 9.1, 9.2, 10.2_

- [x] 6. Checkpoint — Ensure all backend controller tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement mobile `PushTokenService`
  - [x] 7.1 Create `mobile/services/PushTokenService.ts`
    - Implement `register(): Promise<void>` — request OS permission via `expo-notifications`, skip silently if denied; skip with console warning if running in Expo Go; obtain Expo push token; call `POST /api/push-tokens` with `{ token, deviceId, platform }`
    - Implement `unregister(): Promise<void>` — call `DELETE /api/push-tokens` with current token; log warning on failure but do not throw
    - Implement private `getDeviceId(): string` — stable identifier via `expo-device`
    - _Requirements: 1.1, 1.2, 1.3, 1.7, 1.8_

  - [x] 7.2 Add `registerPushToken` and `removePushToken` API methods to `mobile/services/NotificationService.ts`
    - `registerPushToken(payload: { token: string; deviceId: string; platform: string }): Promise<ApiResponse<void>>`
    - `removePushToken(token: string): Promise<ApiResponse<void>>`
    - _Requirements: 1.3, 1.6_

  - [x] 7.3 Call `PushTokenService.register()` on login/app launch in `mobile/contexts/AuthContext.tsx`
    - After successful `login()` and after `loadCurrentUser()` succeeds on app init, call `PushTokenService.register()`
    - _Requirements: 1.1_

  - [x] 7.4 Call `PushTokenService.unregister()` on logout in `mobile/contexts/AuthContext.tsx`
    - In the `logout()` function, call `PushTokenService.unregister()` before clearing local state; wrap in try/catch so logout always proceeds
    - _Requirements: 1.5_

  - [ ]* 7.5 Write unit tests for `PushTokenService`
    - Test `register()` calls the correct API endpoint with correct payload (Req 1.3)
    - Test `register()` skips silently when permission denied (Req 1.7)
    - Test `register()` skips with warning in Expo Go (Req 1.8)
    - Test `unregister()` is called on logout (Req 1.5)
    - Test `unregister()` failure does not throw (Req 1.5)
    - _Requirements: 1.3, 1.5, 1.7, 1.8_

- [x] 8. Implement mobile foreground handling and deep linking
  - [x] 8.1 Create `mobile/components/InAppToast.tsx`
    - Accept props: `title`, `body`, `data?`, `onDismiss`
    - Auto-dismiss after 4000 ms using `setTimeout` (clear on unmount)
    - Support manual dismiss via a close button
    - Tapping the toast body invokes deep link navigation based on `data.screen`
    - Render as an overlay (absolute positioned, top of screen, above all content)
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 8.2 Add notification listeners and `InAppToast` to `mobile/app/_layout.tsx`
    - Call `Notifications.setNotificationHandler` returning `{ shouldShowAlert: false, shouldPlaySound: false, shouldSetBadge: false }` to suppress OS banner in foreground
    - Add `addNotificationReceivedListener` — extract title/body/data from notification and set toast state
    - Add `addNotificationResponseReceivedListener` — extract data from response and call deep link handler
    - Render `<InAppToast>` conditionally at root level when toast state is set
    - Remove all listeners on unmount
    - _Requirements: 11.1, 11.5, 12.1, 12.2_

  - [x] 8.3 Implement deep link handler utility
    - Create a `handleNotificationDeepLink(data: Record<string, any>, router: Router)` helper (can live in `mobile/utils/notificationDeepLink.ts`)
    - Map `data.screen` values to routes: `'order-detail'` → `/order-detail/${data.orderId}`, `'my-refunds'` → `/my-refunds`, `'message-thread'` → `/message-thread/${data.threadId}`, `'collection'` → `/collection/${data.collectionId}`, `'admin-order'` → `/(admin)/order/${data.orderId}`, `'admin-refund'` → `/(admin)/refunds`, fallback → `/notifications`
    - _Requirements: 12.3, 12.4_

  - [ ]* 8.4 Write property tests for `InAppToast` behavior
    - **Property 30: Toast renders correct title and body** — Validates: Requirements 11.1
    - **Property 31: Toast auto-dismisses after 4 seconds** — Validates: Requirements 11.2
    - **Property 32: Toast supports manual dismissal** — Validates: Requirements 11.3
    - **Property 33: Toast tap triggers correct deep link** — Validates: Requirements 11.4
    - Use `fast-check`, min 100 iterations
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ]* 8.5 Write property tests for deep link routing
    - **Property 34: Deep link routing covers all supported routes and falls back gracefully** — Validates: Requirements 12.3, 12.4
    - Use `fast-check`, min 100 iterations
    - _Requirements: 12.3, 12.4_

  - [x] 8.6 Remove polling from `mobile/hooks/useNotifications.ts`
    - Remove `startPolling`, `stopPolling`, `pollingIntervalRef`, `isPollingRef`, and the `setInterval` logic
    - Keep `fetchNotifications`, `markAsRead`, `markAllAsRead`, `updateSettings`, and `fetchUnreadCount`
    - Remove `startPolling` and `stopPolling` from the returned object
    - _Requirements: (design — replace polling with push)_

- [ ] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- `PushDeliveryService` calls in controllers must always be fire-and-forget (never block the HTTP response)
- Property tests use `fast-check` with a minimum of 100 iterations each
- Each property test must include the comment tag `// Feature: push-notification-system, Property N: <property_text>`

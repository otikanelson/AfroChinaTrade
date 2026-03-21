# Implementation Plan: Admin Dashboard

## Overview

This implementation plan breaks down the Admin Dashboard feature into discrete coding tasks across six functional domains: Product Management, Order Management, Customer Communication, Financial Operations, Content Moderation, and User Management. The implementation uses React Native, TypeScript, Expo Router, and AsyncStorage to create a mobile-first admin interface with offline capabilities and native integrations.

Each task builds incrementally on previous work, with property-based tests placed close to implementation to catch errors early. All tasks reference specific requirements for traceability.

## Tasks

- [ ] 1. Set up shared infrastructure and core components
  - [ ] 1.1 Create shared layout components (ScreenContainer, Header, BottomSheet)
    - Implement ScreenContainer with SafeAreaView, loading states, and pull-to-refresh
    - Implement Header with back navigation, title, and optional right action
    - Implement BottomSheet with slide-up animation and gesture handling
    - _Requirements: Mobile UX patterns across all domains_

  - [ ] 1.2 Create shared form components (FormField, ImagePicker, DatePicker)
    - Implement FormField with validation, error display, and keyboard handling
    - Implement ImagePicker with expo-image-picker integration for camera and photo library
    - Implement DatePicker with mobile-friendly date selection
    - _Requirements: 1.2, 1.9, 6.5_

  - [ ] 1.3 Create shared data display components (Badge, Card, StatCard)
    - Implement Badge component with color-coded status indicators
    - Implement Card component for consistent content containers
    - Implement StatCard for displaying financial and order statistics
    - _Requirements: 2.1, 2.9, 4.1, 6.9_

  - [ ] 1.4 Set up AsyncStorage cache service and offline queue
    - Create storage.ts wrapper for AsyncStorage with type-safe operations
    - Implement offlineQueue.ts for queuing actions when offline
    - Add network connectivity monitoring with NetInfo
    - _Requirements: 1.11, 1.12, 2.12, 3.11_

  - [ ]* 1.5 Write property test for offline data sync
    - **Property 16: Offline Data Sync**
    - **Validates: Requirements 1.12, 2.12, 3.11**

  - [ ] 1.6 Set up push notifications service
    - Configure expo-notifications for iOS and Android
    - Implement pushNotifications.ts service for registration and handling
    - Set up deep linking for notification navigation
    - _Requirements: 2.11, 3.6, 5.11_

  - [ ]* 1.7 Write property test for push notification delivery
    - **Property 17: Push Notification Delivery**
    - **Validates: Requirements 2.11, 3.6, 5.11**


- [ ] 2. Implement Product Management domain
  - [ ] 2.1 Create product data models and API service
    - Define Product TypeScript interface in types/product.ts
    - Implement products.ts API service with CRUD operations
    - Add product caching logic in cache service
    - _Requirements: 1.1, 1.11_

  - [ ] 2.2 Create ProductListItem component
    - Implement list item with image, name, price, stock, and status badges
    - Add touch feedback with Pressable
    - Implement swipe actions for quick edit/delete
    - _Requirements: 1.1_

  - [ ]* 2.3 Write property test for product list consistency
    - **Property 1: Product List Consistency**
    - **Validates: Requirements 1.1, 1.8**

  - [ ] 2.4 Implement products list screen (app/(admin)/(tabs)/products.tsx)
    - Create FlatList with ProductListItem components
    - Add search bar with filtering by name, category, status
    - Implement pull-to-refresh functionality
    - Add "Add Product" button navigation
    - _Requirements: 1.1, 1.8_

  - [ ]* 2.5 Write property test for touch target sizing
    - **Property 18: Touch Target Sizing**
    - **Validates: Mobile UX best practices**

  - [ ]* 2.6 Write property test for FlatList virtualization performance
    - **Property 19: FlatList Virtualization**
    - **Validates: Performance requirements**

  - [ ] 2.7 Implement add product screen (app/(admin)/product/new.tsx)
    - Create form with FormField components for name, description, price
    - Add ImagePicker for product photos with camera and library access
    - Add category picker and toggle switches for featured/favorite/discounted
    - Implement conditional discount amount/percentage input
    - Add form validation and submission logic
    - _Requirements: 1.2, 1.6, 1.7, 1.9_

  - [ ]* 2.8 Write property test for product image upload
    - **Property 2: Product Image Upload**
    - **Validates: Requirements 1.9**

  - [ ]* 2.9 Write property test for image optimization
    - **Property 20: Image Optimization**
    - **Validates: Requirements 1.9, Performance requirements**

  - [ ] 2.10 Implement edit product screen (app/(admin)/product/[id].tsx)
    - Load existing product data from API
    - Populate form fields with current values
    - Implement update submission with optimistic UI updates
    - Add delete product functionality with confirmation dialog
    - _Requirements: 1.4, 1.10_

  - [ ]* 2.11 Write property test for product update persistence
    - **Property 3: Product Update Persistence**
    - **Validates: Requirements 1.10**

  - [ ] 2.12 Implement category management
    - Create category picker component with create/edit options
    - Add category management modal with list and form
    - Implement category CRUD operations in API service
    - _Requirements: 1.5_

  - [ ]* 2.13 Write property test for offline product caching
    - **Property 4: Offline Product Caching**
    - **Validates: Requirements 1.11**

  - [ ] 2.14 Implement product search and filtering
    - Add search bar component with debounced input
    - Implement filter bottom sheet with category, status, and price range
    - Add filter chips to show active filters
    - Update FlatList based on search and filter criteria
    - _Requirements: 1.8_


- [ ] 3. Checkpoint - Ensure product management tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement Order Management domain
  - [ ] 4.1 Create order data models and API service
    - Define Order, OrderItem, and Address TypeScript interfaces in types/order.ts
    - Implement orders.ts API service with list, detail, and update operations
    - Add order caching logic in cache service
    - _Requirements: 2.1, 2.12_

  - [ ] 4.2 Create OrderCard component
    - Implement card with order number, customer name, date, total, and status badge
    - Add touch feedback for navigation to order details
    - Use color-coded status badges
    - _Requirements: 2.1_

  - [ ] 4.3 Implement orders list screen (app/(admin)/(tabs)/orders.tsx)
    - Create FlatList with OrderCard components
    - Add filter controls for order status (Pending, Accepted, In Fulfillment, Shipped, Delivered)
    - Implement pull-to-refresh functionality
    - Display order statistics (total orders, pending orders, revenue)
    - _Requirements: 2.1, 2.2, 2.9_

  - [ ] 4.4 Implement order search functionality
    - Add search bar component
    - Implement search by order number, customer name, and date range
    - Update FlatList based on search results
    - _Requirements: 2.10_

  - [ ]* 4.5 Write property test for order search accuracy
    - **Property 6: Order Search Accuracy**
    - **Validates: Requirements 2.10**

  - [ ] 4.6 Implement order details screen (app/(admin)/order/[id].tsx)
    - Load and display order details including items, quantities, prices
    - Show shipping address and customer contact information
    - Display current order status with timeline visualization
    - _Requirements: 2.3_

  - [ ] 4.7 Implement order acceptance functionality
    - Add "Accept Order" button for pending orders
    - Implement API call to update order status to "Accepted"
    - Trigger push notification to customer
    - Update UI with optimistic updates
    - _Requirements: 2.4, 2.5_

  - [ ]* 4.8 Write property test for order status transition
    - **Property 5: Order Status Transition**
    - **Validates: Requirements 2.4, 2.5, 2.11**

  - [ ] 4.9 Implement order fulfillment controls
    - Add checkboxes for marking items as packed
    - Implement "Mark as Shipped" button
    - Add tracking number input field
    - Update order status and save tracking information
    - _Requirements: 2.6, 2.7, 2.8_

  - [ ] 4.10 Set up push notifications for new orders
    - Register notification handler for new order events
    - Display notification with order number and customer name
    - Implement deep link to order details screen
    - _Requirements: 2.11_


- [ ] 5. Checkpoint - Ensure order management tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement Customer Communication domain
  - [ ] 6.1 Create message data models and API service
    - Define MessageThread and Message TypeScript interfaces in types/message.ts
    - Implement messages.ts API service with list, detail, send, and mark-read operations
    - Add message caching logic in cache service
    - _Requirements: 3.1, 3.11_

  - [ ] 6.2 Create MessageThreadItem component
    - Implement list item with customer name, avatar, last message preview
    - Add timestamp with relative formatting (e.g., "2m ago", "1h ago")
    - Display unread badge indicator
    - Add swipe-to-mark-as-read gesture
    - _Requirements: 3.2, 3.9_

  - [ ]* 6.3 Write property test for message thread ordering
    - **Property 7: Message Thread Ordering**
    - **Validates: Requirements 3.1, 3.2**

  - [ ] 6.4 Implement messages list screen (app/(admin)/(tabs)/messages.tsx)
    - Create FlatList with MessageThreadItem components
    - Sort threads by last message timestamp (most recent first)
    - Add filter controls for "Unread Messages" and "All Messages"
    - Implement pull-to-refresh functionality
    - _Requirements: 3.1, 3.2, 3.7_

  - [ ] 6.5 Implement message search functionality
    - Add search bar component
    - Implement search by customer name and message content
    - Update FlatList based on search results
    - _Requirements: 3.10_

  - [ ] 6.6 Implement message thread screen (app/(admin)/message/[threadId].tsx)
    - Load and display conversation history with customer
    - Show messages with sender type (customer/seller) styling
    - Display timestamps for each message
    - Implement auto-scroll to latest message
    - _Requirements: 3.3_

  - [ ] 6.7 Implement message composition and sending
    - Add text input field at bottom of screen with send button
    - Implement send message API call
    - Use optimistic UI updates to show message immediately
    - Handle send failures with retry option
    - _Requirements: 3.4, 3.5_

  - [ ]* 6.8 Write property test for message delivery
    - **Property 8: Message Delivery**
    - **Validates: Requirements 3.5**

  - [ ] 6.9 Implement real-time message updates
    - Set up WebSocket connection or polling for new messages
    - Update conversation view when new messages arrive
    - Update message thread list with new last message
    - Increment unread count for threads not currently open
    - _Requirements: 3.12_

  - [ ]* 6.10 Write property test for real-time message updates
    - **Property 9: Real-time Message Updates**
    - **Validates: Requirements 3.6, 3.12**

  - [ ] 6.11 Set up push notifications for new messages
    - Register notification handler for new message events
    - Display notification with customer name and message preview
    - Implement deep link to message thread screen
    - Update unread badge on messages tab
    - _Requirements: 3.6_

  - [ ] 6.12 Implement message thread creation
    - Handle new conversation initiated by customer
    - Create new MessageThread in local cache
    - Display notification to seller
    - Add new thread to messages list
    - _Requirements: 3.8_


- [ ] 7. Checkpoint - Ensure customer communication tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement Financial Operations domain
  - [ ] 8.1 Create financial data models and API service
    - Define RefundRequest, Transaction, and FinancialSummary TypeScript interfaces in types/finance.ts
    - Implement finance.ts API service with refund, transaction, and summary operations
    - Add financial data caching logic in cache service
    - _Requirements: 4.1, 4.11_

  - [ ] 8.2 Implement financial overview screen (app/(admin)/(tabs)/finance.tsx)
    - Display StatCard components for total revenue, pending payments, refunded amounts
    - Add time period selector (day, week, month, year)
    - Implement pull-to-refresh functionality
    - Display financial charts using mobile-optimized chart library
    - _Requirements: 4.1_

  - [ ] 8.3 Implement refund processing in order details screen
    - Add "Process Refund" button for completed orders
    - Create refund bottom sheet with full/partial refund options
    - Add numeric input for partial refund amount
    - Add text area for refund reason
    - _Requirements: 4.2, 4.3, 4.4_

  - [ ]* 8.4 Write property test for refund amount validation
    - **Property 10: Refund Amount Validation**
    - **Validates: Requirements 4.4**

  - [ ] 8.5 Implement refund submission and confirmation
    - Validate refund amount (must be ≤ order total)
    - Submit refund request to API with loading indicator
    - Update order status and payment status
    - Display confirmation toast to seller
    - Trigger push notification to customer
    - _Requirements: 4.5, 4.10_

  - [ ] 8.6 Implement refund history screen
    - Create FlatList displaying refund history
    - Show order number, refund amount, date, and reason
    - Add search and filter functionality
    - Implement pull-to-refresh
    - _Requirements: 4.6_

  - [ ] 8.7 Implement payment status display
    - Add color-coded payment status badges to order cards
    - Display payment status in order details (Pending, Completed, Failed, Refunded)
    - Show transaction details including payment method, transaction ID, processing fees
    - _Requirements: 4.7, 4.9_

  - [ ] 8.8 Implement financial report export
    - Add export button to financial overview screen
    - Generate CSV or PDF report for selected time period
    - Use expo-sharing for native share functionality
    - Allow seller to save or share the report
    - _Requirements: 4.8_

  - [ ]* 8.9 Write property test for financial report export
    - **Property 11: Financial Report Export**
    - **Validates: Requirements 4.8**


- [ ] 9. Checkpoint - Ensure financial operations tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement Content Moderation domain
  - [ ] 10.1 Create moderation data models and API service
    - Define Report, Review, and SupportTicket TypeScript interfaces in types/moderation.ts
    - Implement moderation.ts API service with list, detail, and action operations
    - Add moderation data caching logic in cache service
    - _Requirements: 5.1, 5.12_

  - [ ] 10.2 Implement moderation dashboard screen (app/(admin)/moderation/index.tsx)
    - Create tab or segmented control navigation for Reports, Reviews, Tickets
    - Display summary statistics for each category
    - Add navigation to detail screens
    - _Requirements: 5.1_

  - [ ] 10.3 Implement customer reports screen (app/(admin)/moderation/reports.tsx)
    - Create FlatList displaying customer reports
    - Show report type, reported content preview, reporter name, submission date
    - Add status badge indicators (Pending, Resolved, Dismissed)
    - Implement pull-to-refresh functionality
    - _Requirements: 5.2_

  - [ ] 10.4 Implement report details screen
    - Display complete report details including description and evidence
    - Show reported content with context
    - Add action buttons: "Resolve Report", "Take Action", "Dismiss Report"
    - _Requirements: 5.3, 5.4_

  - [ ] 10.5 Implement report resolution functionality
    - Handle "Resolve Report" action with API call
    - Update report status to "Resolved"
    - Trigger push notification to customer who submitted report
    - Display confirmation toast
    - _Requirements: 5.10_

  - [ ]* 10.6 Write property test for report status update
    - **Property 13: Report Status Update**
    - **Validates: Requirements 5.10, 5.11**

  - [ ] 10.7 Implement product reviews screen (app/(admin)/moderation/reviews.tsx)
    - Create FlatList displaying product reviews
    - Show customer name, star rating, review text, product name, submission date
    - Add flagged indicator for inappropriate reviews
    - Implement pull-to-refresh functionality
    - _Requirements: 5.5_

  - [ ] 10.8 Implement review filtering and search
    - Add filter controls for rating, product, and date
    - Implement search by customer name or review content
    - Update FlatList based on filters
    - _Requirements: 5.7_

  - [ ] 10.9 Implement review response functionality
    - Add text input field for seller response
    - Implement submit response API call
    - Display seller response in review details
    - Make response visible to customers viewing product
    - _Requirements: 5.6_

  - [ ]* 10.10 Write property test for review response visibility
    - **Property 12: Review Response Visibility**
    - **Validates: Requirements 5.6**

  - [ ] 10.11 Implement review flagging system
    - Add swipe actions or long-press menu for flagging reviews
    - Mark review as flagged for investigation
    - Update review status in API
    - Display flagged indicator in review list
    - _Requirements: 5.8_

  - [ ] 10.12 Implement support tickets screen (app/(admin)/moderation/tickets.tsx)
    - Create FlatList displaying support tickets
    - Show priority level badges and status indicators
    - Display customer name, subject, and submission date
    - Implement pull-to-refresh functionality
    - _Requirements: 5.9_

  - [ ] 10.13 Set up push notifications for moderation events
    - Register notification handlers for new reports and tickets
    - Display notifications with relevant details
    - Implement deep links to moderation screens
    - _Requirements: 5.11_


- [ ] 11. Checkpoint - Ensure content moderation tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement User Management domain
  - [ ] 12.1 Create user management data models and API service
    - Define UserAccount and AccountAction TypeScript interfaces in types/user.ts
    - Implement users.ts API service with list, detail, and action operations
    - Add user management data caching logic in cache service
    - _Requirements: 6.1, 6.11_

  - [ ] 12.2 Implement users list screen (app/(admin)/users/index.tsx)
    - Create FlatList displaying customer user accounts
    - Show name, email, registration date, and account status badges
    - Add color-coded status indicators (Active, Suspended, Blocked)
    - Implement pull-to-refresh functionality
    - _Requirements: 6.1, 6.9_

  - [ ] 12.3 Implement user search functionality
    - Add search bar component
    - Implement search by name, email, and account status
    - Update FlatList based on search results
    - _Requirements: 6.2_

  - [ ] 12.4 Implement user details screen (app/(admin)/users/[id].tsx)
    - Display customer details including order history and total spending
    - Show account activity and last activity timestamp
    - Display current account status
    - _Requirements: 6.3_

  - [ ] 12.5 Implement account suspension functionality
    - Add "Suspend Account" button with touch-optimized sizing
    - Create suspension bottom sheet with reason input and duration picker
    - Implement API call to suspend account
    - Prevent customer from placing new orders
    - Send push notification to customer with suspension reason
    - _Requirements: 6.4, 6.5, 6.6_

  - [ ]* 12.6 Write property test for account suspension duration
    - **Property 14: Account Suspension Duration**
    - **Validates: Requirements 6.5, 6.6**

  - [ ] 12.7 Implement account blocking functionality
    - Add "Block Account" button
    - Display confirmation dialog explaining blocking is permanent
    - Implement API call to block account
    - Permanently disable account and prevent future access
    - _Requirements: 6.7, 6.8_

  - [ ] 12.8 Implement account reactivation functionality
    - Add "Reactivate Account" button for suspended/blocked accounts
    - Implement API call to reactivate account
    - Update account status to "Active"
    - Display confirmation toast
    - _Requirements: 6.4_

  - [ ] 12.9 Implement audit log display
    - Create audit log screen showing all account actions
    - Display action type, timestamp, reason, and performer
    - Implement filtering by action type and date range
    - Use mobile-optimized list layout
    - _Requirements: 6.10_

  - [ ]* 12.10 Write property test for account action audit trail
    - **Property 15: Account Action Audit Trail**
    - **Validates: Requirements 6.10**


- [ ] 13. Checkpoint - Ensure user management tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Implement admin navigation and routing
  - [ ] 14.1 Create admin layout with auth guard (app/(admin)/_layout.tsx)
    - Implement authentication check for admin role
    - Redirect non-admin users to customer app
    - Set up stack navigator for admin screens
    - _Requirements: Security and access control_

  - [ ] 14.2 Create admin bottom tab navigator (app/(admin)/(tabs)/_layout.tsx)
    - Configure 4 primary tabs: Products, Orders, Messages, Finance
    - Add tab icons using Expo Vector Icons
    - Implement badge indicators for unread messages and pending orders
    - Add active tab highlighting with theme colors
    - _Requirements: Navigation across all domains_

  - [ ] 14.3 Implement deep linking for push notifications
    - Configure deep link URL scheme in app.json
    - Map notification types to screen routes
    - Handle navigation from notification tap
    - Test deep links for all notification types
    - _Requirements: 2.11, 3.6, 5.11_

  - [ ] 14.4 Implement navigation between screens
    - Set up navigation from list screens to detail screens
    - Implement back navigation with proper state management
    - Add navigation from moderation dashboard to detail screens
    - Test navigation flows across all domains
    - _Requirements: Navigation patterns across all domains_

- [ ] 15. Implement offline functionality and sync
  - [ ] 15.1 Implement data caching for all domains
    - Cache product data in AsyncStorage
    - Cache order data in AsyncStorage
    - Cache message data in AsyncStorage
    - Cache financial data in AsyncStorage
    - Cache moderation data in AsyncStorage
    - Cache user management data in AsyncStorage
    - _Requirements: 1.11, 2.12, 3.11, 4.11, 5.12, 6.11_

  - [ ] 15.2 Implement offline action queuing
    - Queue product updates when offline
    - Queue order status changes when offline
    - Queue message sends when offline
    - Queue refund requests when offline
    - Queue moderation actions when offline
    - Queue user management actions when offline
    - _Requirements: 1.12, 2.12, 3.11_

  - [ ] 15.3 Implement sync on reconnection
    - Detect network connectivity restoration
    - Process queued actions in order
    - Update local cache with server responses
    - Handle sync conflicts and errors
    - Display sync status to user
    - _Requirements: 1.12_

  - [ ] 15.4 Implement offline UI indicators
    - Display offline banner when network unavailable
    - Show staleness indicators for cached data
    - Display sync status during reconnection
    - Show queued action count
    - _Requirements: Offline UX patterns_


- [ ] 16. Implement error handling and validation
  - [ ] 16.1 Implement network error handling
    - Add retry logic with exponential backoff for failed requests
    - Display user-friendly error messages
    - Provide manual retry option
    - Log errors for debugging
    - _Requirements: Error handling across all domains_

  - [ ] 16.2 Implement form validation
    - Validate product form inputs before submission
    - Validate refund amount inputs
    - Validate message inputs
    - Display inline error messages
    - Prevent submission until valid
    - _Requirements: 1.2, 4.4, 3.4_

  - [ ] 16.3 Implement permission handling
    - Request camera permissions before access
    - Request photo library permissions
    - Request notification permissions
    - Handle permission denial gracefully
    - Show instructions to enable permissions in settings
    - _Requirements: 1.9, 2.11, 3.6_

  - [ ] 16.4 Implement data error handling
    - Handle null/undefined values safely
    - Display empty states with helpful messages
    - Detect and clear corrupted cache data
    - Refetch from backend on cache errors
    - _Requirements: Error handling across all domains_

- [ ] 17. Implement performance optimizations
  - [ ] 17.1 Optimize FlatList rendering
    - Implement proper keyExtractor for all FlatLists
    - Add getItemLayout for fixed-height items
    - Use windowSize and maxToRenderPerBatch optimizations
    - Implement shouldComponentUpdate for list items
    - _Requirements: Performance requirements_

  - [ ] 17.2 Optimize image loading and caching
    - Implement image compression before upload
    - Use expo-image for optimized image rendering
    - Configure image caching strategy
    - Add placeholder images during loading
    - _Requirements: 1.9, Performance requirements_

  - [ ] 17.3 Implement optimistic UI updates
    - Add optimistic updates for product changes
    - Add optimistic updates for order status changes
    - Add optimistic updates for message sends
    - Rollback on API failure
    - _Requirements: UX performance across all domains_

  - [ ] 17.4 Optimize bundle size and load time
    - Implement code splitting for admin routes
    - Lazy load heavy components
    - Optimize dependencies and imports
    - Measure and monitor bundle size
    - _Requirements: Performance requirements_


- [ ] 18. Checkpoint - Ensure all integration tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 19. Final integration and polish
  - [ ] 19.1 Implement consistent theming and styling
    - Create theme configuration with colors, spacing, typography
    - Apply theme consistently across all screens
    - Ensure color contrast meets accessibility standards
    - Test dark mode support if applicable
    - _Requirements: UX consistency across all domains_

  - [ ] 19.2 Implement loading states and skeletons
    - Add loading indicators for API requests
    - Implement skeleton screens for list views
    - Add pull-to-refresh loading states
    - Show progress indicators for long operations
    - _Requirements: UX patterns across all domains_

  - [ ] 19.3 Implement toast notifications and feedback
    - Add success toast for completed actions
    - Add error toast for failed operations
    - Implement confirmation dialogs for destructive actions
    - Add haptic feedback for important interactions
    - _Requirements: User feedback across all domains_

  - [ ] 19.4 Implement accessibility features
    - Add accessibility labels to all interactive elements
    - Ensure proper focus management
    - Test with screen readers (iOS VoiceOver, Android TalkBack)
    - Verify keyboard navigation support
    - _Requirements: Accessibility requirements_

  - [ ] 19.5 Test on multiple devices and screen sizes
    - Test on iOS devices (iPhone SE, iPhone 14, iPhone 14 Pro Max)
    - Test on Android devices (various screen sizes)
    - Verify layouts adapt to different screen sizes
    - Test landscape orientation support
    - _Requirements: Mobile compatibility_

  - [ ] 19.6 Implement analytics and monitoring
    - Set up error tracking with Sentry or similar
    - Add analytics events for key user actions
    - Monitor performance metrics (FPS, load times)
    - Track feature usage across domains
    - _Requirements: Monitoring and analytics_

- [ ] 20. Final checkpoint - Complete end-to-end testing
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout implementation
- Property tests validate universal correctness properties from the design document
- All code should be written in TypeScript with full type safety
- The implementation builds on the existing mobile app structure in the mobile/ folder
- Offline functionality is critical for mobile admin experience
- Push notifications enable real-time seller engagement
- Native capabilities (camera, sharing) enhance mobile-first UX

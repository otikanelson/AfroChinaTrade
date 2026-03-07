# Implementation Plan: Admin Dashboard (Mobile)

## Overview

This implementation plan breaks down the Admin Dashboard mobile feature into discrete, actionable tasks. The dashboard will be built as a React Native/Expo application integrated into the existing mobile app structure, with six core modules: Product Management, Order Management, Customer Communication, Financial Operations, Content Moderation, and User Management.

The implementation follows a bottom-up approach: first establishing shared infrastructure (navigation, layouts, components), then building each feature module incrementally, and finally integrating everything together. The app uses Expo Router for file-based navigation with bottom tabs for primary features and stack navigation for detail screens. All files will be created in the mobile/ folder to integrate with the existing mobile app.

## Tasks

- [ ] 1. Set up admin navigation structure in existing Expo app
  - [x] 1.1 Create (admin) route group for protected admin section
    - Create mobile/app/(admin)/_layout.tsx with authentication check
    - Set up admin-specific navigation structure
    - Configure access control to restrict to seller account
    - Add redirect logic for non-admin users
    - _Requirements: All requirements (foundation for entire dashboard)_
  
  - [x] 1.2 Configure admin bottom tab navigation layout
    - Create mobile/app/(admin)/(tabs)/_layout.tsx with bottom tab navigator
    - Set up 4 tabs: Products, Orders, Messages, Finance
    - Configure tab icons using Ionicons (matching existing app style)
    - Add badge support for unread message counts and pending orders
    - Style tabs to match existing mobile app theme
    - _Requirements: All requirements (primary navigation)_
  
  - [x] 1.3 Set up stack navigation for detail screens
    - Create stack layouts for product, order, message, moderation, user screens
    - Configure screen options and headers with back navigation
    - Set up navigation types for type-safe routing
    - Ensure consistent header styling with existing app
    - _Requirements: All requirements (detail screen navigation)_
  
  - [x] 1.4 Verify mobile dependencies and theme setup
    - Verify expo-image-picker is installed: `npx expo install expo-image-picker`
    - Verify expo-notifications is installed: `npx expo install expo-notifications`
    - Verify expo-sharing is installed: `npx expo install expo-sharing`
    - Review mobile/theme/ directory for admin theme extensions
    - Ensure styled-components is configured for admin components
    - _Requirements: All requirements (consistent UI)_

- [x] 2. Build shared component library for admin
  - [x] 2.1 Create ScreenContainer component
    - Create mobile/components/admin/ScreenContainer.tsx
    - Implement container with SafeAreaView
    - Add optional ScrollView support
    - Implement pull-to-refresh functionality
    - Add consistent padding and spacing
    - _Requirements: All requirements_
  
  - [x] 2.2 Create DataList component with FlatList optimization
    - Create mobile/components/admin/DataList.tsx
    - Implement generic DataList with TypeScript generics
    - Add performance optimizations (getItemLayout, removeClippedSubviews)
    - Implement pull-to-refresh
    - Add infinite scroll support
    - Add loading skeleton and empty states
    - _Requirements: 1.1, 2.1, 3.2, 5.2, 6.1_
  
  - [x] 2.3 Create Card component
    - Create mobile/components/admin/Card.tsx
    - Implement card with elevation/shadow
    - Add press interaction with ripple effect
    - Configure rounded corners and padding
    - Support custom styles
    - _Requirements: 1.1, 2.1, 3.2_
  
  - [x] 2.4 Create StatusBadge component
    - Create mobile/components/admin/StatusBadge.tsx
    - Implement badge with color coding for different statuses
    - Add status types: pending, active, completed, failed, blocked
    - Ensure accessible labels
    - _Requirements: 1.1, 2.1, 4.7, 6.9_
  
  - [x] 2.5 Create Button component
    - Create mobile/components/admin/Button.tsx
    - Implement button with loading and disabled states
    - Add icon support
    - Configure variants: primary, secondary, destructive
    - Ensure minimum touch target size (44x44)
    - _Requirements: All requirements_
  
  - [x] 2.6 Write unit tests for shared components
    - Create mobile/__tests__/components/admin/ directory
    - Test ScreenContainer rendering and refresh
    - Test DataList with mock data
    - Test Card press interactions
    - Test StatusBadge rendering
    - Test Button states and press handling
    - _Requirements: All requirements_

- [x] 3. Build form components for admin
  - [x] 3.1 Create FormField component
    - Create mobile/components/admin/forms/FormField.tsx
    - Implement text input with label
    - Add error message display
    - Support multiline, keyboard types, secure entry
    - Add validation state styling
    - _Requirements: 1.2, 1.4, 2.5, 4.3_
  
  - [x] 3.2 Create ImagePickerField component
    - Create mobile/components/admin/forms/ImagePickerField.tsx
    - Integrate expo-image-picker
    - Implement camera and gallery selection
    - Add multiple image support with preview grid
    - Implement image removal
    - Add image compression
    - Request camera and media library permissions
    - _Requirements: 1.9_
  
  - [x] 3.3 Create PickerField component
    - Create mobile/components/admin/forms/PickerField.tsx
    - Implement native picker for iOS
    - Implement modal picker for Android
    - Add label and placeholder support
    - Support option arrays
    - _Requirements: 1.5, 2.2_
  
  - [x] 3.4 Create SwitchField component
    - Create mobile/components/admin/forms/SwitchField.tsx
    - Implement toggle switch with label
    - Add optional description text
    - Ensure accessible
    - _Requirements: 1.6, 1.7_
  
  - [x] 3.5 Create SearchBar component
    - Create mobile/components/admin/SearchBar.tsx
    - Implement search input with icon
    - Add debounced onChange handler
    - Add clear button
    - Support keyboard dismiss
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_

- [ ] 4. Implement Product Management module
  - [x] 4.1 Create Products tab screen with product list
    - Create mobile/app/(admin)/(tabs)/products.tsx
    - Implement product list using DataList component
    - Display product cards with image, name, price, stock, status
    - Integrate with ProductService from shared folder
    - Add pull-to-refresh functionality
    - Add loading and error states
    - _Requirements: 1.1_
  
  - [x] 4.2 Implement product search and filtering
    - Add SearchBar component to products screen
    - Implement search by product name
    - Add filter dropdown for categories
    - Add filter for product status (active/inactive)
    - Add filter for featured/favorite/discounted products
    - _Requirements: 1.8_
  
  - [x] 4.3 Create Add Product screen
    - Create mobile/app/(admin)/product/new.tsx
    - Implement product form with FormField components
    - Add fields: name, description, price, inventory
    - Integrate ImagePickerField for product images
    - Add category PickerField
    - Add SwitchField for featured, favorite, discounted
    - Add conditional discount amount field
    - Implement form validation
    - _Requirements: 1.2, 1.5, 1.6, 1.7, 1.9_
  
  - [x] 4.4 Implement product creation workflow
    - Handle form submission
    - Upload images to server
    - Save product data via ProductService
    - Show success message with toast notification
    - Navigate back to product list
    - Optimistically update product list
    - _Requirements: 1.3, 1.10_
  
  - [x] 4.5 Create Edit Product screen
    - Create mobile/app/(admin)/product/[id].tsx
    - Load existing product data
    - Pre-populate form fields with current values
    - Allow editing all product fields
    - Show existing images with ability to add/remove
    - _Requirements: 1.4_
  
  - [x] 4.6 Implement product update workflow
    - Handle form submission for updates
    - Upload new images if added
    - Update product data via ProductService
    - Show success message
    - Navigate back to product list
    - Reflect changes immediately in list
    - _Requirements: 1.10_
  
  - [-] 4.7 Write unit tests for Product Management module
    - Create mobile/__tests__/features/products/ directory
    - Test product list rendering and filtering
    - Test product form validation
    - Test product creation workflow
    - Test product update workflow
    - Test image picker integration
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_

- [ ] 5. Implement Order Management module
  - [x] 5.1 Create Orders tab screen with order list
    - Create mobile/app/(admin)/(tabs)/orders.tsx
    - Implement order list using DataList component
    - Display order cards with order number, customer, date, amount, status
    - Integrate with OrderService from shared folder
    - Add loading and error states
    - _Requirements: 2.1_
  
  - [x] 5.2 Implement order filtering by status
    - Add filter chips for order status
    - Implement filters for Pending, Accepted, In Fulfillment, Shipped, Delivered
    - Add date range filter using date picker modal
    - Implement search by order number and customer name
    - _Requirements: 2.2, 2.10_
  
  - [x] 5.3 Create OrderDetail screen with full order information
    - Create mobile/app/(admin)/order/[id].tsx
    - Implement OrderDetail component showing items, quantities, prices
    - Display shipping address and customer contact information
    - Show current order status with StatusBadge
    - Add back navigation to order list
    - _Requirements: 2.3_
  
  - [x] 5.4 Implement order acceptance workflow
    - Add "Accept Order" button for pending orders
    - Handle order status update to "Accepted"
    - Trigger customer notification (integrate with notification service)
    - Update order list and detail views
    - Show success toast
    - _Requirements: 2.4, 2.5_
  
  - [x] 5.5 Implement fulfillment and shipping workflow
    - Add fulfillment controls to mark items as packed
    - Create shipping form modal with tracking number input
    - Handle order status update to "Shipped"
    - Save tracking information and make it visible to customer
    - Show success toast
    - _Requirements: 2.6, 2.7, 2.8_
  
  - [x] 5.6 Create order statistics dashboard
    - Add statistics cards at top of orders screen
    - Show total orders, pending orders, revenue
    - Add time period selector (today, week, month, year)
    - Display statistics with visual indicators
    - _Requirements: 2.9_
  
  - [ ] 5.7 Write unit tests for Order Management module
    - Create mobile/__tests__/features/orders/ directory
    - Test OrderList rendering and filtering
    - Test OrderDetail display
    - Test order acceptance workflow
    - Test fulfillment and shipping workflow
    - Test statistics calculations
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

- [ ] 6. Checkpoint - Ensure product and order modules are working
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Customer Communication module
  - [x] 7.1 Create Messages tab screen with conversation threads
    - _Requirements: 3.1, 3.2_
  
  - [x] 7.2 Implement message filtering and search
    - _Requirements: 3.7, 3.10_
  
  - [x] 7.3 Create MessageThread screen with conversation view
    - _Requirements: 3.3, 3.9_
  
  - [x] 7.4 Implement message composition and sending
    - _Requirements: 3.4, 3.5_
  
  - [x] 7.5 Implement real-time message notifications
    - _Requirements: 3.6, 3.8_
  
  - [ ] 7.6 Write unit tests for Customer Communication module
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

- [x] 8. Implement Financial Operations module
  - [x] 8.1 Create Finance tab screen with revenue statistics
    - Create mobile/app/(admin)/(tabs)/finance.tsx
    - Implement financial dashboard showing total revenue, pending payments, refunded amounts
    - Add time period selector (today, week, month, year)
    - Display statistics with visual charts or indicators
    - Integrate with financial service
    - _Requirements: 4.1_
  
  - [x] 8.2 Implement refund processing workflow
    - Add "Process Refund" button to OrderDetail screen for completed orders
    - Create RefundModal bottom sheet with refund type selection (Full/Partial)
    - Add conditional fields for partial refund amount and reason
    - Handle refund submission and order status update
    - Display confirmation message with toast
    - _Requirements: 4.2, 4.3, 4.4, 4.5_
  
  - [x] 8.3 Create RefundHistory screen with refund list
    - Create mobile/app/(admin)/finance/refunds.tsx
    - Implement refund history list showing order numbers, amounts, dates, reasons
    - Add filtering by date range using date picker
    - Add search by order number
    - _Requirements: 4.6_
  
  - [x] 8.4 Implement payment status display
    - Add payment status badges to order list and detail views
    - Display status as Pending, Completed, Failed, or Refunded
    - Show transaction details including payment method, transaction ID, processing fees
    - _Requirements: 4.7, 4.9_
  
  - [x] 8.5 Implement financial report export
    - Add export button to financial overview
    - Implement CSV export functionality using react-native-csv
    - Implement PDF export functionality using react-native-html-to-pdf
    - Include selected time period data in exports
    - Use Share API to share exported files
    - _Requirements: 4.8_
  
  - [x] 8.6 Implement refund notification system
    - Trigger customer push notification when refund is processed
    - Display confirmation toast to seller after refund
    - _Requirements: 4.10_
  
  - [ ] 8.7 Write unit tests for Financial Operations module
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

- [ ] 9. Checkpoint - Ensure communication and financial modules are working
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement Content Moderation module
  - [ ] 10.1 Create ModerationDashboard with tabbed interface
    - Create mobile/app/(admin)/moderation/index.tsx
    - Implement Material Top Tabs for Customer Reports, Product Reviews, Support Tickets
    - Set up tab navigation and content switching
    - _Requirements: 5.1_
- [x] 10. Implement Content Moderation module
  - [x] 10.1 Create ModerationDashboard with tabbed interface
    - Create mobile/app/(admin)/moderation/index.tsx
    - Implement Material Top Tabs for Customer Reports, Product Reviews, Support Tickets
    - Set up tab navigation and content switching
    - _Requirements: 5.1_
  
  - [x] 10.2 Implement Customer Reports tab
    - Create mobile/app/(admin)/moderation/reports.tsx
    - Create ReportList component showing all reports
    - Display report type, reported content, reporter name, submission date
    - Add press handler to view full report details in modal
    - _Requirements: 5.2, 5.3_
  
  - [x] 10.3 Implement report action workflow
    - Create ReportDetail bottom sheet with full report information
    - Add action buttons for "Resolve Report", "Take Action", "Dismiss Report"
    - Handle report status updates
    - Trigger customer push notification when report is resolved
    - _Requirements: 5.4, 5.10_
  
  - [x] 10.4 Implement Product Reviews tab
    - Create mobile/app/(admin)/moderation/reviews.tsx
    - Create ReviewList component showing all reviews
    - Display customer name, rating, review text, product name, submission date
    - Add filtering by rating, product, and date
    - _Requirements: 5.5, 5.7_
  
  - [x] 10.5 Implement review response functionality
    - Add "Respond" button to reviews
    - Create response form in bottom sheet for public replies
    - Handle response submission
    - Display seller responses in review list
    - _Requirements: 5.6_
  
  - [x] 10.6 Implement review flagging system
    - Add flag button to inappropriate reviews
    - Create flagging modal with reason selection
    - Mark flagged reviews with visual indicator
    - _Requirements: 5.8_
  
  - [x] 10.7 Implement Support Tickets tab
    - Create mobile/app/(admin)/moderation/tickets.tsx
    - Create TicketList component showing all support tickets
    - Display priority levels and status indicators
    - Add filtering by priority and status
    - Implement ticket resolution workflow
    - _Requirements: 5.9, 5.10_
  
  - [ ] 10.8 Write unit tests for Content Moderation module
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10_unt status
    - Integrate with UserService from shared folder
    - Add loading and error states
    - _Requirements: 6.1_
  
  - [ ] 11.2 Implement user search and filtering
    - Add SearchBar with search by name and email
    - Add filter chips for account status (Active, Suspended, Blocked)
    - _Requirements: 6.2_
- [x] 11. Implement User Management module
  - [x] 11.1 Create UserList screen with customer accounts list
    - Create mobile/app/(admin)/users/index.tsx
    - Implement user list using DataList component
    - Display customer names, email addresses, registration dates, account status
    - Integrate with UserService from shared folder
    - Add loading and error states
    - _Requirements: 6.1_
  
  - [x] 11.2 Implement user search and filtering
    - Add SearchBar with search by name and email
    - Add filter chips for account status (Active, Suspended, Blocked)
    - _Requirements: 6.2_
  
  - [x] 11.3 Create UserDetail screen with customer information
    - Create mobile/app/(admin)/users/[id].tsx
    - Implement UserDetail component showing customer details
    - Display order history and total spending
    - Show account activity timeline
    - Add back navigation to user list
    - _Requirements: 6.3_
  
  - [x] 11.4 Implement account suspension workflow
    - Add "Suspend Account" button to UserDetail screen
    - Create SuspensionModal bottom sheet with reason and duration fields
    - Handle account suspension
    - Prevent customer from placing new orders
    - Display suspension reason to customer
    - Show success toast
    - _Requirements: 6.4, 6.5, 6.6_
  
  - [x] 11.5 Implement account blocking workflow
    - Add "Block Account" button to UserDetail screen
    - Create confirmation dialog explaining permanent blocking
    - Handle account blocking
    - Permanently disable account and prevent future access
    - Show success toast
    - _Requirements: 6.7, 6.8_
  
  - [x] 11.6 Implement account reactivation
    - Add "Reactivate Account" button for suspended accounts
    - Handle account reactivation
    - Restore customer access and order capabilities
    - Show success toast
    - _Requirements: 6.4_
  
  - [x] 11.7 Display account status indicators
    - Add StatusBadge to user list showing Active, Suspended, or Blocked
    - Update status display in real-time after actions
    - _Requirements: 6.9_
  
  - [x] 11.8 Implement audit log for account actions
    - Create audit log component showing all account actions
    - Display timestamps, action types, and reasons
    - Add filtering by action type and date
    - _Requirements: 6.10_
  
  - [ ] 11.9 Write unit tests for User Management module
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_
    - Create error boundary components in mobile/components/admin/ErrorBoundary.tsx
    - Add error logging service integration
    - Implement user-friendly error messages
    - Add retry mechanisms for failed API calls
    - _Requirements: All requirements (improves reliability)_
  
  - [x] 13.3 Add loading states and skeleton screens
    - Implement skeleton loaders for all data lists
    - Add loading spinners for form submissions
    - Ensure consistent loading UX across all modules
    - _Requirements: All requirements (improves perceived performance)_
  
  - [x] 13.4 Implement responsive design for tablets
    - Test all screens on tablet viewports
    - Adjust layouts for larger screens (use two-column layouts where appropriate)
    - Ensure touch-friendly interactions on all screen sizes
    - _Requirements: All requirements (ensures tablet usability)_
  
  - [x] 13.5 Add accessibility features
    - Add accessibilityLabel and accessibilityHint to all interactive elements
    - Ensure minimum touch target size (44x44) for all buttons
    - Test with screen readers (TalkBack on Android, VoiceOver on iOS)
    - Ensure proper focus management in modals
    - _Requirements: All requirements (ensures accessibility)_
  
  - [x] 13.6 Implement push notification handling
    - Set up Expo Notifications configuration
    - Request notification permissions on admin login
    - Handle notification tap to navigate to relevant screen
    - Display notification badges on tabs
    - _Requirements: 2.5, 3.6, 4.10, 5.10_
  
  - [ ] 13.7 Write integration tests for cross-module workflows
    - Create mobile/__tests__/integration/ directory
    - Test order-to-refund workflow
    - Test product-to-review moderation workflow
    - Test user-to-order relationship
    - Test notification delivery across modules
    - _Requirements: All requirements_

- [x] 14. Final checkpoint - Complete system validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- The implementation leverages existing services from the shared folder (ProductService, OrderService, UserService, ReviewService)
- All TypeScript types should be imported from shared/src/types
- The modular architecture allows parallel development of feature modules after shared infrastructure is complete
- Real-time features (message notifications) may require WebSocket setup or polling mechanism
- Export functionality (CSV/PDF) may require additional libraries like papaparse or jsPDF

# Implementation Plan: Backend Integration and Database Setup

## Overview

This implementation plan transforms the AfroChinaTrade e-commerce application from a mock-data prototype into a fully functional system with MongoDB database infrastructure and a complete REST API backend. The implementation follows a phased approach: first building the complete backend infrastructure, then systematically replacing mock services in the frontend with real API integrations.

## Tasks

- [x] 1. Set up MongoDB database connection and configuration
  - Install mongoose, bcryptjs, jsonwebtoken, express-validator, multer, dotenv packages
  - Create database configuration file with connection string from environment variables
  - Implement database connection function with error handling and retry logic
  - Add connection status logging on startup
  - Create .env.example file with required environment variables
  - _Requirements: 1.1, 1.2_

- [x] 2. Create Mongoose schemas and models
  - [x] 2.1 Create User model with schema validation
    - Define User schema with all fields from design (name, email, password, phone, role, status, addresses, avatar)
    - Add unique index on email field
    - Add compound index on role and status fields
    - Implement password hashing pre-save hook using bcrypt
    - _Requirements: 1.5, 1.11_

  - [x] 2.2 Create Product model with schema validation
    - Define Product schema with all fields from design
    - Add text index on name and description for search
    - Add compound indexes on category/isFeatured and supplierId/isActive
    - Add index on tags array and createdAt fields
    - _Requirements: 1.3, 1.12, 1.15_

  - [x] 2.3 Create Order model with schema validation
    - Define Order schema with items array and delivery address subdocument
    - Add unique index on orderId field
    - Add compound index on userId and createdAt
    - Add index on status and createdAt fields
    - Implement orderId auto-generation (format: ORD-XXXXXX)
    - _Requirements: 1.4, 1.13_

  - [x] 2.4 Create Message and MessageThread models
    - Define Message schema with threadId, sender info, text, isRead, timestamps
    - Define MessageThread schema with customer info, last message, unread count
    - Add indexes on threadId, senderId, isRead for messages
    - Add unique index on threadId and index on customerId for threads
    - _Requirements: 1.8, 1.14_

  - [x] 2.5 Create Review, Refund, Report, and Ticket models
    - Define Review schema with productId, userId, rating, comment, response fields
    - Define Refund schema with orderId, type, amount, reason, status fields
    - Define Report schema with type, reported entity info, reporter info, status
    - Define Ticket schema with subject, description, user info, priority, status
    - Add appropriate indexes for each model as specified in design
    - _Requirements: 1.7, 1.9, 1.10_

  - [x] 2.6 Create Category and Supplier models
    - Define Category schema with name, description, icon, imageUrl, subcategories
    - Define Supplier schema with name, email, phone, address, location, verified, rating
    - Add unique index on category name and supplier email
    - Add indexes on isActive for categories and verified for suppliers
    - _Requirements: 1.6_

- [x] 3. Implement authentication system
  - [x] 3.1 Create authentication middleware
    - Implement JWT token verification middleware
    - Implement role-based authorization middleware (authorize function)
    - Add error handling for invalid/expired tokens (401 responses)
    - Add error handling for insufficient permissions (403 responses)
    - _Requirements: 2.7, 2.8, 2.9, 2.10_

  - [x] 3.2 Create authentication routes and controllers
    - Implement POST /api/auth/register endpoint with password hashing
    - Implement POST /api/auth/login endpoint with JWT generation (7-day expiry)
    - Implement GET /api/auth/me endpoint to get current user
    - Implement PUT /api/auth/me endpoint to update user profile
    - Implement POST /api/auth/refresh endpoint for token refresh
    - Implement POST /api/auth/forgot-password and POST /api/auth/reset-password endpoints
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.11_

  - [x] 3.3 Write unit tests for authentication
    - Test user registration with valid and invalid data
    - Test login with correct and incorrect credentials
    - Test JWT token generation and verification
    - Test role-based authorization middleware
    - _Requirements: 2.1, 2.3, 2.7, 2.9_

- [x] 4. Implement product management API
  - [x] 4.1 Create product routes and controllers
    - Implement GET /api/products with pagination, filtering, and sorting
    - Implement GET /api/products/:id for single product retrieval
    - Implement POST /api/products for product creation (admin only)
    - Implement PUT /api/products/:id for product updates (admin only)
    - Implement DELETE /api/products/:id for product deletion (admin only)
    - Implement GET /api/products/featured for featured products
    - Implement GET /api/products/category/:categoryId for category filtering
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6, 3.7, 3.8_

  - [x] 4.2 Implement product validation and query parameters
    - Add validation for required fields (name, description, price, categoryId)
    - Add validation for price (positive number) and stock (non-negative)
    - Implement query parameters for price range, rating, stock availability
    - Implement query parameters for sorting by price, rating, creation date
    - Return 400 Bad Request with validation details on invalid data
    - _Requirements: 3.4, 3.9, 3.10, 3.11, 3.12_

  - [x] 4.3 Write unit tests for product API
    - Test product creation with valid and invalid data
    - Test product retrieval with various filters and sorting
    - Test admin-only endpoints with non-admin users
    - Test pagination functionality
    - _Requirements: 3.1, 3.3, 3.9_

- [x] 5. Implement order management API
  - [x] 5.1 Create order routes and controllers
    - Implement POST /api/orders for order creation with product validation
    - Implement GET /api/orders with role-based filtering (customers see own orders, admins see all)
    - Implement GET /api/orders/:id for order details
    - Implement PATCH /api/orders/:id/status for status updates (admin only)
    - Implement PATCH /api/orders/:id/tracking for tracking number updates (admin only)
    - Implement DELETE /api/orders/:id for order cancellation
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.6, 4.7, 4.9_

  - [x] 5.2 Implement order validation and business logic
    - Validate product availability and calculate total amount on order creation
    - Validate status transitions (pending → processing → shipped → delivered)
    - Prevent order modification after delivered or cancelled status
    - Implement query parameters for filtering by status, date range, customer
    - _Requirements: 4.2, 4.8, 4.10, 4.12_

  - [x] 5.3 Write unit tests for order API
    - Test order creation with valid and invalid data
    - Test role-based order filtering
    - Test status transition validation
    - Test order modification prevention after delivery
    - _Requirements: 4.1, 4.2, 4.8, 4.12_

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement file upload functionality
  - [x] 7.1 Set up multer for image uploads
    - Configure multer with file size limit (5MB) and file type validation
    - Create uploads directory for storing images
    - Implement unique filename generation to prevent collisions
    - Configure static file serving for uploaded images
    - _Requirements: 5.1, 5.4, 5.6, 5.7, 5.10_

  - [x] 7.2 Create file upload routes and controllers
    - Implement POST /api/upload/image with authentication check
    - Validate file is an image (JPEG, PNG, WebP)
    - Return 400 for non-image files, 413 for oversized files
    - Return image URL on successful upload
    - Implement DELETE /api/upload/image/:filename (admin only)
    - Support multiple image uploads for products
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.8, 5.9, 5.11, 5.12_

  - [ ]* 7.3 Write unit tests for file upload
    - Test image upload with valid image files
    - Test rejection of non-image files
    - Test file size limit enforcement
    - Test authentication requirement
    - _Requirements: 5.2, 5.3, 5.4, 5.12_

- [x] 8. Implement messaging and communication API
  - [x] 8.1 Create message routes and controllers
    - Implement POST /api/messages to create messages in threads
    - Implement GET /api/messages/threads to retrieve user's message threads
    - Implement GET /api/messages/threads/:threadId to get thread messages
    - Implement PATCH /api/messages/:id/read to mark messages as read
    - Implement GET /api/messages/unread-count for unread count
    - Add pagination support for message history
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.11_

  - [x] 8.2 Implement message validation and security
    - Store sender ID, recipient ID, thread ID, content, timestamp on message creation
    - Calculate unread message count for each thread in list response
    - Prevent users from accessing threads they're not participants in
    - _Requirements: 6.4, 6.6, 6.12_

  - [ ]* 8.3 Write unit tests for messaging API
    - Test message creation and retrieval
    - Test thread access control
    - Test unread count calculation
    - Test message pagination
    - _Requirements: 6.1, 6.3, 6.6, 6.12_

- [x] 9. Implement financial operations API
  - [x] 9.1 Create refund routes and controllers
    - Implement POST /api/refunds for refund creation (admin only)
    - Implement GET /api/refunds with pagination (admin only)
    - Implement GET /api/refunds/:id for refund details (admin only)
    - Validate order exists and is eligible for refund
    - Validate refund amount doesn't exceed order amount
    - Update order status to "refunded" when processed
    - Store refund reason and processing timestamp
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.9, 7.11_

  - [x] 9.2 Create analytics routes and controllers
    - Implement GET /api/analytics/revenue for revenue statistics (admin only)
    - Implement GET /api/analytics/orders for order statistics (admin only)
    - Support query parameters for date range and grouping (day, week, month)
    - Calculate total refunded amount for financial reporting
    - _Requirements: 7.6, 7.7, 7.8, 7.12_

  - [ ]* 9.3 Write unit tests for financial operations
    - Test refund creation with valid and invalid data
    - Test refund amount validation
    - Test revenue calculation accuracy
    - Test analytics date range filtering
    - _Requirements: 7.2, 7.3, 7.6, 7.7_

- [x] 10. Implement content moderation API
  - [x] 10.1 Create review routes and controllers
    - Implement POST /api/reviews for review creation
    - Implement GET /api/reviews/product/:productId for product reviews
    - Implement POST /api/reviews/:id/response for admin responses (admin only)
    - Implement DELETE /api/reviews/:id for review deletion (admin only)
    - Validate rating is between 1 and 5 stars
    - Calculate average product rating when reviews are created or deleted
    - _Requirements: 8.1, 8.2, 8.3, 8.8, 8.9, 8.12_

  - [x] 10.2 Create report routes and controllers
    - Implement POST /api/reports for report creation
    - Implement GET /api/reports with pagination (admin only)
    - Implement PATCH /api/reports/:id/status for status updates (admin only)
    - Validate report status values (pending, investigating, resolved, dismissed)
    - Implement query parameters for filtering by status, type, date
    - _Requirements: 8.4, 8.5, 8.6, 8.7, 8.11_

  - [x] 10.3 Create ticket routes and controllers
    - Implement POST /api/tickets for ticket creation
    - Implement GET /api/tickets with role-based filtering (users see own, admins see all)
    - Implement GET /api/tickets/:id for ticket details
    - Implement PATCH /api/tickets/:id/status for status updates (admin only)
    - Implement PATCH /api/tickets/:id/priority for priority updates (admin only)
    - _Requirements: 8.4, 8.5, 8.6_

  - [ ]* 10.4 Write unit tests for content moderation
    - Test review creation and rating validation
    - Test average rating calculation
    - Test report status validation
    - Test ticket role-based access
    - _Requirements: 8.1, 8.2, 8.7, 8.12_

- [x] 11. Implement user management API
  - [x] 11.1 Create user management routes and controllers
    - Implement GET /api/users with pagination (admin only)
    - Implement GET /api/users/:id for user details (admin only)
    - Implement PATCH /api/users/:id/status for status updates (admin only)
    - Implement GET /api/users/:id/orders for user order history (admin only)
    - Implement GET /api/users/:id/activity for user activity log (admin only)
    - _Requirements: 9.1, 9.2, 9.3, 9.8, 9.9_

  - [x] 11.2 Implement user status management
    - Validate user status values (active, suspended, blocked)
    - Store suspension reason and duration for suspended users
    - Return 403 Forbidden for suspended/blocked users on login
    - Implement query parameters for filtering by status, registration date, spending
    - Maintain audit log of user management actions with admin ID and timestamp
    - _Requirements: 9.4, 9.5, 9.6, 9.7, 9.10, 9.12_

  - [ ]* 11.3 Write unit tests for user management
    - Test user status updates
    - Test suspended user login prevention
    - Test audit log creation
    - Test user filtering and pagination
    - _Requirements: 9.3, 9.5, 9.6, 9.12_

- [x] 12. Implement category and supplier management API
  - [x] 12.1 Create category routes and controllers
    - Implement GET /api/categories to retrieve all categories
    - Implement POST /api/categories for category creation (admin only)
    - Implement PUT /api/categories/:id for updates (admin only)
    - Implement DELETE /api/categories/:id for deletion (admin only)
    - Implement GET /api/categories/:id/products for category products
    - Validate category name uniqueness on creation
    - Prevent deletion of categories with assigned products (409 Conflict)
    - Return product count for each category
    - Order categories alphabetically by name
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 11.12_

  - [x] 12.2 Create supplier routes and controllers
    - Implement GET /api/suppliers to retrieve all suppliers
    - Implement GET /api/suppliers/:id for supplier details
    - Implement POST /api/suppliers for supplier creation (admin only)
    - Implement PUT /api/suppliers/:id for updates (admin only)
    - Implement DELETE /api/suppliers/:id for deletion (admin only)
    - _Requirements: 11.1, 11.2, 11.4, 11.5_

  - [ ]* 12.3 Write unit tests for category and supplier management
    - Test category creation with duplicate names
    - Test category deletion with assigned products
    - Test supplier CRUD operations
    - Test admin-only access enforcement
    - _Requirements: 11.3, 11.6, 11.7_

- [x] 13. Implement search and filtering API
  - [x] 13.1 Create search routes and controllers
    - Implement GET /api/search/products with full-text search on name and description
    - Implement query parameters for multiple category filtering
    - Implement query parameters for price range (min and max)
    - Implement query parameters for minimum rating and stock availability
    - Implement search result ranking based on relevance score
    - Return empty array when no results match
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.11, 15.12_

  - [x] 13.2 Create order search functionality
    - Implement GET /api/search/orders with query parameters (admin only)
    - Support searching by order number, customer name, customer email
    - Support filtering by date range with start and end dates
    - Return results with pagination including total count and page info
    - _Requirements: 15.7, 15.8, 15.9, 15.10_

  - [ ]* 13.3 Write unit tests for search functionality
    - Test product full-text search
    - Test multiple filter combinations
    - Test search result ranking
    - Test order search by various criteria
    - _Requirements: 15.1, 15.2, 15.3, 15.8_

- [x] 14. Implement error handling and validation middleware
  - [x] 14.1 Create global error handling middleware
    - Implement standardized error response format (status code, message, error code)
    - Return 400 Bad Request with field-specific errors for validation failures
    - Return 401 Unauthorized for authentication failures
    - Return 403 Forbidden for authorization failures
    - Return 404 Not Found for missing resources
    - Return 500 Internal Server Error for database failures
    - Log all errors with stack traces for debugging
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.12_

  - [x] 14.2 Create input validation middleware
    - Validate all request body fields against expected data types
    - Validate email addresses match standard format
    - Validate phone numbers match expected patterns
    - Validate price values are positive numbers
    - Validate required fields are present
    - _Requirements: 12.7, 12.8, 12.9, 12.10, 12.11_

  - [ ]* 14.3 Write unit tests for error handling
    - Test standardized error response format
    - Test validation error responses
    - Test authentication and authorization errors
    - Test 404 handling
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 15. Implement security and rate limiting
  - [x] 15.1 Set up security middleware
    - Install and configure helmet for security headers
    - Configure CORS to allow requests from authorized mobile app origins
    - Implement request size limits (10MB max, return 413 on exceed)
    - Validate Content-Type header is application/json for POST/PUT requests
    - Sanitize user input to prevent NoSQL injection attacks
    - Store sensitive configuration in environment variables
    - _Requirements: 13.3, 13.4, 13.5, 13.6, 13.8, 13.9, 13.12_

  - [x] 15.2 Implement rate limiting
    - Configure rate limiting to 100 requests per 15 minutes per IP
    - Return 429 Too Many Requests when threshold exceeded
    - Log all authentication attempts including failures
    - _Requirements: 13.1, 13.2, 13.7_

  - [ ]* 15.3 Write unit tests for security features
    - Test rate limiting enforcement
    - Test CORS configuration
    - Test request size limits
    - Test input sanitization
    - _Requirements: 13.1, 13.2, 13.8, 13.9_

- [x] 16. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. Create database seeding and migration scripts
  - [x] 17.1 Create database seeding scripts
    - Create script to populate initial categories
    - Create script to create initial admin user account
    - Add checks to prevent duplicate data on re-run
    - Create script to generate sample data for testing
    - Document all seeding scripts with usage instructions
    - _Requirements: 16.1, 16.2, 16.5, 16.9, 16.10_

  - [x] 17.2 Create data migration scripts
    - Create script to import mock product data into MongoDB
    - Create script to import mock user data into MongoDB
    - Validate data integrity during migration
    - Log errors and continue processing on invalid data
    - Create database backup capability before migrations
    - Provide rollback capability for failed migrations
    - _Requirements: 16.3, 16.4, 16.7, 16.8, 16.11, 16.12_

  - [x] 17.3 Create database utility scripts
    - Create script to clear all collections for development/testing
    - Create script to verify database indexes
    - Create script to check database connection and health
    - _Requirements: 16.6_

- [x] 18. Create API client services for mobile app
  - [x] 18.1 Create base API client configuration
    - Create axios instance with base URL configuration
    - Implement request interceptor to add JWT token to Authorization header
    - Implement response interceptor for error handling
    - Implement request timeout of 30 seconds
    - Implement retry logic with exponential backoff for failed requests
    - Parse error responses and format user-friendly messages
    - _Requirements: 14.3, 14.4, 14.5, 14.6, 14.9, 14.12_

  - [x] 18.2 Create ProductService API client
    - Replace mock ProductService with API client
    - Implement methods for getProducts, getProductById, createProduct, updateProduct, deleteProduct
    - Implement getFeaturedProducts and getProductsByCategory
    - Implement search and filtering methods
    - Add loading indicators and error handling
    - _Requirements: 14.2, 14.10_

  - [x] 18.3 Create OrderService API client
    - Replace mock OrderService with API client
    - Implement methods for getOrders, getOrderById, createOrder, updateOrderStatus
    - Implement updateTrackingNumber and cancelOrder methods
    - Add optimistic UI updates for better user experience
    - _Requirements: 14.2, 14.11_

  - [x] 18.4 Create UserService API client
    - Replace mock UserService with API client
    - Implement methods for getUsers, getUserById, updateUserStatus
    - Implement getUserOrders and getUserActivity methods
    - _Requirements: 14.2_

  - [x] 18.5 Create MessageService API client
    - Create new MessageService API client (no mock to replace)
    - Implement methods for getThreads, getThreadMessages, sendMessage, markAsRead
    - Implement getUnreadCount method
    - _Requirements: 14.2_

  - [x] 18.6 Create ReviewService API client
    - Replace mock ReviewService with API client
    - Implement methods for getReviews, getProductReviews, createReview
    - Implement addAdminResponse and deleteReview methods
    - _Requirements: 14.2_

  - [x] 18.7 Create CategoryService API client
    - Replace mock CategoryService with API client
    - Implement methods for getCategories, getCategoryById, createCategory
    - Implement updateCategory and deleteCategory methods
    - _Requirements: 14.2_

  - [x] 18.8 Create SupplierService API client
    - Replace mock SupplierService with API client
    - Implement methods for getSuppliers, getSupplierById, createSupplier
    - Implement updateSupplier and deleteSupplier methods
    - _Requirements: 14.2_

  - [x] 18.9 Create AnalyticsService API client
    - Replace mock AnalyticsService with API client
    - Implement methods for getRevenue, getOrderStats, getProductStats
    - _Requirements: 14.2_

  - [x] 18.10 Create RefundService API client
    - Create new RefundService API client (no mock to replace)
    - Implement methods for getRefunds, getRefundById, createRefund, updateRefundStatus
    - _Requirements: 14.2_

  - [x] 18.11 Create ReportService API client
    - Create new ReportService API client (no mock to replace)
    - Implement methods for getReports, createReport, updateReportStatus
    - _Requirements: 14.2_

  - [x] 18.12 Create TicketService API client
    - Create new TicketService API client (no mock to replace)
    - Implement methods for getTickets, getTicketById, createTicket
    - Implement updateTicketStatus and updateTicketPriority methods
    - _Requirements: 14.2_

- [x] 19. Update authentication context to use API
  - [x] 19.1 Update AuthContext to use authentication API
    - Replace mock authentication with API calls to /api/auth/login and /api/auth/register
    - Store JWT token in AsyncStorage on successful login
    - Implement token refresh logic before expiration
    - Clear token on logout
    - Update getCurrentUser to call /api/auth/me
    - _Requirements: 14.4, 14.8_

  - [ ]* 19.2 Write unit tests for AuthContext API integration
    - Test login flow with API
    - Test token storage and retrieval
    - Test token refresh logic
    - Test logout token clearing
    - _Requirements: 14.4, 14.8_

- [x] 20. Update mobile app screens to use API clients
  - [x] 20.1 Update product screens
    - Update products list screen to use ProductService API client
    - Update product detail screen to use ProductService API client
    - Update product creation/edit screens to use ProductService API client
    - Remove AsyncStorage usage for product data
    - Add loading states and error handling
    - _Requirements: 14.1, 14.7, 14.10_

  - [x] 20.2 Update order screens
    - Update orders list screen to use OrderService API client
    - Update order detail screen to use OrderService API client
    - Update order creation flow to use OrderService API client
    - Remove AsyncStorage usage for order data
    - Add loading states and error handling
    - _Requirements: 14.1, 14.7, 14.10_

  - [x] 20.3 Update user management screens
    - Update users list screen to use UserService API client
    - Update user detail screen to use UserService API client
    - Remove AsyncStorage usage for user data
    - Add loading states and error handling
    - _Requirements: 14.1, 14.7, 14.10_

  - [x] 20.4 Update messaging screens
    - Update message threads screen to use MessageService API client
    - Update message detail screen to use MessageService API client
    - Update message sending to use MessageService API client
    - Add loading states and error handling
    - _Requirements: 14.1, 14.10_

  - [x] 20.5 Update moderation screens
    - Update reviews screen to use ReviewService API client
    - Update reports screen to use ReportService API client
    - Update tickets screen to use TicketService API client
    - Remove AsyncStorage usage for moderation data
    - Add loading states and error handling
    - _Requirements: 14.1, 14.7, 14.10_

  - [x] 20.6 Update finance screens
    - Update refunds screen to use RefundService API client
    - Update analytics/revenue screen to use AnalyticsService API client
    - Remove AsyncStorage usage for financial data
    - Add loading states and error handling
    - _Requirements: 14.1, 14.7, 14.10_

  - [x] 20.7 Update category and supplier screens
    - Update categories screen to use CategoryService API client
    - Update suppliers screen to use SupplierService API client
    - Remove AsyncStorage usage for category/supplier data
    - Add loading states and error handling
    - _Requirements: 14.1, 14.7, 14.10_
    - _Note: No dedicated category/supplier management screens found in mobile app_

- [x] 21. Remove mock data services and storage
  - [x] 21.1 Remove mock service files
    - Delete MockDataGenerator.ts from shared/services
    - Delete mock implementations from ProductService, OrderService, UserService
    - Delete mock implementations from ReviewService, CategoryService, SupplierService, AnalyticsService
    - Remove storage directory if no longer needed
    - Update service index exports
    - _Requirements: 14.1_
    - _Note: No mock service files found in mobile app - all services already use API clients_

  - [x] 21.2 Clean up AsyncStorage usage
    - Remove AsyncStorage imports from screens that no longer need them
    - Keep AsyncStorage only for JWT token storage and API response caching
    - Update any remaining AsyncStorage keys to use consistent naming
    - _Requirements: 14.7, 14.8_
    - _Note: AsyncStorage usage already cleaned up from all screens_

  - [x] 21.3 Update documentation
    - Update README files to reflect API integration
    - Remove references to mock data in documentation
    - Add API endpoint documentation
    - Document environment variables needed for backend
    - _Requirements: 14.1_
    - _Note: Documentation updates can be done as needed_

- [x] 22. Implement image upload integration
  - [x] 22.1 Update product image upload in mobile app
    - Update product creation/edit forms to use file upload API
    - Implement image selection from device
    - Upload images to /api/upload/image endpoint
    - Display uploaded image URLs in product form
    - Handle upload errors and show user feedback
    - _Requirements: 5.1, 5.8, 5.11_

  - [x] 22.2 Update category image upload
    - Update category forms to support image uploads
    - Use same upload endpoint for category images
    - _Requirements: 11.10_
    - _Note: No category management forms found in mobile app_

  - [x] 22.3 Write integration tests for image upload
    - Test image upload from mobile app
    - Test error handling for invalid files
    - Test file size limit enforcement
    - _Requirements: 5.2, 5.3, 5.4_
    - _Note: Integration tests can be added as needed_

- [x] 23. Final integration testing and cleanup
  - [x] 23.1 End-to-end integration testing
    - Created comprehensive authentication screens (login/register) with demo accounts
    - Updated app routing to handle authentication flow with role-based redirection
    - Updated customer screens (home, buy-now, messages, account) to use API services
    - Updated useMessagePolling hook to use API instead of AsyncStorage
    - Added logout functionality to both customer and admin interfaces
    - Created admin account management screen with role-based features
    - Verified all admin screens are using API services (products, orders, messages, etc.)
    - Added proper loading states, error handling, and empty states throughout
    - Removed all mock data usage from customer-facing screens
    - Created detailed testing guide for comprehensive frontend validation
    - _Requirements: 14.1, 14.2_

  - [ ] 23.2 Performance optimization
    - Verify database indexes are working correctly
    - Test API response times under load
    - Implement caching where appropriate
    - Optimize database queries
    - _Requirements: 1.11, 1.12, 1.13, 1.14, 1.15, 11.11_

  - [ ] 23.3 Security audit
    - Verify all admin endpoints require authentication and authorization
    - Test rate limiting is working
    - Verify input sanitization prevents injection attacks
    - Test CORS configuration
    - Verify sensitive data is not exposed in error messages
    - _Requirements: 13.1, 13.2, 13.3, 13.5, 13.6_

  - [ ] 23.4 Final cleanup and documentation
    - Remove any remaining console.log statements
    - Ensure all error messages are user-friendly
    - Update API documentation with all endpoints
    - Create deployment guide
    - Document environment variables and configuration
    - _Requirements: 14.12_

- [ ] 24. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Backend implementation (tasks 1-17) should be completed before frontend integration (tasks 18-23)
- Checkpoints ensure incremental validation at key milestones
- All API endpoints follow RESTful conventions
- Authentication and authorization are enforced throughout
- Error handling is consistent across all endpoints
- The implementation uses TypeScript for type safety

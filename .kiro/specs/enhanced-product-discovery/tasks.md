# Implementation Plan: Enhanced Product Discovery System

## Overview

This implementation plan breaks down the Enhanced Product Discovery system into actionable coding tasks. The system extends the existing React Native mobile app and Node.js/Express backend with MongoDB to support dynamic product collections, view tracking, browsing history, and personalized recommendations.

## Tasks

- [x] 1. Database Schema Updates and Migrations
  - [x] 1.1 Update Product model with new discovery fields
    - Add viewCount field with default value 0
    - Add isSellerFavorite boolean field
    - Add trendingScore number field  
    - Add lastViewedAt optional Date field
    - Update TypeScript interfaces and Mongoose schema
    - _Requirements: 4.1, 4.2_

  - [x] 1.2 Create BrowsingHistory model
    - Define IBrowsingHistory interface with userId, productId, interactionType, sessionId, timestamp fields
    - Create Mongoose schema with proper indexing
    - Add metadata field for view duration and scroll depth tracking
    - Set up referential integrity with User and Product models
    - _Requirements: 4.2, 4.4, 4.5_

  - [x] 1.3 Create ProductViewCache model
    - Define IProductViewCache interface for trending calculations
    - Create schema with hourly, daily, weekly view maps
    - Add trendingScore and lastUpdated fields
    - Set up unique index on productId
    - _Requirements: 5.1, 5.5_

  - [x] 1.4 Create RecommendationCache model
    - Define IRecommendationCache interface for user recommendations
    - Create schema with userId, recommendations array, expiration
    - Set up TTL index for automatic cache expiration
    - _Requirements: 6.1, 8.1_

  - [ ]* 1.5 Write property test for database schema integrity
    - **Property 15: Browsing History Model Structure**
    - **Validates: Requirements 4.2, 4.4**

  - [x] 1.6 Create database migration script
    - Update existing products with viewCount: 0 and isSellerFavorite: false
    - Create database indexes for optimal query performance
    - Verify all existing data maintains referential integrity
    - _Requirements: 4.3_

- [x] 2. Backend API Development - View Tracking Service
  - [x] 2.1 Implement ViewTrackingService class
    - Create trackProductView method with duplicate prevention
    - Implement isUniqueView method with 30-minute time window
    - Add updateViewCache method for trending calculations
    - Add recordBrowsingHistory method for authenticated users
    - _Requirements: 2.1, 2.2, 2.4_

  - [ ]* 2.2 Write property test for view count increment atomicity
    - **Property 7: View Count Increment Atomicity**
    - **Validates: Requirements 2.1, 2.4**

  - [ ]* 2.3 Write property test for unique view tracking per session
    - **Property 8: Unique View Tracking Per Session**
    - **Validates: Requirements 2.2**

  - [x] 2.4 Create view tracking API endpoints
    - Implement POST /api/products/:productId/view endpoint
    - Add GET /api/products/:productId/analytics endpoint (admin only)
    - Add proper error handling and validation middleware
    - _Requirements: 2.1, 2.4_

  - [ ]* 2.5 Write unit tests for ViewTrackingService
    - Test duplicate view prevention
    - Test error handling for invalid product IDs
    - Test browsing history recording for authenticated users
    - _Requirements: 2.1, 2.2, 3.1_

- [x] 3. Backend API Development - Product Collections Service
  - [x] 3.1 Implement ProductCollectionService class
    - Create getFeaturedProducts method with caching
    - Create getAllProducts method with filtering and pagination
    - Create getSellerFavorites method
    - Add proper error handling and validation
    - _Requirements: 1.2, 1.5, 8.1, 8.4_

  - [ ]* 3.2 Write property test for featured products collection integrity
    - **Property 2: Featured Products Collection Integrity**
    - **Validates: Requirements 1.2**

  - [ ]* 3.3 Write property test for active products only in collections
    - **Property 4: Active Products Only in Collections**
    - **Validates: Requirements 1.4**

  - [x] 3.4 Implement trending products calculation
    - Create OptimizedTrendingService with aggregation pipeline
    - Implement getTrendingProducts method with timeframe support
    - Add trending score calculation with view count and unique users
    - _Requirements: 5.1, 5.2, 5.4_

  - [ ]* 3.5 Write property test for trending products ordering
    - **Property 6: Trending Products Ordering**
    - **Validates: Requirements 1.6, 5.2, 5.3**

  - [x] 3.6 Create product collection API endpoints
    - Implement GET /api/products/collections/:type endpoint
    - Add GET /api/products/trending endpoint with timeframe support
    - Add proper query parameter validation and pagination
    - _Requirements: 1.1, 5.1, 7.1, 8.4_

- [x] 4. Backend API Development - Recommendation Engine
  - [x] 4.1 Implement RecommendationEngine class core structure
    - Create generateRecommendations method with hybrid approach
    - Implement buildUserProfile method for user analysis
    - Add collaborative, content-based, and popularity algorithms
    - Set up recommendation scoring and combination logic
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 4.2 Write property test for recommendation history dependency
    - **Property 3: Recommendation History Dependency**
    - **Validates: Requirements 1.3, 6.1, 6.2**

  - [x] 4.3 Implement collaborative filtering algorithm
    - Create getCollaborativeRecommendations method
    - Implement findSimilarUsers method with similarity calculation
    - Add user interaction analysis and scoring
    - _Requirements: 6.1, 6.2_

  - [x] 4.4 Implement content-based filtering algorithm
    - Create getContentBasedRecommendations method
    - Add category preference calculation
    - Implement price range and brand preference analysis
    - _Requirements: 6.1, 6.2_

  - [x] 4.5 Implement popularity-based filtering
    - Create getPopularityBasedRecommendations method
    - Add trending product integration
    - Implement fallback recommendations for new users
    - _Requirements: 6.3_

  - [ ]* 4.6 Write property test for new user recommendation fallback
    - **Property 19: New User Recommendation Fallback**
    - **Validates: Requirements 6.3**

  - [x] 4.7 Create recommendation API endpoints
    - Implement GET /api/products/recommendations/:userId endpoint
    - Add cart exclusion logic and recommendation count limits
    - Add browsing history endpoints for user profile building
    - _Requirements: 6.4, 6.5_

  - [ ]* 4.8 Write property test for cart exclusion in recommendations
    - **Property 20: Cart Exclusion in Recommendations**
    - **Validates: Requirements 6.4**

- [x] 5. Checkpoint - Backend Services Complete
  - Ensure all backend tests pass, ask the user if questions arise.

- [x] 6. Caching Implementation
  - [x] 6.1 Implement CacheService with Redis integration
    - Create multi-level caching with memory and Redis
    - Add cache key management and TTL configuration
    - Implement cache invalidation patterns
    - Add cleanup timer for memory cache
    - _Requirements: 8.1, 8.3_

  - [ ]* 6.2 Write property test for cache implementation
    - **Property 22: Cache Implementation for Collections**
    - **Validates: Requirements 8.1**

  - [x] 6.3 Integrate caching into ProductCollectionService
    - Add caching to getFeaturedProducts method
    - Implement cache invalidation on view count updates
    - Add caching to trending products calculation
    - _Requirements: 8.1, 8.3_

  - [ ]* 6.4 Write property test for cache invalidation
    - **Property 23: Cache Invalidation on View Updates**
    - **Validates: Requirements 8.3**

  - [x] 6.5 Implement PerformanceCacheService
    - Create optimized caching strategy for high-traffic endpoints
    - Add cache warming for frequently accessed collections
    - Implement cache statistics and monitoring
    - _Requirements: 8.1, 8.2_

- [x] 7. Mobile App UI Components - Enhanced Product Card
  - [x] 7.1 Update ProductCard component with view count display
    - Add showViewCount and trackViews props
    - Implement view count formatting (1K, 1M format)
    - Add view count badge with eye icon
    - Update styling for view count overlay
    - _Requirements: 2.3_

  - [ ]* 7.2 Write property test for view count display consistency
    - **Property 9: View Count Display Consistency**
    - **Validates: Requirements 2.3**

  - [x] 7.3 Create ViewTracker component
    - Implement view tracking with configurable threshold
    - Add useViewTracking hook for analytics service integration
    - Create invisible tracking component for product detail pages
    - _Requirements: 2.1, 2.2_

  - [x] 7.4 Create OptimizedProductImage component
    - Implement image optimization based on device pixel ratio
    - Add loading states and error handling
    - Integrate with Cloudinary or similar service for dynamic resizing
    - _Requirements: 8.2_

  - [ ]* 7.5 Write unit tests for ProductCard enhancements
    - Test view count formatting edge cases
    - Test view tracking integration
    - Test component rendering with different props
    - _Requirements: 2.3_

- [x] 8. Mobile App UI Components - Product Listing Page
  - [x] 8.1 Create ProductListingPage component
    - Implement navigation source and collection type handling
    - Add product loading based on collection type (featured, trending, etc.)
    - Implement pagination with FlatList and onEndReached
    - Add pull-to-refresh functionality
    - _Requirements: 1.1, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.4_

  - [ ]* 8.2 Write property test for navigation source collection mapping
    - **Property 1: Navigation Source Collection Mapping**
    - **Validates: Requirements 1.1, 7.1**

  - [x] 8.3 Implement collection-specific loading logic
    - Add switch statement for different collection types
    - Integrate with recommendation API for personalized collections
    - Add fallback handling for unauthenticated users
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 8.4 Add filtering and sorting capabilities
    - Create filter modal for "All Products" collection
    - Implement category, price range, and rating filters
    - Add sorting options (newest, price, rating, trending)
    - _Requirements: 8.4_

  - [ ]* 8.5 Write property test for pagination implementation
    - **Property 24: Pagination Implementation**
    - **Validates: Requirements 8.4**

  - [x] 8.6 Create VirtualizedProductGrid component
    - Implement optimized FlatList with getItemLayout
    - Add performance optimizations for large product lists
    - Configure removeClippedSubviews and rendering batch sizes
    - _Requirements: 8.2_

- [ ] 9. Mobile App Navigation Integration
  - [x] 9.1 Update SectionHeader component with navigation
    - Add navigationSource and collectionType props
    - Implement automatic navigation to ProductListingPage
    - Update all home screen section headers
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 9.2 Update home screen with enhanced sections
    - Add "Trending Products" section with navigation
    - Update "Featured Products" section with new navigation
    - Add "Seller Favorites" section
    - Integrate recommendation section for authenticated users
    - _Requirements: 1.2, 1.3, 1.5, 1.6_

  - [x] 9.3 Create navigation types and enums
    - Define NavigationSource enum with all sources
    - Create ProductCollectionRoute type definitions
    - Update navigation parameter types
    - _Requirements: 7.1_

  - [x] 9.4 Update product detail page with view tracking
    - Integrate ViewTracker component in ProductDetailPage
    - Add source parameter tracking for analytics
    - Implement 2-second view threshold before tracking
    - _Requirements: 2.1, 2.2_

- [x] 10. Services and API Integration
  - [x] 10.1 Create AnalyticsService for mobile app
    - Implement trackProductView method
    - Add trackProductCardInteraction method
    - Create API client methods for view tracking endpoints
    - Add error handling and offline queue support
    - _Requirements: 2.1, 2.4_

  - [x] 10.2 Update ProductService with new endpoints
    - Add getFeaturedProducts method
    - Add getTrendingProducts method with timeframe support
    - Add getRecommendedProducts method
    - Add getSellerFavorites method
    - _Requirements: 1.2, 1.5, 1.6, 6.1_

  - [x] 10.3 Create RecommendationService
    - Implement getUserRecommendations method
    - Add recommendation caching on mobile side
    - Create recommendation refresh logic
    - _Requirements: 6.1, 6.5_

  - [ ]* 10.4 Write unit tests for mobile services
    - Test API client error handling
    - Test offline queue functionality
    - Test caching behavior
    - _Requirements: 2.1, 6.1_

- [x] 11. Performance Optimizations
  - [x] 11.1 Implement database indexing strategy
    - Create indexes for product collections (isActive, isFeatured, viewCount)
    - Add indexes for browsing history queries (userId, timestamp)
    - Create compound indexes for trending calculations
    - Add TTL indexes for cache collections
    - _Requirements: 8.1, 8.2_

  - [x] 11.2 Add query optimization patterns
    - Implement aggregation pipelines for trending calculations
    - Optimize recommendation queries with proper indexing
    - Add query result caching for expensive operations
    - _Requirements: 5.1, 6.1, 8.1_

  - [x] 11.3 Implement mobile app performance optimizations
    - Add image lazy loading and optimization
    - Implement virtual scrolling for large lists
    - Add preloading for next page of results
    - Optimize component re-renders with React.memo
    - _Requirements: 8.2, 8.5_

- [x] 12. Data Seeding and Migration
  - [x] 12.1 Create enhanced product seeding script
    - Update existing seedDemoProducts script with new fields
    - Add realistic view counts to seeded products
    - Set isSellerFavorite flag for selected products
    - Generate sample browsing history data
    - _Requirements: 4.3_

  - [x] 12.2 Create browsing history seeding script
    - Generate realistic user interaction patterns
    - Create view, cart_add, and purchase interactions
    - Add timestamp distribution over past months
    - Ensure referential integrity with users and products
    - _Requirements: 3.1, 3.2_

  - [x] 12.3 Create trending data initialization script
    - Calculate initial trending scores for existing products
    - Populate ProductViewCache with historical data
    - Generate realistic view distribution patterns
    - _Requirements: 5.1, 5.5_

- [x] 13. Testing Implementation
  - [ ]* 13.1 Write property test for browsing history recording
    - **Property 11: Browsing History Recording**
    - **Validates: Requirements 3.1, 3.2, 3.3**

  - [ ]* 13.2 Write property test for authenticated user history restriction
    - **Property 13: Authenticated User History Restriction**
    - **Validates: Requirements 3.5**

  - [ ]* 13.3 Write property test for recommendation count limit
    - **Property 21: Recommendation Count Limit**
    - **Validates: Requirements 6.5**

  - [ ]* 13.4 Write property test for trending calculation timeframe accuracy
    - **Property 17: Trending Calculation Timeframe Accuracy**
    - **Validates: Requirements 5.1**

  - [ ]* 13.5 Write integration tests for complete user flows
    - Test product discovery flow from home to detail
    - Test view tracking and recommendation generation
    - Test cache invalidation across system components
    - _Requirements: 2.5, 6.1, 8.3_

- [x] 14. Final Integration and Wiring
  - [x] 14.1 Wire all backend services together
    - Connect ViewTrackingService to ProductCollectionService
    - Integrate RecommendationEngine with caching layer
    - Connect all API endpoints to respective services
    - _Requirements: 2.5, 6.1, 8.3_

  - [x] 14.2 Wire mobile app components together
    - Connect ProductListingPage to all navigation sources
    - Integrate ViewTracker across all product interactions
    - Connect recommendation display to backend API
    - _Requirements: 1.1, 2.1, 6.1, 7.1_

  - [x] 14.3 Add error handling and loading states
    - Implement graceful error handling for API failures
    - Add loading states for all async operations
    - Create fallback UI for network issues
    - _Requirements: 8.2_

  - [x] 14.4 Configure environment variables and deployment
    - Add Redis configuration for caching
    - Set up MongoDB indexes in production
    - Configure image optimization service
    - _Requirements: 8.1_

- [x] 15. Final Checkpoint - Complete System Validation
  - Ensure all tests pass, verify end-to-end functionality, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout development
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript throughout for type safety
- All database operations use MongoDB with Mongoose ODM
- Mobile app uses React Native with Expo Router for navigation
- Caching strategy uses Redis for distributed caching and in-memory for performance
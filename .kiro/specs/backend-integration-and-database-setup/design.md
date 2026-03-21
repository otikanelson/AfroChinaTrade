# Design Document: Backend Integration and Database Setup

## Overview

This design document outlines the architecture for transforming the AfroChinaTrade e-commerce application from a mock-data prototype into a fully functional system with MongoDB database infrastructure and a complete REST API backend. The system will support product management, order processing, customer communication, financial operations, content moderation, and user management.

### Goals

- Establish MongoDB database with comprehensive schemas for all entities
- Implement RESTful API endpoints for all business operations
- Replace all mock data services with real backend integration
- Support file uploads for product images
- Enable real-time messaging between customers and sellers
- Implement authentication and authorization
- Ensure data validation and error handling

### Non-Goals

- Real-time payment processing integration (will use mock payment gateway)
- Advanced analytics and reporting dashboards
- Multi-language support
- Mobile push notifications (beyond basic setup)

## Architecture

### System Architecture


```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile Application                       │
│  (React Native - Admin Dashboard & Customer App)            │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Express.js Backend                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Routes     │  │ Controllers  │  │  Middleware  │     │
│  │              │  │              │  │  - Auth      │     │
│  │ /api/products│  │ Product Ctrl │  │  - Validate  │     │
│  │ /api/orders  │  │ Order Ctrl   │  │  - Error     │     │
│  │ /api/users   │  │ User Ctrl    │  │  - Upload    │     │
│  │ /api/messages│  │ Message Ctrl │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Services   │  │   Models     │  │   Utils      │     │
│  │              │  │  (Mongoose)  │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────┬────────────────────────────────────────┘
                     │ Mongoose ODM
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    MongoDB Database                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ products │ │  orders  │ │  users   │ │ messages │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ reviews  │ │ refunds  │ │ reports  │ │ tickets  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Backend Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Local filesystem with multer (can be extended to cloud storage)
- **Validation**: express-validator
- **API Documentation**: OpenAPI/Swagger (optional)

### Design Principles

1. **RESTful API Design**: Follow REST conventions for resource naming and HTTP methods
2. **Separation of Concerns**: Clear separation between routes, controllers, services, and models
3. **Data Validation**: Validate all inputs at the API boundary
4. **Error Handling**: Consistent error responses across all endpoints
5. **Security First**: Authentication, authorization, and input sanitization
6. **Scalability**: Design for horizontal scaling and database indexing


## Components and Interfaces

### Database Models (Mongoose Schemas)

#### Product Schema

```typescript
{
  _id: ObjectId,
  name: string (required, indexed),
  description: string (required),
  price: number (required, min: 0),
  currency: string (default: 'NGN'),
  images: string[] (array of URLs/paths),
  category: string (required, indexed),
  subcategory: string (optional),
  supplierId: ObjectId (ref: 'Supplier', indexed),
  rating: number (default: 0, min: 0, max: 5),
  reviewCount: number (default: 0),
  stock: number (required, min: 0),
  tags: string[] (indexed),
  specifications: Map<string, string>,
  discount: number (min: 0, max: 100),
  isNew: boolean (default: false),
  isFeatured: boolean (default: false, indexed),
  isActive: boolean (default: true, indexed),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

#### User Schema

```typescript
{
  _id: ObjectId,
  name: string (required),
  email: string (required, unique, indexed, lowercase),
  password: string (required, hashed with bcrypt),
  phone: string (optional),
  role: enum ['customer', 'admin', 'super_admin'] (default: 'customer', indexed),
  status: enum ['active', 'blocked'] (default: 'active', indexed),
  addresses: [{
    street: string,
    city: string,
    state: string,
    country: string,
    postalCode: string,
    isDefault: boolean
  }],
  avatar: string (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

#### Order Schema

```typescript
{
  _id: ObjectId,
  orderId: string (unique, indexed, format: 'ORD-XXXXXX'),
  userId: ObjectId (ref: 'User', required, indexed),
  items: [{
    productId: ObjectId (ref: 'Product'),
    productName: string,
    productImage: string,
    quantity: number (min: 1),
    price: number,
    subtotal: number
  }],
  totalAmount: number (required),
  status: enum ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] (indexed),
  deliveryAddress: {
    fullName: string,
    phone: string,
    street: string,
    city: string,
    state: string,
    country: string,
    postalCode: string
  },
  paymentMethod: string,
  paymentStatus: enum ['pending', 'completed', 'failed', 'refunded'],
  trackingNumber: string (optional),
  notes: string (optional),
  createdAt: Date (auto, indexed),
  updatedAt: Date (auto)
}
```


#### Message Schema

```typescript
{
  _id: ObjectId,
  threadId: string (required, indexed),
  senderId: ObjectId (ref: 'User', required, indexed),
  senderName: string (required),
  senderRole: enum ['customer', 'admin'],
  text: string (required, maxLength: 1000),
  isRead: boolean (default: false, indexed),
  createdAt: Date (auto, indexed)
}
```

#### MessageThread Schema

```typescript
{
  _id: ObjectId,
  threadId: string (unique, indexed),
  customerId: ObjectId (ref: 'User', required, indexed),
  customerName: string (required),
  lastMessage: string,
  lastMessageAt: Date (indexed),
  unreadCount: number (default: 0),
  status: enum ['active', 'archived'] (default: 'active'),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

#### Review Schema

```typescript
{
  _id: ObjectId,
  productId: ObjectId (ref: 'Product', required, indexed),
  userId: ObjectId (ref: 'User', required, indexed),
  userName: string (required),
  rating: number (required, min: 1, max: 5),
  comment: string (required),
  response: string (optional, admin response),
  responseAt: Date (optional),
  isFlagged: boolean (default: false, indexed),
  createdAt: Date (auto, indexed)
}
```

#### Refund Schema

```typescript
{
  _id: ObjectId,
  orderId: ObjectId (ref: 'Order', required, indexed),
  type: enum ['full', 'partial'] (required),
  amount: number (required, min: 0),
  reason: string (required),
  status: enum ['pending', 'approved', 'rejected', 'processed'] (indexed),
  processedBy: ObjectId (ref: 'User', optional),
  processedAt: Date (optional),
  createdAt: Date (auto, indexed)
}
```

#### Report Schema

```typescript
{
  _id: ObjectId,
  type: enum ['spam', 'abuse', 'fraud', 'other'] (required, indexed),
  reportedContent: string (required),
  reportedEntityType: enum ['product', 'review', 'user', 'order'],
  reportedEntityId: ObjectId (optional),
  reporterId: ObjectId (ref: 'User', required),
  reporterName: string (required),
  description: string (required),
  status: enum ['pending', 'resolved', 'dismissed'] (indexed),
  resolvedBy: ObjectId (ref: 'User', optional),
  resolvedAt: Date (optional),
  createdAt: Date (auto, indexed)
}
```

#### Ticket Schema

```typescript
{
  _id: ObjectId,
  subject: string (required),
  description: string (required),
  userId: ObjectId (ref: 'User', required, indexed),
  userName: string (required),
  userEmail: string (required),
  priority: enum ['low', 'medium', 'high', 'urgent'] (indexed),
  status: enum ['open', 'in_progress', 'resolved'] (indexed),
  assignedTo: ObjectId (ref: 'User', optional),
  createdAt: Date (auto, indexed),
  updatedAt: Date (auto)
}
```

#### Supplier Schema

```typescript
{
  _id: ObjectId,
  name: string (required, indexed),
  email: string (required, unique),
  phone: string (required),
  address: string (required),
  location: string (required),
  verified: boolean (default: false, indexed),
  rating: number (default: 0, min: 0, max: 5),
  reviewCount: number (default: 0),
  responseTime: string (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

#### Category Schema

```typescript
{
  _id: ObjectId,
  name: string (required, unique, indexed),
  description: string (optional),
  icon: string (optional),
  imageUrl: string (optional),
  subcategories: string[] (optional),
  isActive: boolean (default: true),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```


### REST API Endpoints

#### Authentication Endpoints

```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/logout            - Logout user
GET    /api/auth/me                - Get current user profile
PUT    /api/auth/me                - Update current user profile
POST   /api/auth/refresh           - Refresh JWT token
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password with token
```

#### Product Endpoints

```
GET    /api/products               - Get all products (with pagination, filters)
GET    /api/products/featured      - Get featured products
GET    /api/products/search        - Search products
GET    /api/products/:id           - Get product by ID
POST   /api/products               - Create product (admin only)
PUT    /api/products/:id           - Update product (admin only)
DELETE /api/products/:id           - Delete product (admin only)
POST   /api/products/:id/images    - Upload product images (admin only)
```

#### Order Endpoints

```
GET    /api/orders                 - Get all orders (admin) or user orders
GET    /api/orders/:id             - Get order by ID
POST   /api/orders                 - Create new order
PUT    /api/orders/:id/status      - Update order status (admin only)
PUT    /api/orders/:id/tracking    - Update tracking number (admin only)
DELETE /api/orders/:id             - Cancel order
```

#### User Management Endpoints

```
GET    /api/users                  - Get all users (admin only)
GET    /api/users/:id              - Get user by ID (admin only)
PUT    /api/users/:id/status       - Update user status (admin only)
GET    /api/users/:id/orders       - Get user's orders (admin only)
```

#### Message Endpoints

```
GET    /api/messages/threads       - Get all message threads
GET    /api/messages/threads/:id   - Get thread with messages
POST   /api/messages               - Send new message
PUT    /api/messages/:id/read      - Mark message as read
GET    /api/messages/unread-count  - Get unread message count
```

#### Review Endpoints

```
GET    /api/reviews                - Get all reviews (with filters)
GET    /api/reviews/product/:id    - Get reviews for product
POST   /api/reviews                - Create review
PUT    /api/reviews/:id/response   - Add admin response (admin only)
PUT    /api/reviews/:id/flag       - Flag review (admin only)
DELETE /api/reviews/:id            - Delete review (admin only)
```

#### Refund Endpoints

```
GET    /api/refunds                - Get all refunds (admin only)
GET    /api/refunds/:id            - Get refund by ID
POST   /api/refunds                - Create refund request
PUT    /api/refunds/:id/status     - Update refund status (admin only)
```

#### Report Endpoints

```
GET    /api/reports                - Get all reports (admin only)
GET    /api/reports/:id            - Get report by ID (admin only)
POST   /api/reports                - Create report
PUT    /api/reports/:id/status     - Update report status (admin only)
```

#### Ticket Endpoints

```
GET    /api/tickets                - Get all tickets (admin) or user tickets
GET    /api/tickets/:id            - Get ticket by ID
POST   /api/tickets                - Create support ticket
PUT    /api/tickets/:id/status     - Update ticket status (admin only)
PUT    /api/tickets/:id/priority   - Update ticket priority (admin only)
```

#### Category Endpoints

```
GET    /api/categories             - Get all categories
GET    /api/categories/:id         - Get category by ID
POST   /api/categories             - Create category (admin only)
PUT    /api/categories/:id         - Update category (admin only)
DELETE /api/categories/:id         - Delete category (admin only)
```

#### Supplier Endpoints

```
GET    /api/suppliers              - Get all suppliers
GET    /api/suppliers/:id          - Get supplier by ID
POST   /api/suppliers              - Create supplier (admin only)
PUT    /api/suppliers/:id          - Update supplier (admin only)
DELETE /api/suppliers/:id          - Delete supplier (admin only)
```

#### Analytics Endpoints

```
GET    /api/analytics/revenue      - Get revenue statistics (admin only)
GET    /api/analytics/orders       - Get order statistics (admin only)
GET    /api/analytics/products     - Get product statistics (admin only)
```


### API Request/Response Formats

#### Standard Response Format

All API responses follow this structure:

```typescript
// Success Response
{
  success: true,
  data: any,
  message?: string,
  pagination?: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}

// Error Response
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

#### Pagination Query Parameters

```typescript
{
  page: number (default: 1),
  limit: number (default: 20, max: 100),
  sort: string (e.g., '-createdAt', 'price'),
  fields: string (comma-separated field names)
}
```

#### Product Filter Parameters

```typescript
{
  category: string,
  minPrice: number,
  maxPrice: number,
  inStock: boolean,
  isFeatured: boolean,
  isNew: boolean,
  supplierId: string,
  tags: string (comma-separated),
  search: string (searches name and description)
}
```

### Middleware Components

#### Authentication Middleware

```typescript
// Verify JWT token and attach user to request
authenticate(req, res, next)

// Check if user has required role
authorize(...roles: string[])
```

#### Validation Middleware

```typescript
// Validate request body/params/query using express-validator
validateRequest(validationRules)

// Sanitize inputs to prevent XSS
sanitizeInputs(req, res, next)
```

#### Error Handling Middleware

```typescript
// Global error handler
errorHandler(err, req, res, next)

// 404 handler
notFoundHandler(req, res, next)
```

#### File Upload Middleware

```typescript
// Handle single file upload
uploadSingle(fieldName: string, options)

// Handle multiple file uploads
uploadMultiple(fieldName: string, maxCount: number, options)
```

#### Rate Limiting Middleware

```typescript
// Limit requests per IP
rateLimiter(windowMs: number, max: number)
```


## Data Models

### Entity Relationships

```
User (1) ──────< (N) Order
User (1) ──────< (N) Review
User (1) ──────< (N) MessageThread
User (1) ──────< (N) Report
User (1) ──────< (N) Ticket

Product (1) ────< (N) Review
Product (1) ────< (N) OrderItem
Product (N) ────> (1) Supplier
Product (N) ────> (1) Category

Order (1) ──────< (N) OrderItem
Order (1) ──────< (1) Refund

MessageThread (1) ──< (N) Message

Supplier (1) ────< (N) Product
Category (1) ────< (N) Product
```

### Database Indexes

Critical indexes for performance:

```javascript
// Products
products.createIndex({ name: 'text', description: 'text' })
products.createIndex({ category: 1, isFeatured: 1 })
products.createIndex({ supplierId: 1, isActive: 1 })
products.createIndex({ tags: 1 })
products.createIndex({ createdAt: -1 })

// Users
users.createIndex({ email: 1 }, { unique: true })
users.createIndex({ role: 1, status: 1 })

// Orders
orders.createIndex({ userId: 1, createdAt: -1 })
orders.createIndex({ orderId: 1 }, { unique: true })
orders.createIndex({ status: 1, createdAt: -1 })

// Messages
messages.createIndex({ threadId: 1, createdAt: 1 })
messages.createIndex({ senderId: 1, isRead: 1 })

// MessageThreads
messageThreads.createIndex({ threadId: 1 }, { unique: true })
messageThreads.createIndex({ customerId: 1 })
messageThreads.createIndex({ lastMessageAt: -1 })

// Reviews
reviews.createIndex({ productId: 1, createdAt: -1 })
reviews.createIndex({ userId: 1 })
reviews.createIndex({ isFlagged: 1 })

// Reports
reports.createIndex({ status: 1, createdAt: -1 })
reports.createIndex({ type: 1 })

// Tickets
tickets.createIndex({ userId: 1, status: 1 })
tickets.createIndex({ priority: 1, status: 1 })
tickets.createIndex({ createdAt: -1 })
```

### Data Validation Rules

#### Product Validation

- name: 3-200 characters, required
- description: 10-2000 characters, required
- price: positive number, required
- stock: non-negative integer, required
- category: valid category ID, required
- images: array of valid URLs, max 10 images
- discount: 0-100 if provided

#### Order Validation

- items: non-empty array, each item must have valid productId and quantity > 0
- deliveryAddress: all fields required (fullName, phone, street, city, state, country, postalCode)
- totalAmount: must match sum of item subtotals

#### User Validation

- email: valid email format, unique
- password: minimum 8 characters, must contain letter and number
- phone: valid phone format (if provided)
- name: 2-100 characters, required

#### Message Validation

- text: 1-1000 characters, required
- threadId: valid thread ID, required

#### Review Validation

- rating: integer 1-5, required
- comment: 10-1000 characters, required
- productId: valid product ID, required
- userId: must have purchased the product


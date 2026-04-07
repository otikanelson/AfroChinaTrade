# Order Workflow Specification

## Overview
This document outlines the complete order workflow for the e-commerce platform, from cart management through order delivery and refunds.

## 1. Cart Management

### 1.1 Cart Operations
- **Add to Cart**: User adds product with optional variants (size, color, style)
  - Validates product exists and is active
  - Checks stock availability
  - Merges with existing cart item if same product + variants
  - Calculates discounted price if applicable
  
- **Update Quantity**: Modify item quantity in cart
  - Validates new quantity doesn't exceed stock
  - Removes item if quantity becomes 0
  
- **Remove Item**: Delete specific item from cart
  - Matches by productId and selectedVariant
  
- **Clear Cart**: Empty entire cart
  - Used after successful order placement

### 1.2 Cart Data Structure
```
Cart {
  userId: ObjectId
  items: [
    {
      productId: ObjectId
      quantity: number
      price: number (with discount applied)
      selectedVariant: { size?, color?, style? }
      addedAt: Date
    }
  ]
  totalItems: number (calculated)
  totalAmount: number (calculated)
  lastUpdated: Date
}
```

---

## 2. Checkout Flow

### 2.1 Checkout Steps (Mobile)
1. **Review Cart**: User views items, quantities, and total
2. **Select Delivery Address**: 
   - Choose from saved addresses or add new
   - Set as default if needed
3. **Select Payment Method**:
   - Choose from saved payment methods or add new
   - Set as default if needed
4. **Review Order Summary**:
   - Display items, quantities, prices
   - Show delivery address
   - Show payment method
   - Display total amount
5. **Place Order**: Submit checkout request

### 2.2 Checkout Validation
- Cart must have at least 1 item
- Delivery address must be selected and valid
- Payment method must be selected
- All products must still be in stock
- User must be authenticated

### 2.3 Checkout Endpoint
```
POST /api/orders/checkout
Body: {
  items: [{ productId, quantity, price }]
  deliveryAddressId: string
  paymentMethodId: string
}
Response: {
  success: boolean
  data: Order
  message: string
}
```

---

## 3. Order Creation

### 3.1 Order Data Structure
```
Order {
  orderId: string (auto-generated: ORD-XXXXXX)
  userId: ObjectId
  items: [
    {
      productId: ObjectId
      productName: string
      productImage: string
      quantity: number
      price: number
      subtotal: number
    }
  ]
  totalAmount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  deliveryAddress: {
    fullName: string
    phone: string
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  paymentMethod: string (payment method ID)
  trackingNumber?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}
```

### 3.2 Order Creation Process
1. Validate all required fields
2. Verify products exist and have sufficient stock
3. Calculate order total from product prices
4. Fetch delivery address from database
5. Create order with:
   - status: 'pending'
   - paymentStatus: 'pending'
   - Auto-generated orderId
6. Clear user's cart
7. Return order details to client

### 3.3 Order Endpoints
```
POST /api/orders
- Create order directly (legacy)

POST /api/orders/checkout
- Create order from cart (recommended)

GET /api/orders
- List user's orders (paginated)
- Admins can filter by customer

GET /api/orders/:id
- Get order details
- Customers can only view their own orders

DELETE /api/orders/:id
- Cancel order (pending/processing only)
```

---

## 4. Order Status Management

### 4.1 Status Transitions
```
pending ──→ processing ──→ shipped ──→ delivered
   ↓                          ↓
cancelled                  cancelled
```

### 4.2 Status Descriptions
- **pending**: Order placed, awaiting confirmation
- **processing**: Order confirmed, being prepared
- **shipped**: Order dispatched with tracking number
- **delivered**: Order received by customer
- **cancelled**: Order cancelled by customer or admin

### 4.3 Status Update Rules
- Only admins can update order status
- Invalid transitions are rejected
- Delivered and cancelled orders are immutable
- Customers can cancel pending/processing orders

### 4.4 Status Update Endpoint
```
PATCH /api/orders/:id/status
Headers: Authorization (admin/super_admin only)
Body: { status: string }
Response: { success: boolean, data: Order }
```

---

## 5. Delivery Address Management

### 5.1 Address Data Structure
```
DeliveryAddress {
  userId: ObjectId
  type: 'home' | 'work' | 'other'
  isDefault: boolean
  fullName?: string
  phoneNumber?: string
  addressLine1: string
  addressLine2?: string
  city: string (LGA)
  state: string
  country: string (default: Nigeria)
  postalCode?: string
  location?: {
    latitude: number
    longitude: number
    accuracy?: number
  }
  landmark?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### 5.2 Address Operations
- **Create**: Add new delivery address
- **Read**: Get all active addresses for user
- **Update**: Modify address details
- **Delete**: Soft delete (set isActive: false)
- **Set Default**: Only one default per user

### 5.3 Address Endpoints
```
GET /api/addresses
- List user's active addresses

POST /api/addresses
- Create new address

GET /api/addresses/:id
- Get address details

PUT /api/addresses/:id
- Update address

DELETE /api/addresses/:id
- Soft delete address

PATCH /api/addresses/:id/set-default
- Set as default address
```

---

## 6. Payment Method Management

### 6.1 Payment Method Data Structure
```
PaymentMethod {
  userId: ObjectId
  type: 'card' | 'mobile_money' | 'bank_transfer' | 'paypal'
  isDefault: boolean
  
  cardDetails?: {
    last4: string
    brand: string (visa, mastercard, etc.)
    expiryMonth: number
    expiryYear: number
    holderName: string
  }
  
  mobileMoneyDetails?: {
    provider: string (MTN, Vodafone, AirtelTigo)
    phoneNumber: string
    accountName: string
  }
  
  bankDetails?: {
    bankName: string
    accountNumber: string
    accountName: string
    routingNumber?: string
  }
  
  paypalDetails?: {
    email: string
  }
  
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### 6.2 Payment Method Operations
- **Create**: Add new payment method
- **Read**: Get all active payment methods
- **Update**: Modify payment method details
- **Delete**: Soft delete (set isActive: false)
- **Set Default**: Only one default per user

### 6.3 Payment Method Endpoints
```
GET /api/payment-methods
- List user's active payment methods

POST /api/payment-methods
- Add new payment method

GET /api/payment-methods/:id
- Get payment method details

PUT /api/payment-methods/:id
- Update payment method

DELETE /api/payment-methods/:id
- Soft delete payment method

PATCH /api/payment-methods/:id/set-default
- Set as default payment method
```

---

## 7. Shipping & Tracking

### 7.1 Tracking Number Management
- Added by admin when order status changes to 'shipped'
- Stored in order.trackingNumber field
- Displayed to customer in order details

### 7.2 Tracking Endpoint
```
PATCH /api/orders/:id/tracking
Headers: Authorization (admin/super_admin only)
Body: { trackingNumber: string }
Response: { success: boolean, data: Order }
```

### 7.3 Shipping Workflow
1. Order created with status: 'pending'
2. Admin confirms order → status: 'processing'
3. Admin ships order → status: 'shipped' + trackingNumber
4. Customer receives → Admin updates → status: 'delivered'

---

## 8. Refund Management

### 8.1 Refund Data Structure
```
Refund {
  orderId: ObjectId
  type: 'full' | 'partial'
  amount: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'processed'
  processedBy?: ObjectId (admin user)
  processedAt?: Date
  createdAt: Date
}
```

### 8.2 Refund Workflow
1. Customer requests refund for order
2. Admin reviews refund request
3. Admin approves or rejects
4. If approved, admin processes refund
5. Order paymentStatus updated to 'refunded'

### 8.3 Refund Endpoints
```
POST /api/refunds
- Create refund request
Body: { orderId, type, amount, reason }

GET /api/refunds
- List refunds (paginated, filterable by status)

GET /api/refunds/:id
- Get refund details

PATCH /api/refunds/:id/status
Headers: Authorization (admin only)
Body: { status: string }
- Update refund status
```

---

## 9. Order History & Tracking (Customer)

### 9.1 Orders Screen
- Display all user's orders
- Show order number, date, status, items preview
- Show delivery location and total amount
- Status badges with color coding:
  - pending: amber
  - processing: blue
  - shipped: purple
  - delivered: green
  - cancelled: red

### 9.2 Order Detail Screen
- Full order information
- All items with images, quantities, prices
- Delivery address
- Payment method used
- Tracking number (if shipped)
- Order notes
- Cancel button (if pending/processing)
- Refund button (if eligible)

### 9.3 Order Endpoints Used
```
GET /api/orders
- Fetch user's orders

GET /api/orders/:id
- Fetch order details
```

---

## 10. Admin Order Management

### 10.1 Admin Capabilities
- View all orders (not just their own)
- Filter orders by customer, status, date range
- Update order status
- Add tracking number
- View refund requests
- Process refunds
- Cancel orders

### 10.2 Admin Endpoints
```
GET /api/orders?customerId=xxx&status=xxx
- List orders with filters

PATCH /api/orders/:id/status
- Update order status

PATCH /api/orders/:id/tracking
- Add tracking number

GET /api/refunds
- List refund requests

PATCH /api/refunds/:id/status
- Process refund
```

---

## 11. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMER JOURNEY                         │
└─────────────────────────────────────────────────────────────┘

1. SHOPPING
   ├─ Browse Products
   ├─ Add to Cart (with variants)
   └─ Update Cart (quantity, remove items)

2. CHECKOUT
   ├─ Select/Add Delivery Address
   ├─ Select/Add Payment Method
   ├─ Review Order Summary
   └─ Place Order

3. ORDER CREATION
   ├─ Validate Cart Items & Stock
   ├─ Calculate Total
   ├─ Create Order (status: pending)
   ├─ Clear Cart
   └─ Return Order Confirmation

4. ORDER PROCESSING (Admin)
   ├─ Confirm Order (status: processing)
   ├─ Prepare Items
   ├─ Ship Order (status: shipped)
   ├─ Add Tracking Number
   └─ Notify Customer

5. DELIVERY
   ├─ Customer Receives Order
   ├─ Admin Updates Status (delivered)
   └─ Order Complete

6. POST-DELIVERY
   ├─ Leave Review
   ├─ Request Refund (if needed)
   └─ View Order History
```

---

## 12. Error Handling

### 12.1 Common Errors
- **UNAUTHORIZED**: User not authenticated
- **INSUFFICIENT_PERMISSIONS**: User lacks required role
- **MISSING_ITEMS**: Cart is empty
- **MISSING_FIELDS**: Required fields not provided
- **PRODUCT_NOT_FOUND**: Product doesn't exist
- **INSUFFICIENT_STOCK**: Not enough stock available
- **ADDRESS_NOT_FOUND**: Delivery address not found
- **ORDER_NOT_FOUND**: Order doesn't exist
- **INVALID_STATUS**: Invalid status value
- **INVALID_TRANSITION**: Cannot transition to requested status
- **ORDER_IMMUTABLE**: Cannot modify delivered/cancelled orders
- **CANNOT_CANCEL**: Order cannot be cancelled in current status

### 12.2 Error Response Format
```json
{
  "status": "error",
  "message": "Human-readable error message",
  "errorCode": "ERROR_CODE",
  "fields": { "fieldName": "Field-specific error" }
}
```

---

## 13. Security Considerations

### 13.1 Authentication & Authorization
- All endpoints require authentication token
- Customers can only access their own orders/addresses/payment methods
- Admins can access all orders and manage refunds
- Role-based access control for sensitive operations

### 13.2 Data Protection
- Payment details are tokenized/encrypted
- Sensitive data not exposed in API responses
- Soft deletes preserve data integrity
- Audit logs for admin actions (future enhancement)

### 13.3 Stock Management
- Stock validated at checkout time
- Prevents overselling
- Stock not reserved until payment confirmed (future enhancement)

---

## 14. Future Enhancements

### 14.1 Payment Processing
- Integrate with payment gateway (Paystack, Flutterwave, etc.)
- Automatic payment status updates
- Webhook handling for payment confirmations
- Payment retry logic

### 14.2 Notifications
- Email confirmation on order placement
- SMS/Email on status updates
- Tracking number notifications
- Refund status notifications

### 14.3 Inventory Management
- Stock reservation on order creation
- Automatic stock updates on order status changes
- Low stock alerts for admins
- Backorder management

### 14.4 Analytics
- Order metrics dashboard
- Sales reports
- Customer lifetime value
- Popular products analysis

### 14.5 Advanced Features
- Order scheduling/recurring orders
- Gift cards
- Coupon/discount codes
- Loyalty program integration
- Multi-vendor order splitting

---

## 15. Testing Checklist

### 15.1 Cart Operations
- [ ] Add item to cart
- [ ] Add same item with different variant
- [ ] Update item quantity
- [ ] Remove item from cart
- [ ] Clear entire cart
- [ ] Cart totals calculated correctly

### 15.2 Checkout Flow
- [ ] Checkout with valid data
- [ ] Checkout with empty cart (error)
- [ ] Checkout without address (error)
- [ ] Checkout without payment method (error)
- [ ] Stock validation at checkout
- [ ] Cart cleared after successful order

### 15.3 Order Management
- [ ] Create order successfully
- [ ] Retrieve user's orders
- [ ] Retrieve order details
- [ ] Cancel pending order
- [ ] Cancel processing order
- [ ] Cannot cancel shipped/delivered order
- [ ] Admin can update order status
- [ ] Invalid status transitions rejected

### 15.4 Address Management
- [ ] Create delivery address
- [ ] List addresses
- [ ] Update address
- [ ] Delete address (soft delete)
- [ ] Set default address
- [ ] Only one default per user

### 15.5 Payment Method Management
- [ ] Add payment method
- [ ] List payment methods
- [ ] Update payment method
- [ ] Delete payment method (soft delete)
- [ ] Set default payment method
- [ ] Only one default per user

### 15.6 Refund Management
- [ ] Create refund request
- [ ] List refunds
- [ ] Update refund status
- [ ] Order paymentStatus updated on refund processing

---

## 16. API Summary

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| POST | /api/orders | ✓ | customer | Create order |
| POST | /api/orders/checkout | ✓ | customer | Checkout from cart |
| GET | /api/orders | ✓ | customer/admin | List orders |
| GET | /api/orders/:id | ✓ | customer/admin | Get order details |
| PATCH | /api/orders/:id/status | ✓ | admin | Update status |
| PATCH | /api/orders/:id/tracking | ✓ | admin | Add tracking |
| DELETE | /api/orders/:id | ✓ | customer/admin | Cancel order |
| GET | /api/addresses | ✓ | customer | List addresses |
| POST | /api/addresses | ✓ | customer | Create address |
| PUT | /api/addresses/:id | ✓ | customer | Update address |
| DELETE | /api/addresses/:id | ✓ | customer | Delete address |
| PATCH | /api/addresses/:id/set-default | ✓ | customer | Set default |
| GET | /api/payment-methods | ✓ | customer | List methods |
| POST | /api/payment-methods | ✓ | customer | Add method |
| PUT | /api/payment-methods/:id | ✓ | customer | Update method |
| DELETE | /api/payment-methods/:id | ✓ | customer | Delete method |
| PATCH | /api/payment-methods/:id/set-default | ✓ | customer | Set default |
| POST | /api/refunds | ✓ | customer | Request refund |
| GET | /api/refunds | ✓ | admin | List refunds |
| PATCH | /api/refunds/:id/status | ✓ | admin | Process refund |


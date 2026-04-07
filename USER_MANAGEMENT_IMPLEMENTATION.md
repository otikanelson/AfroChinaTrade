# Perfect User Management Flow Implementation

## Overview
This implementation provides a comprehensive user management system with clear distinctions between suspension and blocking, admin restrictions, and support ticket functionality for appeals.

## Key Features Implemented

### 1. User Status Distinctions

#### Suspension
- **Purpose**: Temporary restriction with appeal option
- **Behavior**: 
  - Shows "You have been suspended" modal
  - Restricts account usage but allows guest features
  - User can still browse products, view orders, and access help
  - Cannot place orders, modify cart, or access account features
  - Can submit support tickets and appeals

#### Blocking
- **Purpose**: Complete account restriction
- **Behavior**:
  - Shows "You have been blocked" modal
  - Restricts ALL actions including guest features
  - User can only view the app but cannot interact
  - Cannot submit appeals or access any features

### 2. Admin Restrictions

#### Self-Management Prevention
- Admins cannot manage their own accounts
- Prevents accidental self-suspension or blocking
- Shows appropriate warning messages

#### Admin-to-Admin Restrictions
- Regular admins can view other admin accounts but cannot block them
- Only super_admin can block admin accounts
- Regular admins can suspend other admins but not block them

### 3. Support Ticket System

#### Suspension Appeals
- Suspended users can create suspension appeal tickets
- Special category: `suspension_appeal`
- Includes appeal reason field
- Appears in admin user detail view
- Admin can respond and optionally unsuspend user

#### General Support
- All users can create support tickets
- Categories: order, payment, product, account, technical, suspension_appeal, other
- Priority levels: low, medium, high, urgent
- Admin response system

## Backend Implementation

### Models Updated

#### User Model (`backend/src/models/User.ts`)
```typescript
interface IUser {
  // ... existing fields
  status: 'active' | 'suspended' | 'blocked';
  suspensionReason?: string;
  suspensionDuration?: Date;
  blockReason?: string;
  supportTickets?: mongoose.Types.ObjectId[];
}
```

#### HelpTicket Model (`backend/src/models/HelpTicket.ts`)
```typescript
interface IHelpTicket {
  // ... existing fields
  category: 'order' | 'payment' | 'product' | 'account' | 'technical' | 'suspension_appeal' | 'other';
  isSuspensionAppeal?: boolean;
  appealReason?: string;
}
```

### New Middleware

#### User Status Middleware (`backend/src/middleware/userStatus.ts`)
- `checkUserStatus`: Blocks suspended/blocked users from authenticated actions
- `allowSuspendedUsers`: Allows suspended users for guest-like features

### Controllers

#### Updated User Controller (`backend/src/controllers/userController.ts`)
- Enhanced `updateUserStatus` with admin restrictions
- Separate handling for suspension vs blocking
- Validation for admin permissions

#### New Ticket Controller (`backend/src/controllers/ticketController.ts`)
- Create, read, update tickets
- Special handling for suspension appeals
- Admin ticket management

### Routes Updated

#### User Routes (`backend/src/routes/userRoutes.ts`)
- Applied `checkUserStatus` to profile management routes
- Admin routes exempt from user status checks

#### Order Routes (`backend/src/routes/orderRoutes.ts`)
- `checkUserStatus` for order creation/modification
- `allowSuspendedUsers` for viewing orders

#### Cart Routes (`backend/src/routes/cart.ts`)
- `checkUserStatus` for cart modifications
- `allowSuspendedUsers` for viewing cart

#### New Ticket Routes (`backend/src/routes/ticketRoutes.ts`)
- User ticket creation and viewing (with `allowSuspendedUsers`)
- Admin ticket management

## Frontend Implementation

### Components

#### UserStatusModal (`mobile/components/modals/UserStatusModal.tsx`)
- Shows suspension/blocking information
- Appeal submission form for suspended users
- Different UI for suspension vs blocking

### Services

#### TicketService (`mobile/services/TicketService.ts`)
- Create and manage support tickets
- Suspension appeal functionality
- Admin ticket operations

### Screens

#### Create Ticket (`mobile/app/create-ticket.tsx`)
- Form for creating support tickets
- Special handling for suspension appeals
- Category and priority selection

#### My Tickets (`mobile/app/my-tickets.tsx`)
- List user's support tickets
- Shows ticket status and admin responses
- Highlights suspension appeals

#### Updated Admin User Detail (`mobile/app/(admin)/users/[id].tsx`)
- Separate suspend and block modals
- Admin restriction warnings
- Suspension appeals display
- Enhanced status management

### Context Updates

#### AuthContext (`mobile/contexts/AuthContext.tsx`)
- Handles user status errors from API
- Shows appropriate status modals
- Appeal submission handling

#### API Client (`mobile/services/api/apiClient.ts`)
- Enhanced error handling for user status
- Proper error propagation to auth context

## Usage Flow

### For Suspended Users
1. User attempts authenticated action
2. Backend returns `ACCOUNT_SUSPENDED` error
3. Frontend shows suspension modal with:
   - Reason for suspension
   - Duration information
   - Option to submit appeal
4. User can submit appeal through modal or help section
5. Admin sees appeal in user detail view
6. Admin can respond and optionally unsuspend

### For Blocked Users
1. User attempts any action
2. Backend returns `ACCOUNT_BLOCKED` error
3. Frontend shows blocking modal with:
   - Reason for blocking
   - Contact support information
   - No appeal option (must contact support directly)

### For Admins
1. Admin views user detail page
2. Can suspend with reason and duration
3. Can block with reason (if permissions allow)
4. Cannot manage own account
5. Cannot block other admins (unless super_admin)
6. Can view and respond to suspension appeals

## Security Considerations

1. **Middleware Order**: User status checks applied after authentication
2. **Admin Permissions**: Proper role-based restrictions
3. **Appeal Validation**: Only suspended users can create appeals
4. **Status Persistence**: User status checked on every authenticated request
5. **Guest Features**: Suspended users maintain limited access

## Testing Recommendations

1. Test suspension flow with appeal submission
2. Test blocking flow with complete restriction
3. Test admin restrictions (self-management, admin-to-admin)
4. Test middleware application across different routes
5. Test status modal display and functionality
6. Test ticket creation and admin response flow

## Future Enhancements

1. **Automatic Suspension Expiry**: Background job to reactivate users
2. **Appeal Notifications**: Real-time notifications for appeal responses
3. **Audit Logging**: Complete audit trail for admin actions
4. **Bulk User Management**: Admin tools for managing multiple users
5. **Appeal Templates**: Pre-defined appeal response templates
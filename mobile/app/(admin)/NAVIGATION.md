# Admin Dashboard Navigation Structure

This document describes the navigation structure for the admin dashboard.

## Navigation Hierarchy

```
(admin)
├── (tabs)                    # Bottom tab navigation
│   ├── products              # Products tab
│   ├── orders                # Orders tab
│   ├── messages              # Messages tab
│   └── finance               # Finance tab
├── product                   # Product detail stack
│   ├── new                   # Add new product (modal)
│   └── [id]                  # Edit product
├── order                     # Order detail stack
│   └── [id]                  # Order details
├── message                   # Message thread stack
│   └── [threadId]            # Conversation view
├── moderation                # Moderation stack
│   ├── index                 # Moderation dashboard
│   ├── reports               # Customer reports
│   ├── reviews               # Product reviews
│   └── tickets               # Support tickets
├── users                     # User management stack
│   ├── index                 # User list
│   └── [id]                  # User details
└── finance                   # Finance detail stack
    └── refunds               # Refund history
```

## Navigation Types

Type-safe navigation types are defined in `mobile/types/navigation.ts`:

- `AdminStackParamList`: Defines all admin stack routes with their parameters
- `TabParamList`: Defines the bottom tab routes

## Header Styling

All stack screens use consistent header styling:
- Background color: `theme.colors.primary`
- Text color: `theme.colors.background`
- Font weight: `theme.fontWeights.semibold`
- Back button: Visible with default behavior

## Usage Examples

### Navigate to product detail
```typescript
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/product/123'); // Edit product with ID 123
router.push('/product/new'); // Add new product (modal)
```

### Navigate to order detail
```typescript
router.push('/order/456'); // View order with ID 456
```

### Navigate to message thread
```typescript
router.push('/message/789'); // View conversation with thread ID 789
```

### Navigate to user detail
```typescript
router.push('/users/101'); // View user with ID 101
```

## Implementation Status

- ✅ Navigation structure created
- ✅ Type-safe routing configured
- ✅ Consistent header styling applied
- ⏳ Screen implementations (to be completed in subsequent tasks)

## Notes

- All detail screens are placeholder implementations that will be completed in their respective tasks
- The product "new" screen uses modal presentation for better UX
- All stack layouts have `headerBackTitleVisible: false` for cleaner navigation

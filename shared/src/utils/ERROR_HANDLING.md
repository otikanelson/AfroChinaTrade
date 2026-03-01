# Error Handling and Toast Notification System

This document describes the error handling and toast notification system for the AfroChinaTrade platform.

## ServiceError Class

The `ServiceError` class provides standardized error handling across all services.

### Usage

```typescript
import { ServiceError, ERROR_CODES } from '@afrochinatrade/shared';

// Create a custom error
throw new ServiceError('Product not found', ERROR_CODES.NOT_FOUND, 404);
```

### Error Codes

The following error codes are available:

- `NOT_FOUND` - Resource not found (404)
- `VALIDATION_ERROR` - Validation failed (400)
- `DUPLICATE_ENTRY` - Duplicate entry (409)
- `STORAGE_FULL` - Storage capacity exceeded (507)
- `PARSE_ERROR` - Failed to parse data (400)
- `UNAUTHORIZED` - Unauthorized access (401)
- `FORBIDDEN` - Access forbidden (403)
- `NETWORK_ERROR` - Network error (500)
- `UNKNOWN_ERROR` - Unknown error (500)

### Error Factory Functions

Convenience functions for creating common errors:

```typescript
import {
  createNotFoundError,
  createValidationError,
  createDuplicateError,
  createStorageFullError,
  createParseError,
  createUnauthorizedError,
  createForbiddenError,
} from '@afrochinatrade/shared';

// Create specific errors
const error1 = createNotFoundError('Product', '123');
const error2 = createValidationError('Invalid email format');
const error3 = createDuplicateError('User', 'email');
```

## handleServiceOperation Wrapper

The `handleServiceOperation` function wraps service operations and provides consistent error handling:

```typescript
import { handleServiceOperation } from '@afrochinatrade/shared';

async function getProduct(id: string) {
  return handleServiceOperation(async () => {
    const product = await storage.get(`product:${id}`);
    if (!product) {
      throw createNotFoundError('Product', id);
    }
    return product;
  });
}

// Returns: { success: true, data: product } or { success: false, error: 'message' }
```

## Toast Notification System

The toast notification system provides a platform-agnostic way to display messages to users.

### Shared Toast Interface

```typescript
import { toast, showErrorToast, showSuccessToast } from '@afrochinatrade/shared';

// Show different types of toasts
toast.success('Product added to cart');
toast.error('Failed to load products');
toast.warning('Low stock available');
toast.info('New features available');

// Show toast with title
toast.success('Product added', 'Success');

// Helper functions
showSuccessToast('Operation completed');
showErrorToast(new Error('Something went wrong'));
```

### Platform-Specific Implementations

#### Web (Admin Dashboard)

```typescript
import { setToastManager } from '@afrochinatrade/shared';
import { webToastManager } from './utils/toast';

// Initialize in your app entry point
setToastManager(webToastManager);
```

The web implementation uses DOM-based toasts with animations.

#### Mobile (React Native)

```typescript
import { setToastManager } from '@afrochinatrade/shared';
import { mobileToastManager, ToastContainer } from './utils/toast';

// Initialize in your app entry point
setToastManager(mobileToastManager);

// Add ToastContainer to your root component
function App() {
  return (
    <>
      <YourAppContent />
      <ToastContainer />
    </>
  );
}
```

The mobile implementation uses React Native Animated API for smooth animations.

### Custom Toast Manager

You can create a custom toast manager by implementing the `ToastManager` interface:

```typescript
import { ToastManager, setToastManager } from '@afrochinatrade/shared';

class CustomToastManager implements ToastManager {
  show(options: ToastOptions): void {
    // Your implementation
  }

  success(message: string, title?: string): void {
    this.show({ type: 'success', message, title });
  }

  error(message: string, title?: string): void {
    this.show({ type: 'error', message, title });
  }

  warning(message: string, title?: string): void {
    this.show({ type: 'warning', message, title });
  }

  info(message: string, title?: string): void {
    this.show({ type: 'info', message, title });
  }
}

setToastManager(new CustomToastManager());
```

## Integration with Services

Services should use both error handling and toast notifications:

```typescript
import {
  handleServiceOperation,
  createNotFoundError,
  showErrorToast,
  showSuccessToast,
} from '@afrochinatrade/shared';

class ProductService {
  async deleteProduct(id: string) {
    const result = await handleServiceOperation(async () => {
      const product = await this.getProduct(id);
      if (!product) {
        throw createNotFoundError('Product', id);
      }
      await storage.remove(`product:${id}`);
      return true;
    });

    if (result.success) {
      showSuccessToast('Product deleted successfully');
    } else {
      showErrorToast(result.error || 'Failed to delete product');
    }

    return result;
  }
}
```

## Best Practices

1. **Always use ServiceError for service-level errors** - This ensures consistent error handling
2. **Use error factory functions** - They provide correct status codes and error codes
3. **Wrap service operations with handleServiceOperation** - This provides consistent response format
4. **Show toasts for user-facing operations** - Keep users informed of success/failure
5. **Don't show toasts for background operations** - Only show for user-initiated actions
6. **Use appropriate toast types** - success for completions, error for failures, warning for cautions, info for notifications
7. **Keep toast messages concise** - Users should understand the message at a glance
8. **Include actionable information** - Tell users what happened and what they can do

## Storage Quota Checking

The system includes a utility to check storage quota:

```typescript
import { checkStorageQuota } from '@afrochinatrade/shared';

// Check storage quota (only works in browsers with Storage API)
await checkStorageQuota();
// Logs warning if storage is >90% full
```

This should be called periodically or before large storage operations.

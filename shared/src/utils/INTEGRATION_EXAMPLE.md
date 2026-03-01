# Integration Examples

This document provides examples of how to integrate the error handling and toast notification system into your services and components.

## Service Integration Example

Here's how to integrate error handling into a service:

```typescript
import { StorageAdapter } from '../services/storage/StorageAdapter';
import { Product } from '../types/entities';
import { ServiceResponse } from '../types/service';
import {
  handleServiceOperation,
  createNotFoundError,
  createValidationError,
  ServiceError,
  ERROR_CODES,
} from '../utils/ServiceError';

export class ProductService {
  private storage: StorageAdapter;
  private PRODUCTS_KEY = 'products';

  constructor(storage: StorageAdapter) {
    this.storage = storage;
  }

  /**
   * Get a product by ID
   * Uses handleServiceOperation for consistent error handling
   */
  async getProduct(id: string): Promise<ServiceResponse<Product>> {
    return handleServiceOperation(async () => {
      const products = await this.storage.get<Product[]>(this.PRODUCTS_KEY) || [];
      const product = products.find(p => p.id === id);
      
      if (!product) {
        throw createNotFoundError('Product', id);
      }
      
      return product;
    });
  }

  /**
   * Create a new product
   * Includes validation and error handling
   */
  async createProduct(productData: Omit<Product, 'id'>): Promise<ServiceResponse<Product>> {
    return handleServiceOperation(async () => {
      // Validate product data
      if (!productData.name || productData.name.length < 3) {
        throw createValidationError('Product name must be at least 3 characters');
      }
      
      if (productData.price <= 0) {
        throw createValidationError('Product price must be greater than 0');
      }

      // Check for duplicate
      const products = await this.storage.get<Product[]>(this.PRODUCTS_KEY) || [];
      const duplicate = products.find(p => p.name === productData.name);
      
      if (duplicate) {
        throw new ServiceError(
          'Product with this name already exists',
          ERROR_CODES.DUPLICATE_ENTRY,
          409
        );
      }

      // Create product
      const product: Product = {
        ...productData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      products.push(product);
      await this.storage.set(this.PRODUCTS_KEY, products);
      
      return product;
    });
  }

  /**
   * Delete a product
   * Shows how to handle cascading operations
   */
  async deleteProduct(id: string): Promise<ServiceResponse<void>> {
    return handleServiceOperation(async () => {
      const products = await this.storage.get<Product[]>(this.PRODUCTS_KEY) || [];
      const index = products.findIndex(p => p.id === id);
      
      if (index === -1) {
        throw createNotFoundError('Product', id);
      }

      products.splice(index, 1);
      await this.storage.set(this.PRODUCTS_KEY, products);
    });
  }
}
```

## Component Integration Example (React)

### Admin Dashboard Component

```typescript
import React, { useState } from 'react';
import { toast, showErrorToast, showSuccessToast } from '@afrochinatrade/shared';
import { ProductService } from '../services/ProductService';

export const ProductForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await productService.createProduct(formData);
      
      if (result.success) {
        showSuccessToast('Product created successfully');
        // Reset form or navigate
      } else {
        showErrorToast(result.error || 'Failed to create product');
      }
    } catch (error) {
      showErrorToast(error as Error, 'Unexpected Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  );
};
```

### Mobile Component (React Native)

```typescript
import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { toast, showErrorToast, showSuccessToast } from '@afrochinatrade/shared';
import { ProductService } from '../services/ProductService';

export const AddToCartButton: React.FC<{ productId: string }> = ({ productId }) => {
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    setLoading(true);

    try {
      const result = await cartService.addToCart(productId);
      
      if (result.success) {
        toast.success('Added to cart');
      } else {
        toast.error(result.error || 'Failed to add to cart');
      }
    } catch (error) {
      showErrorToast(error as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      title={loading ? 'Adding...' : 'Add to Cart'}
      onPress={handleAddToCart}
      disabled={loading}
    />
  );
};
```

## Context Integration Example

```typescript
import React, { createContext, useContext, useState } from 'react';
import { toast, showErrorToast } from '@afrochinatrade/shared';
import { UserService } from '../services/UserService';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await userService.login(email, password);
    
    if (result.success && result.data) {
      setUser(result.data);
      toast.success('Welcome back!');
      return true;
    } else {
      showErrorToast(result.error || 'Login failed', 'Authentication Error');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    toast.info('You have been logged out');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## App Initialization

### Admin Dashboard (main.tsx)

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initToast } from './utils/initToast';

// Initialize toast system
initToast();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Mobile App (App.tsx)

```typescript
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ToastContainer } from './utils/toast';
import { initToast } from './utils/initToast';
import { RootNavigator } from './navigation/RootNavigator';

export default function App() {
  useEffect(() => {
    // Initialize toast system
    initToast();
  }, []);

  return (
    <NavigationContainer>
      <RootNavigator />
      <ToastContainer />
    </NavigationContainer>
  );
}
```

## Error Handling Patterns

### Pattern 1: Simple Operation

```typescript
const result = await handleServiceOperation(async () => {
  // Your operation
  return data;
});

if (result.success) {
  // Handle success
} else {
  // Handle error
  showErrorToast(result.error);
}
```

### Pattern 2: With User Feedback

```typescript
const result = await productService.deleteProduct(id);

if (result.success) {
  showSuccessToast('Product deleted');
  navigate('/products');
} else {
  showErrorToast(result.error, 'Delete Failed');
}
```

### Pattern 3: Silent Failure (Background Operations)

```typescript
const result = await analyticsService.trackEvent(event);

if (!result.success) {
  // Log error but don't show toast
  console.error('Analytics tracking failed:', result.error);
}
```

### Pattern 4: Retry Logic

```typescript
const retryOperation = async (maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    const result = await operation();
    
    if (result.success) {
      return result;
    }
    
    if (i === maxRetries - 1) {
      showErrorToast('Operation failed after multiple attempts');
    }
  }
};
```

## Testing with Error Handling

```typescript
import { ServiceError, ERROR_CODES } from '../utils/ServiceError';

describe('ProductService', () => {
  it('should throw not found error for invalid product ID', async () => {
    const result = await productService.getProduct('invalid-id');
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('should throw validation error for invalid product data', async () => {
    const result = await productService.createProduct({ name: 'A', price: -10 });
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('validation');
  });
});
```

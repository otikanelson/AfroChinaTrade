/**
 * Validation utilities for all entity types
 * Provides comprehensive validation rules for data integrity
 */

import {
  Product,
  Category,
  User,
  Order,
  Supplier,
  OrderItem,
  DeliveryAddress,
} from '../types/entities';

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Email validation regex pattern
 * Validates standard email format
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone validation regex pattern
 * Validates Nigerian phone numbers (+234 format)
 */
const PHONE_REGEX = /^\+234\d{10}$/;

/**
 * URL validation regex pattern
 * Validates HTTP/HTTPS URLs
 */
const URL_REGEX = /^https?:\/\/.+/;

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Validates phone number format
 */
export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone);
}

/**
 * Validates URL format
 */
export function isValidUrl(url: string): boolean {
  return URL_REGEX.test(url);
}

/**
 * Validates ISO date string format
 */
export function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString === date.toISOString();
}

/**
 * Validates Product entity
 * 
 * Validation Rules:
 * - name: Required, 3-200 characters
 * - description: Required, 10-2000 characters
 * - price: Required, positive number, max 2 decimal places
 * - images: Required, at least 1 image URL
 * - categoryId: Required, non-empty string
 * - supplierId: Required, non-empty string
 * - stock: Required, non-negative integer
 * - rating: Optional, 0-5 range
 * - reviewCount: Optional, non-negative integer
 */
export function validateProduct(product: Partial<Product>): ValidationResult {
  const errors: string[] = [];

  // Name validation
  if (!product.name) {
    errors.push('Product name is required');
  } else if (product.name.length < 3) {
    errors.push('Product name must be at least 3 characters');
  } else if (product.name.length > 200) {
    errors.push('Product name must not exceed 200 characters');
  }

  // Description validation
  if (!product.description) {
    errors.push('Product description is required');
  } else if (product.description.length < 10) {
    errors.push('Product description must be at least 10 characters');
  } else if (product.description.length > 2000) {
    errors.push('Product description must not exceed 2000 characters');
  }

  // Price validation
  if (product.price === undefined || product.price === null) {
    errors.push('Product price is required');
  } else if (typeof product.price !== 'number') {
    errors.push('Product price must be a number');
  } else if (product.price <= 0) {
    errors.push('Product price must be greater than 0');
  } else if (!Number.isFinite(product.price)) {
    errors.push('Product price must be a finite number');
  } else {
    // Check for max 2 decimal places
    const decimalPlaces = (product.price.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      errors.push('Product price must have at most 2 decimal places');
    }
  }

  // Images validation
  if (!product.images || !Array.isArray(product.images)) {
    errors.push('Product images are required');
  } else if (product.images.length === 0) {
    errors.push('Product must have at least 1 image');
  } else {
    // Validate each image URL
    product.images.forEach((url, index) => {
      if (typeof url !== 'string' || url.trim() === '') {
        errors.push(`Product image at index ${index} must be a non-empty string`);
      }
    });
  }

  // CategoryId validation
  if (!product.categoryId) {
    errors.push('Product categoryId is required');
  } else if (typeof product.categoryId !== 'string' || product.categoryId.trim() === '') {
    errors.push('Product categoryId must be a non-empty string');
  }

  // SupplierId validation
  if (!product.supplierId) {
    errors.push('Product supplierId is required');
  } else if (typeof product.supplierId !== 'string' || product.supplierId.trim() === '') {
    errors.push('Product supplierId must be a non-empty string');
  }

  // Stock validation
  if (product.stock === undefined || product.stock === null) {
    errors.push('Product stock is required');
  } else if (typeof product.stock !== 'number') {
    errors.push('Product stock must be a number');
  } else if (product.stock < 0) {
    errors.push('Product stock must be non-negative');
  } else if (!Number.isInteger(product.stock)) {
    errors.push('Product stock must be an integer');
  }

  // Rating validation (optional)
  if (product.rating !== undefined && product.rating !== null) {
    if (typeof product.rating !== 'number') {
      errors.push('Product rating must be a number');
    } else if (product.rating < 0 || product.rating > 5) {
      errors.push('Product rating must be between 0 and 5');
    }
  }

  // ReviewCount validation (optional)
  if (product.reviewCount !== undefined && product.reviewCount !== null) {
    if (typeof product.reviewCount !== 'number') {
      errors.push('Product reviewCount must be a number');
    } else if (product.reviewCount < 0) {
      errors.push('Product reviewCount must be non-negative');
    } else if (!Number.isInteger(product.reviewCount)) {
      errors.push('Product reviewCount must be an integer');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates Category entity
 * 
 * Validation Rules:
 * - name: Required, 2-100 characters, unique
 * - description: Required, 10-500 characters
 * - imageUrl: Optional, valid URL format
 */
export function validateCategory(category: Partial<Category>): ValidationResult {
  const errors: string[] = [];

  // Name validation
  if (!category.name) {
    errors.push('Category name is required');
  } else if (category.name.length < 2) {
    errors.push('Category name must be at least 2 characters');
  } else if (category.name.length > 100) {
    errors.push('Category name must not exceed 100 characters');
  }

  // Description validation
  if (!category.description) {
    errors.push('Category description is required');
  } else if (category.description.length < 10) {
    errors.push('Category description must be at least 10 characters');
  } else if (category.description.length > 500) {
    errors.push('Category description must not exceed 500 characters');
  }

  // ImageUrl validation (optional)
  if (category.imageUrl !== undefined && category.imageUrl !== null) {
    if (typeof category.imageUrl !== 'string') {
      errors.push('Category imageUrl must be a string');
    } else if (category.imageUrl.trim() !== '' && !isValidUrl(category.imageUrl)) {
      errors.push('Category imageUrl must be a valid URL');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates User entity
 * 
 * Validation Rules:
 * - name: Required, 2-100 characters
 * - email: Required, valid email format, unique
 * - password: Required, minimum 8 characters
 * - phone: Optional, valid phone format
 * - address: Optional, 10-500 characters if provided
 * - status: Required, enum value ('active' | 'blocked')
 */
export function validateUser(user: Partial<User>): ValidationResult {
  const errors: string[] = [];

  // Name validation
  if (!user.name) {
    errors.push('User name is required');
  } else if (user.name.length < 2) {
    errors.push('User name must be at least 2 characters');
  } else if (user.name.length > 100) {
    errors.push('User name must not exceed 100 characters');
  }

  // Email validation
  if (!user.email) {
    errors.push('User email is required');
  } else if (!isValidEmail(user.email)) {
    errors.push('User email must be a valid email address');
  }

  // Password validation
  if (!user.password) {
    errors.push('User password is required');
  } else if (user.password.length < 8) {
    errors.push('User password must be at least 8 characters');
  }

  // Phone validation (optional)
  if (user.phone !== undefined && user.phone !== null && user.phone !== '') {
    if (!isValidPhone(user.phone)) {
      errors.push('User phone must be a valid phone number (format: +234XXXXXXXXXX)');
    }
  }

  // Address validation (optional)
  if (user.address !== undefined && user.address !== null && user.address !== '') {
    if (user.address.length < 10) {
      errors.push('User address must be at least 10 characters');
    } else if (user.address.length > 500) {
      errors.push('User address must not exceed 500 characters');
    }
  }

  // Status validation
  if (!user.status) {
    errors.push('User status is required');
  } else if (user.status !== 'active' && user.status !== 'blocked') {
    errors.push('User status must be either "active" or "blocked"');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates DeliveryAddress
 * 
 * Validation Rules:
 * - All fields are required
 * - fullName: 2-100 characters
 * - phone: Valid phone format
 * - address: 10-500 characters
 * - city: 2-100 characters
 * - state: 2-100 characters
 * - zipCode: 5-10 characters
 */
export function validateDeliveryAddress(address: Partial<DeliveryAddress>): ValidationResult {
  const errors: string[] = [];

  // FullName validation
  if (!address.fullName) {
    errors.push('Delivery address fullName is required');
  } else if (address.fullName.length < 2) {
    errors.push('Delivery address fullName must be at least 2 characters');
  } else if (address.fullName.length > 100) {
    errors.push('Delivery address fullName must not exceed 100 characters');
  }

  // Phone validation
  if (!address.phone) {
    errors.push('Delivery address phone is required');
  } else if (!isValidPhone(address.phone)) {
    errors.push('Delivery address phone must be a valid phone number (format: +234XXXXXXXXXX)');
  }

  // Address validation
  if (!address.address) {
    errors.push('Delivery address address is required');
  } else if (address.address.length < 10) {
    errors.push('Delivery address address must be at least 10 characters');
  } else if (address.address.length > 500) {
    errors.push('Delivery address address must not exceed 500 characters');
  }

  // City validation
  if (!address.city) {
    errors.push('Delivery address city is required');
  } else if (address.city.length < 2) {
    errors.push('Delivery address city must be at least 2 characters');
  } else if (address.city.length > 100) {
    errors.push('Delivery address city must not exceed 100 characters');
  }

  // State validation
  if (!address.state) {
    errors.push('Delivery address state is required');
  } else if (address.state.length < 2) {
    errors.push('Delivery address state must be at least 2 characters');
  } else if (address.state.length > 100) {
    errors.push('Delivery address state must not exceed 100 characters');
  }

  // ZipCode validation
  if (!address.zipCode) {
    errors.push('Delivery address zipCode is required');
  } else if (address.zipCode.length < 5) {
    errors.push('Delivery address zipCode must be at least 5 characters');
  } else if (address.zipCode.length > 10) {
    errors.push('Delivery address zipCode must not exceed 10 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates OrderItem
 * 
 * Validation Rules:
 * - productId: Required, non-empty string
 * - productName: Required, non-empty string
 * - productImage: Required, non-empty string
 * - quantity: Required, positive integer
 * - price: Required, positive number
 * - subtotal: Required, positive number, must equal price * quantity
 */
export function validateOrderItem(item: Partial<OrderItem>): ValidationResult {
  const errors: string[] = [];

  // ProductId validation
  if (!item.productId) {
    errors.push('OrderItem productId is required');
  } else if (typeof item.productId !== 'string' || item.productId.trim() === '') {
    errors.push('OrderItem productId must be a non-empty string');
  }

  // ProductName validation
  if (!item.productName) {
    errors.push('OrderItem productName is required');
  } else if (typeof item.productName !== 'string' || item.productName.trim() === '') {
    errors.push('OrderItem productName must be a non-empty string');
  }

  // ProductImage validation
  if (!item.productImage) {
    errors.push('OrderItem productImage is required');
  } else if (typeof item.productImage !== 'string' || item.productImage.trim() === '') {
    errors.push('OrderItem productImage must be a non-empty string');
  }

  // Quantity validation
  if (item.quantity === undefined || item.quantity === null) {
    errors.push('OrderItem quantity is required');
  } else if (typeof item.quantity !== 'number') {
    errors.push('OrderItem quantity must be a number');
  } else if (item.quantity <= 0) {
    errors.push('OrderItem quantity must be greater than 0');
  } else if (!Number.isInteger(item.quantity)) {
    errors.push('OrderItem quantity must be an integer');
  }

  // Price validation
  if (item.price === undefined || item.price === null) {
    errors.push('OrderItem price is required');
  } else if (typeof item.price !== 'number') {
    errors.push('OrderItem price must be a number');
  } else if (item.price <= 0) {
    errors.push('OrderItem price must be greater than 0');
  }

  // Subtotal validation
  if (item.subtotal === undefined || item.subtotal === null) {
    errors.push('OrderItem subtotal is required');
  } else if (typeof item.subtotal !== 'number') {
    errors.push('OrderItem subtotal must be a number');
  } else if (item.subtotal <= 0) {
    errors.push('OrderItem subtotal must be greater than 0');
  } else if (item.price && item.quantity) {
    // Validate subtotal calculation
    const expectedSubtotal = item.price * item.quantity;
    // Allow small floating point differences
    if (Math.abs(item.subtotal - expectedSubtotal) > 0.01) {
      errors.push('OrderItem subtotal must equal price * quantity');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates Order entity
 * 
 * Validation Rules:
 * - userId: Required, non-empty string
 * - items: Required, at least 1 item, all items must be valid
 * - totalAmount: Required, positive number
 * - status: Required, enum value
 * - deliveryAddress: Required, must be valid
 */
export function validateOrder(order: Partial<Order>): ValidationResult {
  const errors: string[] = [];

  // UserId validation
  if (!order.userId) {
    errors.push('Order userId is required');
  } else if (typeof order.userId !== 'string' || order.userId.trim() === '') {
    errors.push('Order userId must be a non-empty string');
  }

  // Items validation
  if (!order.items || !Array.isArray(order.items)) {
    errors.push('Order items are required');
  } else if (order.items.length === 0) {
    errors.push('Order must have at least 1 item');
  } else {
    // Validate each order item
    order.items.forEach((item, index) => {
      const itemValidation = validateOrderItem(item);
      if (!itemValidation.valid) {
        itemValidation.errors.forEach(error => {
          errors.push(`Order item ${index}: ${error}`);
        });
      }
    });
  }

  // TotalAmount validation
  if (order.totalAmount === undefined || order.totalAmount === null) {
    errors.push('Order totalAmount is required');
  } else if (typeof order.totalAmount !== 'number') {
    errors.push('Order totalAmount must be a number');
  } else if (order.totalAmount <= 0) {
    errors.push('Order totalAmount must be greater than 0');
  } else if (order.items && Array.isArray(order.items) && order.items.length > 0) {
    // Validate totalAmount calculation
    const calculatedTotal = order.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    // Allow small floating point differences
    if (Math.abs(order.totalAmount - calculatedTotal) > 0.01) {
      errors.push('Order totalAmount must equal the sum of all item subtotals');
    }
  }

  // Status validation
  if (!order.status) {
    errors.push('Order status is required');
  } else {
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(order.status)) {
      errors.push('Order status must be one of: pending, processing, shipped, delivered, cancelled');
    }
  }

  // DeliveryAddress validation
  if (!order.deliveryAddress) {
    errors.push('Order deliveryAddress is required');
  } else {
    const addressValidation = validateDeliveryAddress(order.deliveryAddress);
    if (!addressValidation.valid) {
      addressValidation.errors.forEach(error => {
        errors.push(error);
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates Supplier entity
 * 
 * Validation Rules:
 * - name: Required, 2-200 characters
 * - email: Required, valid email format, unique
 * - phone: Required, valid phone format
 * - address: Required, 10-500 characters
 * - verified: Required, boolean
 * - rating: Optional, 0-5 range
 * - reviewCount: Optional, non-negative integer
 */
export function validateSupplier(supplier: Partial<Supplier>): ValidationResult {
  const errors: string[] = [];

  // Name validation
  if (!supplier.name) {
    errors.push('Supplier name is required');
  } else if (supplier.name.length < 2) {
    errors.push('Supplier name must be at least 2 characters');
  } else if (supplier.name.length > 200) {
    errors.push('Supplier name must not exceed 200 characters');
  }

  // Email validation
  if (!supplier.email) {
    errors.push('Supplier email is required');
  } else if (!isValidEmail(supplier.email)) {
    errors.push('Supplier email must be a valid email address');
  }

  // Phone validation
  if (!supplier.phone) {
    errors.push('Supplier phone is required');
  } else if (!isValidPhone(supplier.phone)) {
    errors.push('Supplier phone must be a valid phone number (format: +234XXXXXXXXXX)');
  }

  // Address validation
  if (!supplier.address) {
    errors.push('Supplier address is required');
  } else if (supplier.address.length < 10) {
    errors.push('Supplier address must be at least 10 characters');
  } else if (supplier.address.length > 500) {
    errors.push('Supplier address must not exceed 500 characters');
  }

  // Verified validation
  if (supplier.verified === undefined || supplier.verified === null) {
    errors.push('Supplier verified status is required');
  } else if (typeof supplier.verified !== 'boolean') {
    errors.push('Supplier verified must be a boolean');
  }

  // Rating validation (optional)
  if (supplier.rating !== undefined && supplier.rating !== null) {
    if (typeof supplier.rating !== 'number') {
      errors.push('Supplier rating must be a number');
    } else if (supplier.rating < 0 || supplier.rating > 5) {
      errors.push('Supplier rating must be between 0 and 5');
    }
  }

  // ReviewCount validation (optional)
  if (supplier.reviewCount !== undefined && supplier.reviewCount !== null) {
    if (typeof supplier.reviewCount !== 'number') {
      errors.push('Supplier reviewCount must be a number');
    } else if (supplier.reviewCount < 0) {
      errors.push('Supplier reviewCount must be non-negative');
    } else if (!Number.isInteger(supplier.reviewCount)) {
      errors.push('Supplier reviewCount must be an integer');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

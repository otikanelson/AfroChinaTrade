import {
  validateProduct,
  validateCategory,
  validateUser,
  validateOrder,
  validateSupplier,
  validateDeliveryAddress,
  validateOrderItem,
  isValidEmail,
  isValidPhone,
  isValidUrl,
} from '../validation';
import { Product, Category, User, Order, Supplier, DeliveryAddress, OrderItem } from '../../types/entities';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('invalid@domain')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct Nigerian phone format', () => {
      expect(isValidPhone('+2341234567890')).toBe(true);
      expect(isValidPhone('+2349876543210')).toBe(true);
    });

    it('should reject invalid phone formats', () => {
      expect(isValidPhone('1234567890')).toBe(false);
      expect(isValidPhone('+234123456789')).toBe(false); // too short
      expect(isValidPhone('+23412345678901')).toBe(false); // too long
      expect(isValidPhone('234123456789')).toBe(false); // missing +
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URL formats', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com/path')).toBe(true);
      expect(isValidUrl('https://example.com/path?query=value')).toBe(true);
    });

    it('should reject invalid URL formats', () => {
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('validateProduct', () => {
    const validProduct: Partial<Product> = {
      name: 'Test Product',
      description: 'This is a test product description with enough characters',
      price: 99.99,
      images: ['https://example.com/image1.jpg'],
      categoryId: 'cat_123',
      supplierId: 'sup_456',
      stock: 10,
      rating: 4.5,
      reviewCount: 100,
    };

    it('should validate a correct product', () => {
      const result = validateProduct(validProduct);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject product with missing name', () => {
      const product = { ...validProduct, name: undefined };
      const result = validateProduct(product);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product name is required');
    });

    it('should reject product with short name', () => {
      const product = { ...validProduct, name: 'AB' };
      const result = validateProduct(product);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product name must be at least 3 characters');
    });

    it('should reject product with long name', () => {
      const product = { ...validProduct, name: 'A'.repeat(201) };
      const result = validateProduct(product);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product name must not exceed 200 characters');
    });

    it('should reject product with short description', () => {
      const product = { ...validProduct, description: 'Short' };
      const result = validateProduct(product);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product description must be at least 10 characters');
    });

    it('should reject product with negative price', () => {
      const product = { ...validProduct, price: -10 };
      const result = validateProduct(product);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product price must be greater than 0');
    });

    it('should reject product with zero price', () => {
      const product = { ...validProduct, price: 0 };
      const result = validateProduct(product);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product price must be greater than 0');
    });

    it('should reject product with too many decimal places', () => {
      const product = { ...validProduct, price: 99.999 };
      const result = validateProduct(product);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product price must have at most 2 decimal places');
    });

    it('should reject product with empty images array', () => {
      const product = { ...validProduct, images: [] };
      const result = validateProduct(product);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product must have at least 1 image');
    });

    it('should reject product with negative stock', () => {
      const product = { ...validProduct, stock: -5 };
      const result = validateProduct(product);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product stock must be non-negative');
    });

    it('should reject product with non-integer stock', () => {
      const product = { ...validProduct, stock: 10.5 };
      const result = validateProduct(product);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product stock must be an integer');
    });

    it('should reject product with rating out of range', () => {
      const product = { ...validProduct, rating: 6 };
      const result = validateProduct(product);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product rating must be between 0 and 5');
    });
  });

  describe('validateCategory', () => {
    const validCategory: Partial<Category> = {
      name: 'Electronics',
      description: 'Electronic devices and accessories for everyday use',
      imageUrl: 'https://example.com/category.jpg',
    };

    it('should validate a correct category', () => {
      const result = validateCategory(validCategory);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject category with missing name', () => {
      const category = { ...validCategory, name: undefined };
      const result = validateCategory(category);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Category name is required');
    });

    it('should reject category with short name', () => {
      const category = { ...validCategory, name: 'A' };
      const result = validateCategory(category);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Category name must be at least 2 characters');
    });

    it('should reject category with short description', () => {
      const category = { ...validCategory, description: 'Short' };
      const result = validateCategory(category);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Category description must be at least 10 characters');
    });

    it('should accept category without imageUrl', () => {
      const category = { ...validCategory, imageUrl: undefined };
      const result = validateCategory(category);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateUser', () => {
    const validUser: Partial<User> = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      phone: '+2341234567890',
      address: '123 Main Street, Lagos, Nigeria',
      status: 'active',
    };

    it('should validate a correct user', () => {
      const result = validateUser(validUser);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject user with invalid email', () => {
      const user = { ...validUser, email: 'invalid-email' };
      const result = validateUser(user);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('User email must be a valid email address');
    });

    it('should reject user with short password', () => {
      const user = { ...validUser, password: 'short' };
      const result = validateUser(user);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('User password must be at least 8 characters');
    });

    it('should reject user with invalid phone', () => {
      const user = { ...validUser, phone: '1234567890' };
      const result = validateUser(user);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('User phone must be a valid phone number (format: +234XXXXXXXXXX)');
    });

    it('should reject user with invalid status', () => {
      const user = { ...validUser, status: 'invalid' as any };
      const result = validateUser(user);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('User status must be either "active" or "blocked"');
    });

    it('should accept user without optional phone', () => {
      const user = { ...validUser, phone: undefined };
      const result = validateUser(user);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateDeliveryAddress', () => {
    const validAddress: Partial<DeliveryAddress> = {
      fullName: 'John Doe',
      phone: '+2341234567890',
      address: '123 Main Street, Apartment 4B',
      city: 'Lagos',
      state: 'Lagos State',
      zipCode: '100001',
    };

    it('should validate a correct delivery address', () => {
      const result = validateDeliveryAddress(validAddress);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject address with missing fullName', () => {
      const address = { ...validAddress, fullName: undefined };
      const result = validateDeliveryAddress(address);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Delivery address fullName is required');
    });

    it('should reject address with invalid phone', () => {
      const address = { ...validAddress, phone: '1234567890' };
      const result = validateDeliveryAddress(address);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Delivery address phone must be a valid phone number (format: +234XXXXXXXXXX)');
    });

    it('should reject address with short address field', () => {
      const address = { ...validAddress, address: 'Short' };
      const result = validateDeliveryAddress(address);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Delivery address address must be at least 10 characters');
    });
  });

  describe('validateOrderItem', () => {
    const validOrderItem: Partial<OrderItem> = {
      productId: 'prod_123',
      productName: 'Test Product',
      productImage: 'https://example.com/image.jpg',
      quantity: 2,
      price: 50.00,
      subtotal: 100.00,
    };

    it('should validate a correct order item', () => {
      const result = validateOrderItem(validOrderItem);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject order item with zero quantity', () => {
      const item = { ...validOrderItem, quantity: 0 };
      const result = validateOrderItem(item);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('OrderItem quantity must be greater than 0');
    });

    it('should reject order item with incorrect subtotal', () => {
      const item = { ...validOrderItem, subtotal: 150.00 };
      const result = validateOrderItem(item);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('OrderItem subtotal must equal price * quantity');
    });

    it('should reject order item with non-integer quantity', () => {
      const item = { ...validOrderItem, quantity: 2.5 };
      const result = validateOrderItem(item);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('OrderItem quantity must be an integer');
    });
  });

  describe('validateOrder', () => {
    const validOrderItem: OrderItem = {
      productId: 'prod_123',
      productName: 'Test Product',
      productImage: 'https://example.com/image.jpg',
      quantity: 2,
      price: 50.00,
      subtotal: 100.00,
    };

    const validDeliveryAddress: DeliveryAddress = {
      fullName: 'John Doe',
      phone: '+2341234567890',
      address: '123 Main Street, Apartment 4B',
      city: 'Lagos',
      state: 'Lagos State',
      zipCode: '100001',
    };

    const validOrder: Partial<Order> = {
      userId: 'usr_123',
      items: [validOrderItem],
      totalAmount: 100.00,
      status: 'pending',
      deliveryAddress: validDeliveryAddress,
    };

    it('should validate a correct order', () => {
      const result = validateOrder(validOrder);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject order with empty items array', () => {
      const order = { ...validOrder, items: [] };
      const result = validateOrder(order);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Order must have at least 1 item');
    });

    it('should reject order with invalid status', () => {
      const order = { ...validOrder, status: 'invalid' as any };
      const result = validateOrder(order);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Order status must be one of: pending, processing, shipped, delivered, cancelled');
    });

    it('should reject order with incorrect totalAmount', () => {
      const order = { ...validOrder, totalAmount: 200.00 };
      const result = validateOrder(order);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Order totalAmount must equal the sum of all item subtotals');
    });

    it('should reject order with invalid delivery address', () => {
      const order = { ...validOrder, deliveryAddress: { ...validDeliveryAddress, phone: 'invalid' } };
      const result = validateOrder(order);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('phone'))).toBe(true);
    });

    it('should validate order with multiple items', () => {
      const item2: OrderItem = {
        productId: 'prod_456',
        productName: 'Another Product',
        productImage: 'https://example.com/image2.jpg',
        quantity: 1,
        price: 75.00,
        subtotal: 75.00,
      };
      const order = {
        ...validOrder,
        items: [validOrderItem, item2],
        totalAmount: 175.00,
      };
      const result = validateOrder(order);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateSupplier', () => {
    const validSupplier: Partial<Supplier> = {
      name: 'TechHub China',
      email: 'contact@techhub.com',
      phone: '+2341234567890',
      address: '123 Trade Center, Lagos, Nigeria',
      verified: true,
      rating: 4.5,
      reviewCount: 100,
    };

    it('should validate a correct supplier', () => {
      const result = validateSupplier(validSupplier);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject supplier with invalid email', () => {
      const supplier = { ...validSupplier, email: 'invalid-email' };
      const result = validateSupplier(supplier);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Supplier email must be a valid email address');
    });

    it('should reject supplier with invalid phone', () => {
      const supplier = { ...validSupplier, phone: '1234567890' };
      const result = validateSupplier(supplier);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Supplier phone must be a valid phone number (format: +234XXXXXXXXXX)');
    });

    it('should reject supplier with short address', () => {
      const supplier = { ...validSupplier, address: 'Short' };
      const result = validateSupplier(supplier);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Supplier address must be at least 10 characters');
    });

    it('should reject supplier with missing verified status', () => {
      const supplier = { ...validSupplier, verified: undefined };
      const result = validateSupplier(supplier);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Supplier verified status is required');
    });

    it('should reject supplier with rating out of range', () => {
      const supplier = { ...validSupplier, rating: 6 };
      const result = validateSupplier(supplier);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Supplier rating must be between 0 and 5');
    });
  });
});

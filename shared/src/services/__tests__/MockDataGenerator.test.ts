import { MockDataGenerator } from '../MockDataGenerator';
import { LocalStorageAdapter, STORAGE_KEYS } from '../storage';
import { Category, Supplier, Product, User, Order } from '../../types/entities';

describe('MockDataGenerator', () => {
  let storage: LocalStorageAdapter;

  beforeEach(() => {
    storage = new LocalStorageAdapter();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('generateCategories', () => {
    it('should generate exactly 10 categories', () => {
      const categories = MockDataGenerator.generateCategories();
      expect(categories).toHaveLength(10);
    });

    it('should generate categories with all required fields', () => {
      const categories = MockDataGenerator.generateCategories();
      
      categories.forEach((category) => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('description');
        expect(category).toHaveProperty('imageUrl');
        expect(category).toHaveProperty('createdAt');
        expect(category).toHaveProperty('updatedAt');
        expect(category.id).toMatch(/^cat_/);
        expect(category.name.length).toBeGreaterThan(0);
        expect(category.description.length).toBeGreaterThan(0);
      });
    });

    it('should generate categories with African-Chinese trade focus', () => {
      const categories = MockDataGenerator.generateCategories();
      const categoryNames = categories.map(c => c.name);
      
      expect(categoryNames).toContain('African Textiles & Fabrics');
      expect(categoryNames).toContain('Electronics & Gadgets');
      expect(categoryNames).toContain('Fashion & Apparel');
    });
  });

  describe('generateSuppliers', () => {
    it('should generate suppliers with verification status', () => {
      const suppliers = MockDataGenerator.generateSuppliers();
      
      expect(suppliers.length).toBeGreaterThan(0);
      
      const verifiedSuppliers = suppliers.filter(s => s.verified);
      const unverifiedSuppliers = suppliers.filter(s => !s.verified);
      
      expect(verifiedSuppliers.length).toBeGreaterThan(0);
      expect(unverifiedSuppliers.length).toBeGreaterThan(0);
    });

    it('should generate suppliers with all required fields', () => {
      const suppliers = MockDataGenerator.generateSuppliers();
      
      suppliers.forEach((supplier) => {
        expect(supplier).toHaveProperty('id');
        expect(supplier).toHaveProperty('name');
        expect(supplier).toHaveProperty('email');
        expect(supplier).toHaveProperty('phone');
        expect(supplier).toHaveProperty('address');
        expect(supplier).toHaveProperty('verified');
        expect(supplier).toHaveProperty('rating');
        expect(supplier).toHaveProperty('reviewCount');
        expect(supplier.id).toMatch(/^sup_/);
        expect(supplier.rating).toBeGreaterThanOrEqual(3.0);
        expect(supplier.rating).toBeLessThanOrEqual(5.0);
      });
    });
  });

  describe('generateProducts', () => {
    it('should generate at least 20 products with realistic data', () => {
      const categories = MockDataGenerator.generateCategories();
      const suppliers = MockDataGenerator.generateSuppliers();
      const products = MockDataGenerator.generateProducts(20, categories, suppliers);
      
      expect(products.length).toBeGreaterThanOrEqual(20);
    });

    it('should generate products with all required fields', () => {
      const categories = MockDataGenerator.generateCategories();
      const suppliers = MockDataGenerator.generateSuppliers();
      const products = MockDataGenerator.generateProducts(5, categories, suppliers);
      
      products.forEach((product) => {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('description');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('images');
        expect(product).toHaveProperty('categoryId');
        expect(product).toHaveProperty('supplierId');
        expect(product).toHaveProperty('rating');
        expect(product).toHaveProperty('reviewCount');
        expect(product).toHaveProperty('stock');
        expect(product.id).toMatch(/^prod_/);
        expect(product.price).toBeGreaterThan(0);
        expect(product.images.length).toBeGreaterThan(0);
        expect(product.rating).toBeGreaterThanOrEqual(3.5);
        expect(product.rating).toBeLessThanOrEqual(5.0);
        expect(product.stock).toBeGreaterThan(0);
      });
    });

    it('should generate products with African-Chinese trade items', () => {
      const categories = MockDataGenerator.generateCategories();
      const suppliers = MockDataGenerator.generateSuppliers();
      const products = MockDataGenerator.generateProducts(30, categories, suppliers);
      
      const productNames = products.map(p => p.name);
      const hasAfricanProducts = productNames.some(name => 
        name.includes('Ankara') || 
        name.includes('African') || 
        name.includes('Dashiki') ||
        name.includes('Kente')
      );
      
      expect(hasAfricanProducts).toBe(true);
    });

    it('should assign products to valid categories and suppliers', () => {
      const categories = MockDataGenerator.generateCategories();
      const suppliers = MockDataGenerator.generateSuppliers();
      const products = MockDataGenerator.generateProducts(10, categories, suppliers);
      
      const categoryIds = categories.map(c => c.id);
      const supplierIds = suppliers.map(s => s.id);
      
      products.forEach((product) => {
        expect(categoryIds).toContain(product.categoryId);
        expect(supplierIds).toContain(product.supplierId);
      });
    });
  });

  describe('generateUsers', () => {
    it('should generate users with active/blocked status', () => {
      const users = MockDataGenerator.generateUsers(20);
      
      expect(users.length).toBe(20);
      
      const activeUsers = users.filter(u => u.status === 'active');
      const blockedUsers = users.filter(u => u.status === 'blocked');
      
      expect(activeUsers.length).toBeGreaterThan(0);
      expect(activeUsers.length + blockedUsers.length).toBe(20);
    });

    it('should generate users with all required fields', () => {
      const users = MockDataGenerator.generateUsers(5);
      
      users.forEach((user) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('password');
        expect(user).toHaveProperty('phone');
        expect(user).toHaveProperty('address');
        expect(user).toHaveProperty('status');
        expect(user.id).toMatch(/^usr_/);
        expect(user.email).toContain('@');
        expect(['active', 'blocked']).toContain(user.status);
      });
    });
  });

  describe('generateOrders', () => {
    it('should generate orders with various statuses', () => {
      const categories = MockDataGenerator.generateCategories();
      const suppliers = MockDataGenerator.generateSuppliers();
      const products = MockDataGenerator.generateProducts(20, categories, suppliers);
      const users = MockDataGenerator.generateUsers(10);
      const orders = MockDataGenerator.generateOrders(15, users, products);
      
      expect(orders.length).toBe(15);
      
      const statuses = orders.map(o => o.status);
      const uniqueStatuses = new Set(statuses);
      
      expect(uniqueStatuses.size).toBeGreaterThan(1);
    });

    it('should generate orders with all required fields', () => {
      const categories = MockDataGenerator.generateCategories();
      const suppliers = MockDataGenerator.generateSuppliers();
      const products = MockDataGenerator.generateProducts(20, categories, suppliers);
      const users = MockDataGenerator.generateUsers(10);
      const orders = MockDataGenerator.generateOrders(5, users, products);
      
      orders.forEach((order) => {
        expect(order).toHaveProperty('id');
        expect(order).toHaveProperty('userId');
        expect(order).toHaveProperty('items');
        expect(order).toHaveProperty('totalAmount');
        expect(order).toHaveProperty('status');
        expect(order).toHaveProperty('deliveryAddress');
        expect(order.id).toMatch(/^ord_/);
        expect(order.items.length).toBeGreaterThan(0);
        expect(order.totalAmount).toBeGreaterThan(0);
        expect(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).toContain(order.status);
        
        // Verify delivery address
        expect(order.deliveryAddress).toHaveProperty('fullName');
        expect(order.deliveryAddress).toHaveProperty('phone');
        expect(order.deliveryAddress).toHaveProperty('address');
        expect(order.deliveryAddress).toHaveProperty('city');
        expect(order.deliveryAddress).toHaveProperty('state');
        expect(order.deliveryAddress).toHaveProperty('zipCode');
      });
    });

    it('should calculate correct order totals', () => {
      const categories = MockDataGenerator.generateCategories();
      const suppliers = MockDataGenerator.generateSuppliers();
      const products = MockDataGenerator.generateProducts(20, categories, suppliers);
      const users = MockDataGenerator.generateUsers(10);
      const orders = MockDataGenerator.generateOrders(5, users, products);
      
      orders.forEach((order) => {
        const calculatedTotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);
        expect(order.totalAmount).toBe(calculatedTotal);
        
        // Verify item subtotals
        order.items.forEach((item) => {
          expect(item.subtotal).toBe(item.price * item.quantity);
        });
      });
    });
  });

  describe('initializeMockData', () => {
    it('should populate storage with all mock data', async () => {
      await MockDataGenerator.initializeMockData(storage);
      
      const categories = await storage.get<Category[]>(STORAGE_KEYS.CATEGORIES);
      const suppliers = await storage.get<Supplier[]>(STORAGE_KEYS.SUPPLIERS);
      const products = await storage.get<Product[]>(STORAGE_KEYS.PRODUCTS);
      const users = await storage.get<User[]>(STORAGE_KEYS.USERS);
      const orders = await storage.get<Order[]>(STORAGE_KEYS.ORDERS);
      const initialized = await storage.get<boolean>(STORAGE_KEYS.INITIALIZED);
      
      expect(categories).not.toBeNull();
      expect(suppliers).not.toBeNull();
      expect(products).not.toBeNull();
      expect(users).not.toBeNull();
      expect(orders).not.toBeNull();
      expect(initialized).toBe(true);
      
      expect(categories!.length).toBe(10);
      expect(products!.length).toBeGreaterThanOrEqual(20);
    });

    it('should not reinitialize if already initialized', async () => {
      await MockDataGenerator.initializeMockData(storage);
      
      const firstProducts = await storage.get<Product[]>(STORAGE_KEYS.PRODUCTS);
      
      await MockDataGenerator.initializeMockData(storage);
      
      const secondProducts = await storage.get<Product[]>(STORAGE_KEYS.PRODUCTS);
      
      expect(firstProducts).toEqual(secondProducts);
    });

    it('should generate at least 20 products as per requirements', async () => {
      await MockDataGenerator.initializeMockData(storage);
      
      const products = await storage.get<Product[]>(STORAGE_KEYS.PRODUCTS);
      
      expect(products).not.toBeNull();
      expect(products!.length).toBeGreaterThanOrEqual(20);
    });
  });
});

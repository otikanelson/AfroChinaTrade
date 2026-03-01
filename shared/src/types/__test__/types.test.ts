// Type validation tests
import {
  Product,
  Category,
  User,
  Admin,
  Supplier,
  Order,
  OrderItem,
  DeliveryAddress,
  CartItem,
  Review,
  WishlistItem,
} from '../entities';

import {
  AuthState,
  CartState,
  FavoritesState,
} from '../context';

import {
  ServiceResponse,
  PaginatedResponse,
  DashboardStats,
} from '../service';

import {
  ProductFilters,
  OrderFilters,
} from '../filters';

describe('Type Definitions', () => {
  describe('Entity Types', () => {
    it('should allow valid Product object', () => {
      const product: Product = {
        id: 'prod_1',
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        images: ['image1.jpg'],
        categoryId: 'cat_1',
        supplierId: 'sup_1',
        rating: 4.5,
        reviewCount: 10,
        stock: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(product).toBeDefined();
    });

    it('should allow valid Category object', () => {
      const category: Category = {
        id: 'cat_1',
        name: 'Electronics',
        description: 'Electronic devices',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(category).toBeDefined();
    });

    it('should allow valid User object', () => {
      const user: User = {
        id: 'usr_1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(user).toBeDefined();
    });

    it('should allow valid Admin object', () => {
      const admin: Admin = {
        id: 'admin_1',
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'hashed_password',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      expect(admin).toBeDefined();
    });

    it('should allow valid Supplier object', () => {
      const supplier: Supplier = {
        id: 'sup_1',
        name: 'Test Supplier',
        email: 'supplier@example.com',
        phone: '+1234567890',
        address: '123 Main St',
        verified: true,
        rating: 4.5,
        reviewCount: 20,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(supplier).toBeDefined();
    });

    it('should allow valid Order object', () => {
      const order: Order = {
        id: 'ord_1',
        userId: 'usr_1',
        items: [],
        totalAmount: 100,
        status: 'pending',
        deliveryAddress: {
          fullName: 'John Doe',
          phone: '+1234567890',
          address: '123 Main St',
          city: 'Lagos',
          state: 'Lagos State',
          zipCode: '100001',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(order).toBeDefined();
    });

    it('should allow valid Review object', () => {
      const review: Review = {
        id: 'rev_1',
        productId: 'prod_1',
        userId: 'usr_1',
        userName: 'John Doe',
        rating: 5,
        comment: 'Great product!',
        createdAt: new Date().toISOString(),
      };
      expect(review).toBeDefined();
    });
  });

  describe('Context State Types', () => {
    it('should allow valid AuthState', () => {
      const authState: AuthState = {
        user: null,
        admin: null,
        isAuthenticated: false,
        isLoading: false,
      };
      expect(authState).toBeDefined();
    });

    it('should allow valid CartState', () => {
      const cartState: CartState = {
        items: [],
        totalItems: 0,
        totalAmount: 0,
      };
      expect(cartState).toBeDefined();
    });

    it('should allow valid FavoritesState', () => {
      const favoritesState: FavoritesState = {
        productIds: [],
      };
      expect(favoritesState).toBeDefined();
    });
  });

  describe('Service Response Types', () => {
    it('should allow valid ServiceResponse', () => {
      const response: ServiceResponse<string> = {
        success: true,
        data: 'test',
      };
      expect(response).toBeDefined();
    });

    it('should allow valid PaginatedResponse', () => {
      const response: PaginatedResponse<Product> = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      };
      expect(response).toBeDefined();
    });

    it('should allow valid DashboardStats', () => {
      const stats: DashboardStats = {
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
        recentOrders: [],
      };
      expect(stats).toBeDefined();
    });
  });

  describe('Filter Types', () => {
    it('should allow valid ProductFilters', () => {
      const filters: ProductFilters = {
        categoryId: 'cat_1',
        minPrice: 0,
        maxPrice: 1000,
        searchQuery: 'test',
      };
      expect(filters).toBeDefined();
    });

    it('should allow valid OrderFilters', () => {
      const filters: OrderFilters = {
        status: 'pending',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
      };
      expect(filters).toBeDefined();
    });
  });
});

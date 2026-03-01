import { IDGenerator } from '../utils/IDGenerator';
import { StorageAdapter, STORAGE_KEYS } from './storage';
import {
  Product,
  Category,
  Supplier,
  User,
  Order,
  OrderItem,
} from '../types/entities';

/**
 * MockDataGenerator provides realistic mock data for the AfroChinaTrade platform
 * Focuses on African-Chinese trade products including textiles, electronics, fashion, and home goods
 * 
 * Requirements: 16.1, 16.2, 16.3
 */
export class MockDataGenerator {
  /**
   * Generate mock categories with African-Chinese trade focus
   * @returns Array of 10 categories
   */
  static generateCategories(): Category[] {
    const categoryData = [
      {
        name: 'African Textiles & Fabrics',
        description: 'Authentic African prints, Ankara fabrics, and traditional textiles from China',
      },
      {
        name: 'Electronics & Gadgets',
        description: 'Latest smartphones, tablets, and electronic accessories from Chinese manufacturers',
      },
      {
        name: 'Fashion & Apparel',
        description: 'Trendy clothing, shoes, and fashion accessories for African markets',
      },
      {
        name: 'Home & Kitchen',
        description: 'Quality home appliances, kitchenware, and household items',
      },
      {
        name: 'Beauty & Cosmetics',
        description: 'Beauty products, skincare, and cosmetics tailored for African consumers',
      },
      {
        name: 'Jewelry & Accessories',
        description: 'Fashion jewelry, watches, and accessories from Chinese suppliers',
      },
      {
        name: 'Building Materials',
        description: 'Construction materials, tiles, and hardware supplies',
      },
      {
        name: 'Furniture & Decor',
        description: 'Modern furniture and home decoration items',
      },
      {
        name: 'Bags & Luggage',
        description: 'Handbags, backpacks, and travel luggage',
      },
      {
        name: 'Shoes & Footwear',
        description: 'Quality footwear for men, women, and children',
      },
    ];

    return categoryData.map((cat, index) => ({
      id: IDGenerator.generateCategoryId(),
      name: cat.name,
      description: cat.description,
      imageUrl: `https://picsum.photos/seed/cat${index}/400/300`,
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  /**
   * Generate mock suppliers with verification status
   * @returns Array of suppliers with realistic names and ratings
   */
  static generateSuppliers(): Supplier[] {
    const supplierData = [
      { name: 'Guangzhou Textile Trading Co.', verified: true },
      { name: 'Shenzhen Electronics Hub', verified: true },
      { name: 'Beijing Fashion Imports', verified: true },
      { name: 'Shanghai Home Goods Ltd', verified: true },
      { name: 'Yiwu Market Suppliers', verified: true },
      { name: 'Dongguan Manufacturing Co.', verified: true },
      { name: 'Hangzhou Beauty Products', verified: false },
      { name: 'Ningbo Trade Center', verified: true },
      { name: 'Qingdao Import Export', verified: false },
      { name: 'Xiamen Global Trading', verified: true },
    ];

    return supplierData.map((supplier, index) => ({
      id: IDGenerator.generateSupplierId(),
      name: supplier.name,
      email: `contact@${supplier.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      phone: `+86 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)} ${Math.floor(Math.random() * 9000 + 1000)}`,
      address: `${index + 1} Trade Center, Guangzhou, China`,
      verified: supplier.verified,
      rating: supplier.verified ? Math.floor(Math.random() * 10 + 40) / 10 : Math.floor(Math.random() * 15 + 30) / 10,
      reviewCount: Math.floor(Math.random() * 500) + 50,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  /**
   * Generate realistic products with African-Chinese trade items
   * @param count - Number of products to generate (minimum 20)
   * @param categories - Array of categories to assign products to
   * @param suppliers - Array of suppliers to assign products to
   * @returns Array of products with realistic data
   */
  static generateProducts(
    count: number,
    categories: Category[],
    suppliers: Supplier[]
  ): Product[] {
    const products: Product[] = [];

    // Realistic African-Chinese trade products
    const productData = [
      // African Textiles & Fabrics
      { name: 'Ankara Wax Print Fabric - 6 Yards', category: 0, price: 4500, description: 'Premium quality African wax print fabric, 100% cotton, vibrant colors perfect for traditional and modern designs' },
      { name: 'Kente Cloth Pattern Fabric', category: 0, price: 6800, description: 'Authentic Kente-inspired fabric with traditional patterns, ideal for special occasions and cultural events' },
      { name: 'Dashiki Print Material Bundle', category: 0, price: 3200, description: 'Colorful dashiki print fabric bundle, perfect for making traditional African attire' },
      { name: 'Adire Batik Fabric Roll', category: 0, price: 5500, description: 'Hand-dyed indigo batik fabric with traditional Nigerian Adire patterns' },
      
      // Electronics & Gadgets
      { name: 'Tecno Spark 10 Pro Smartphone', category: 1, price: 89000, description: 'Latest Tecno smartphone with 6.8" display, 128GB storage, 5000mAh battery, perfect for African markets' },
      { name: 'Infinix Hot 30i Mobile Phone', category: 1, price: 67000, description: 'Affordable smartphone with excellent camera, long battery life, and fast charging' },
      { name: 'Oraimo Power Bank 20000mAh', category: 1, price: 12500, description: 'High-capacity power bank with fast charging, dual USB ports, LED display' },
      { name: 'Wireless Bluetooth Earbuds', category: 1, price: 8900, description: 'Premium TWS earbuds with noise cancellation, touch controls, and charging case' },
      { name: 'Smart Watch Fitness Tracker', category: 1, price: 15000, description: 'Multi-function smartwatch with heart rate monitor, step counter, and call notifications' },
      
      // Fashion & Apparel
      { name: 'African Print Maxi Dress', category: 2, price: 12000, description: 'Elegant maxi dress with authentic African print, perfect for parties and events' },
      { name: 'Men\'s Kaftan Traditional Wear', category: 2, price: 18000, description: 'Premium quality kaftan with embroidery, ideal for traditional ceremonies' },
      { name: 'Ladies Ankara Jumpsuit', category: 2, price: 14500, description: 'Stylish jumpsuit with modern African print design, comfortable and fashionable' },
      { name: 'Senator Suit for Men', category: 2, price: 25000, description: 'Complete senator suit with matching cap, perfect for formal occasions' },
      
      // Home & Kitchen
      { name: 'Non-Stick Cookware Set 12 Pieces', category: 3, price: 22000, description: 'Complete cookware set with pots, pans, and lids, durable non-stick coating' },
      { name: 'Electric Rice Cooker 5L', category: 3, price: 18500, description: 'Multi-function rice cooker with steamer, keep-warm function, and timer' },
      { name: 'Blender with Grinder 2 in 1', category: 3, price: 15000, description: 'Powerful blender with dry grinder attachment, perfect for smoothies and spices' },
      { name: 'Dinner Set 24 Pieces Ceramic', category: 3, price: 28000, description: 'Elegant ceramic dinner set for 6 people, microwave and dishwasher safe' },
      
      // Beauty & Cosmetics
      { name: 'Skin Lightening Body Lotion', category: 4, price: 4500, description: 'Natural skin brightening lotion with vitamin E, suitable for all skin types' },
      { name: 'Hair Growth Oil Treatment', category: 4, price: 3200, description: 'Herbal hair growth oil with natural ingredients, promotes healthy hair growth' },
      { name: 'Makeup Brush Set Professional', category: 4, price: 8900, description: 'Complete makeup brush set with 12 pieces, soft bristles and carrying case' },
      { name: 'Facial Cleanser & Toner Set', category: 4, price: 6500, description: 'Deep cleansing facial wash and toner for clear, glowing skin' },
      
      // Jewelry & Accessories
      { name: 'Gold Plated Jewelry Set', category: 5, price: 12000, description: 'Elegant necklace and earrings set, 18k gold plated, perfect for special occasions' },
      { name: 'Men\'s Luxury Watch Stainless Steel', category: 5, price: 25000, description: 'Premium quality watch with date display, water resistant, elegant design' },
      { name: 'African Beaded Necklace', category: 5, price: 5500, description: 'Handcrafted beaded necklace with traditional African patterns' },
      { name: 'Fashion Sunglasses UV Protection', category: 5, price: 4200, description: 'Stylish sunglasses with UV400 protection, multiple colors available' },
      
      // Building Materials
      { name: 'Ceramic Floor Tiles 60x60cm Box', category: 6, price: 8500, description: 'High-quality ceramic tiles, non-slip surface, easy to clean, 1 box covers 1.44 sqm' },
      { name: 'PVC Ceiling Panels Pack of 10', category: 6, price: 12000, description: 'Durable PVC ceiling panels, waterproof, easy installation' },
      { name: 'LED Downlight Set of 6', category: 6, price: 9500, description: 'Energy-efficient LED downlights, bright white light, long lifespan' },
      { name: 'Door Handles Stainless Steel', category: 6, price: 3800, description: 'Premium stainless steel door handles, rust-resistant, modern design' },
      
      // Furniture & Decor
      { name: 'Modern Sofa Set 7 Seater', category: 7, price: 185000, description: 'Luxury fabric sofa set with center table, comfortable and stylish' },
      { name: 'Wooden Dining Table with 6 Chairs', category: 7, price: 95000, description: 'Solid wood dining set, elegant design, seats 6 people comfortably' },
      { name: 'Wall Art Canvas Prints Set', category: 7, price: 15000, description: 'Beautiful African-themed canvas art, set of 3 pieces, ready to hang' },
      { name: 'LED Floor Lamp Modern Design', category: 7, price: 18500, description: 'Contemporary floor lamp with adjustable brightness, perfect for living room' },
      
      // Bags & Luggage
      { name: 'Ladies Leather Handbag', category: 8, price: 12500, description: 'Genuine leather handbag with multiple compartments, elegant and practical' },
      { name: 'Travel Luggage Set 3 Pieces', category: 8, price: 45000, description: 'Durable luggage set with wheels, TSA locks, and expandable design' },
      { name: 'School Backpack with USB Port', category: 8, price: 8900, description: 'Waterproof backpack with USB charging port, laptop compartment' },
      { name: 'Men\'s Leather Briefcase', category: 8, price: 22000, description: 'Professional leather briefcase with laptop sleeve, perfect for business' },
      
      // Shoes & Footwear
      { name: 'Men\'s Formal Leather Shoes', category: 9, price: 15000, description: 'Classic leather oxford shoes, comfortable sole, perfect for office wear' },
      { name: 'Ladies High Heel Sandals', category: 9, price: 12000, description: 'Elegant high heel sandals, comfortable fit, available in multiple colors' },
      { name: 'Unisex Sneakers Sports Shoes', category: 9, price: 18500, description: 'Comfortable sports sneakers, breathable material, perfect for running' },
      { name: 'Children\'s School Shoes', category: 9, price: 8500, description: 'Durable school shoes for kids, comfortable and long-lasting' },
    ];

    // Generate products from the data
    productData.forEach((item, index) => {
      const category = categories[item.category];
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      
      products.push({
        id: IDGenerator.generateProductId(),
        name: item.name,
        description: item.description,
        price: item.price,
        images: [
          `https://picsum.photos/seed/prod${index}a/600/600`,
          `https://picsum.photos/seed/prod${index}b/600/600`,
          `https://picsum.photos/seed/prod${index}c/600/600`,
        ],
        categoryId: category.id,
        supplierId: supplier.id,
        rating: Math.floor(Math.random() * 15 + 35) / 10, // 3.5-5.0
        reviewCount: Math.floor(Math.random() * 150) + 10,
        stock: Math.floor(Math.random() * 100) + 20,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    // If more products are requested, generate additional ones
    while (products.length < count) {
      const randomProduct = productData[Math.floor(Math.random() * productData.length)];
      const category = categories[randomProduct.category];
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      
      products.push({
        id: IDGenerator.generateProductId(),
        name: `${randomProduct.name} (Variant ${products.length + 1})`,
        description: randomProduct.description,
        price: randomProduct.price + Math.floor(Math.random() * 5000 - 2500),
        images: [
          `https://picsum.photos/seed/prod${products.length}a/600/600`,
          `https://picsum.photos/seed/prod${products.length}b/600/600`,
        ],
        categoryId: category.id,
        supplierId: supplier.id,
        rating: Math.floor(Math.random() * 15 + 35) / 10,
        reviewCount: Math.floor(Math.random() * 150) + 10,
        stock: Math.floor(Math.random() * 100) + 20,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return products;
  }

  /**
   * Generate mock users with active/blocked status
   * @param count - Number of users to generate
   * @returns Array of users
   */
  static generateUsers(count: number): User[] {
    const users: User[] = [];
    const firstNames = [
      'Chinedu', 'Amara', 'Oluwaseun', 'Fatima', 'Emeka', 'Aisha', 'Tunde', 'Ngozi',
      'Ibrahim', 'Chioma', 'Yusuf', 'Blessing', 'Adebayo', 'Zainab', 'Chukwuma', 'Hauwa',
    ];
    const lastNames = [
      'Okafor', 'Adeyemi', 'Musa', 'Okonkwo', 'Bello', 'Eze', 'Abdullahi', 'Nwosu',
      'Suleiman', 'Okoro', 'Aliyu', 'Onyeka', 'Hassan', 'Chukwu', 'Usman', 'Obi',
    ];
    const cities = ['Lagos', 'Abuja', 'Kano', 'Port Harcourt', 'Ibadan', 'Kaduna', 'Benin City', 'Enugu'];

    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];

      users.push({
        id: IDGenerator.generateUserId(),
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        password: 'password123', // In production, use proper hashing
        phone: `+234${Math.floor(Math.random() * 900000000 + 100000000)}`,
        address: `${Math.floor(Math.random() * 100) + 1} ${lastName} Street, ${city}, Nigeria`,
        status: Math.random() > 0.15 ? 'active' : 'blocked', // 85% active
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return users;
  }

  /**
   * Generate mock orders with various statuses
   * @param count - Number of orders to generate
   * @param users - Array of users to assign orders to
   * @param products - Array of products to include in orders
   * @returns Array of orders
   */
  static generateOrders(count: number, users: User[], products: Product[]): Order[] {
    const orders: Order[] = [];
    const statuses: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const statusWeights = [0.1, 0.2, 0.15, 0.5, 0.05]; // Mostly delivered orders

    for (let i = 0; i < count; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const itemCount = Math.floor(Math.random() * 4) + 1; // 1-5 items
      const items: OrderItem[] = [];

      // Select random products for the order
      const selectedProducts = new Set<Product>();
      while (selectedProducts.size < itemCount) {
        selectedProducts.add(products[Math.floor(Math.random() * products.length)]);
      }

      selectedProducts.forEach((product) => {
        const quantity = Math.floor(Math.random() * 3) + 1;
        items.push({
          productId: product.id,
          productName: product.name,
          productImage: product.images[0],
          quantity,
          price: product.price,
          subtotal: product.price * quantity,
        });
      });

      const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

      // Select status based on weights
      let random = Math.random();
      let statusIndex = 0;
      let cumulativeWeight = 0;
      for (let j = 0; j < statusWeights.length; j++) {
        cumulativeWeight += statusWeights[j];
        if (random <= cumulativeWeight) {
          statusIndex = j;
          break;
        }
      }

      orders.push({
        id: IDGenerator.generateOrderId(),
        userId: user.id,
        items,
        totalAmount,
        status: statuses[statusIndex],
        deliveryAddress: {
          fullName: user.name,
          phone: user.phone || '+2341234567890',
          address: user.address || 'Default Address',
          city: user.address?.split(',')[1]?.trim() || 'Lagos',
          state: user.address?.includes('Abuja') ? 'FCT' : 'Lagos State',
          zipCode: '100001',
        },
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return orders;
  }

  /**
   * Initialize mock data and populate storage
   * Generates categories, suppliers, products (at least 20), users, and orders
   * @param storage - Storage adapter to use for persistence
   */
  static async initializeMockData(storage: StorageAdapter): Promise<void> {
    try {
      // Check if already initialized
      const initialized = await storage.get<boolean>(STORAGE_KEYS.INITIALIZED);
      if (initialized) {
        console.log('Mock data already initialized');
        return;
      }

      console.log('Initializing mock data...');

      // Generate all mock data
      const categories = this.generateCategories();
      const suppliers = this.generateSuppliers();
      const products = this.generateProducts(40, categories, suppliers); // Generate 40 products
      const users = this.generateUsers(25);
      const orders = this.generateOrders(35, users, products);

      // Store all data
      await storage.set(STORAGE_KEYS.CATEGORIES, categories);
      await storage.set(STORAGE_KEYS.SUPPLIERS, suppliers);
      await storage.set(STORAGE_KEYS.PRODUCTS, products);
      await storage.set(STORAGE_KEYS.USERS, users);
      await storage.set(STORAGE_KEYS.ORDERS, orders);
      await storage.set(STORAGE_KEYS.INITIALIZED, true);

      console.log('Mock data initialized successfully');
      console.log(`- ${categories.length} categories`);
      console.log(`- ${suppliers.length} suppliers`);
      console.log(`- ${products.length} products`);
      console.log(`- ${users.length} users`);
      console.log(`- ${orders.length} orders`);
    } catch (error) {
      console.error('Failed to initialize mock data:', error);
      throw new Error(`Mock data initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

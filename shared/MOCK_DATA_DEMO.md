# MockDataGenerator - Demo Ready Data

## Overview
The MockDataGenerator creates realistic, demo-ready data for the AfroChinaTrade E-Commerce Platform, focusing on African-Chinese trade products.

## Generated Data Summary

### Categories (10)
- **African Textiles & Fabrics** - Authentic African prints, Ankara fabrics, and traditional textiles
- **Electronics & Gadgets** - Latest smartphones, tablets, and electronic accessories
- **Fashion & Apparel** - Trendy clothing, shoes, and fashion accessories
- **Home & Kitchen** - Quality home appliances, kitchenware, and household items
- **Beauty & Cosmetics** - Beauty products, skincare, and cosmetics
- **Jewelry & Accessories** - Fashion jewelry, watches, and accessories
- **Building Materials** - Construction materials, tiles, and hardware supplies
- **Furniture & Decor** - Modern furniture and home decoration items
- **Bags & Luggage** - Handbags, backpacks, and travel luggage
- **Shoes & Footwear** - Quality footwear for men, women, and children

### Suppliers (10)
Chinese suppliers with realistic names and verification status:
- Guangzhou Textile Trading Co. (Verified)
- Shenzhen Electronics Hub (Verified)
- Beijing Fashion Imports (Verified)
- Shanghai Home Goods Ltd (Verified)
- Yiwu Market Suppliers (Verified)
- Dongguan Manufacturing Co. (Verified)
- Hangzhou Beauty Products (Unverified)
- Ningbo Trade Center (Verified)
- Qingdao Import Export (Unverified)
- Xiamen Global Trading (Verified)

### Products (40+ items)
Realistic African-Chinese trade products including:

#### African Textiles
- Ankara Wax Print Fabric - 6 Yards (₦4,500)
- Kente Cloth Pattern Fabric (₦6,800)
- Dashiki Print Material Bundle (₦3,200)
- Adire Batik Fabric Roll (₦5,500)

#### Electronics
- Tecno Spark 10 Pro Smartphone (₦89,000)
- Infinix Hot 30i Mobile Phone (₦67,000)
- Oraimo Power Bank 20000mAh (₦12,500)
- Wireless Bluetooth Earbuds (₦8,900)
- Smart Watch Fitness Tracker (₦15,000)

#### Fashion
- African Print Maxi Dress (₦12,000)
- Men's Kaftan Traditional Wear (₦18,000)
- Ladies Ankara Jumpsuit (₦14,500)
- Senator Suit for Men (₦25,000)

#### Home & Kitchen
- Non-Stick Cookware Set 12 Pieces (₦22,000)
- Electric Rice Cooker 5L (₦18,500)
- Blender with Grinder 2 in 1 (₦15,000)
- Dinner Set 24 Pieces Ceramic (₦28,000)

#### Beauty & Cosmetics
- Skin Lightening Body Lotion (₦4,500)
- Hair Growth Oil Treatment (₦3,200)
- Makeup Brush Set Professional (₦8,900)
- Facial Cleanser & Toner Set (₦6,500)

#### And many more across all categories!

### Users (25)
Nigerian users with realistic names:
- Chinedu Okafor, Amara Adeyemi, Oluwaseun Musa, etc.
- 85% active, 15% blocked status
- Complete contact information and addresses

### Orders (35)
Realistic orders with:
- Multiple items per order (1-5 products)
- Various statuses: pending, processing, shipped, delivered, cancelled
- Complete delivery addresses
- Accurate total calculations

## Features

### Realistic Pricing
- Products priced in Nigerian Naira (₦)
- Prices range from ₦3,200 to ₦185,000
- Realistic pricing for African market

### Rich Descriptions
- Detailed product descriptions
- Feature highlights
- Use case information

### Quality Images
- Multiple images per product (2-3)
- Placeholder images with unique seeds
- High resolution (600x600)

### Verification Status
- 70% of suppliers are verified
- Verified suppliers have higher ratings (4.0-5.0)
- Unverified suppliers have lower ratings (3.0-4.5)

### Order Distribution
- 50% delivered orders
- 20% processing orders
- 15% shipped orders
- 10% pending orders
- 5% cancelled orders

## Usage

```typescript
import { MockDataGenerator } from '@afrochinatrade/shared';
import { LocalStorageAdapter } from '@afrochinatrade/shared';

// Initialize mock data
const storage = new LocalStorageAdapter();
await MockDataGenerator.initializeMockData(storage);

// Or generate specific data
const categories = MockDataGenerator.generateCategories();
const suppliers = MockDataGenerator.generateSuppliers();
const products = MockDataGenerator.generateProducts(50, categories, suppliers);
const users = MockDataGenerator.generateUsers(30);
const orders = MockDataGenerator.generateOrders(40, users, products);
```

## Demo Ready
This data is specifically designed for client demos with:
- ✅ Realistic African-Chinese trade products
- ✅ Culturally appropriate names and locations
- ✅ Professional product descriptions
- ✅ Accurate pricing for Nigerian market
- ✅ Complete data relationships
- ✅ Visually appealing presentation
- ✅ Diverse product range
- ✅ Real-world order scenarios

Perfect for showcasing the platform's capabilities to potential clients and stakeholders!

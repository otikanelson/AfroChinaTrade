# Category Products Seeding

## Overview
This document describes the new category products that have been created for seeding the database with products in the Automotive, Books and Media, and Fashion categories.

## Products Created

### Automotive Category (2 products)

#### 1. Premium Car Dashboard Camera 4K
- **Price**: ₦125,000
- **Description**: Advanced 4K dashboard camera with night vision, GPS tracking, and collision detection
- **Features**: 
  - 4K Ultra HD recording
  - Night vision technology
  - GPS tracking with speed monitoring
  - Mobile app connectivity
  - Loop recording with G-sensor
- **Stock**: 18 units
- **Rating**: 4.7/5 (456 reviews)
- **Images**: High-quality Unsplash images of dashboard cameras

#### 2. Professional Car Detailing Kit Complete
- **Price**: ₦45,000
- **Description**: Complete professional-grade car detailing kit with all necessary tools and products
- **Features**:
  - 15-piece complete detailing set
  - Premium microfiber cloths
  - Car shampoo, wax, and tire shine
  - Interior cleaner and detailing brushes
  - Organized carrying case
- **Stock**: 35 units
- **Rating**: 4.5/5 (234 reviews)
- **Images**: Professional car detailing equipment photos

### Books and Media Category (2 products)

#### 1. The Psychology of Money - Financial Wisdom Book
- **Price**: ₦8,500
- **Description**: Bestselling book by Morgan Housel on financial psychology
- **Features**:
  - 256 pages of financial wisdom
  - Author: Morgan Housel
  - Publisher: Harriman House
  - ISBN: 978-0857197689
  - Perfect for entrepreneurs and investors
- **Stock**: 67 units
- **Rating**: 4.8/5 (892 reviews)
- **Images**: Professional book photography

#### 2. Premium Vinyl Record Collection - Classic Jazz
- **Price**: ₦75,000
- **Description**: Curated collection of 5 classic jazz vinyl records
- **Features**:
  - Artists: Miles Davis, John Coltrane, Bill Evans, Art Blakey, Thelonious Monk
  - 180g high-quality vinyl pressing
  - Original gatefold sleeves with liner notes
  - Audiophile grade mastering
  - Approximately 4 hours of music
- **Stock**: 12 units
- **Rating**: 4.9/5 (156 reviews)
- **Images**: Vintage vinyl record collection photos

### Fashion Category (2 products)

#### 1. Designer Leather Handbag - Premium Collection
- **Price**: ₦95,000
- **Description**: Elegant genuine leather handbag crafted from premium Italian leather
- **Features**:
  - 100% Genuine Italian Leather
  - Multiple compartments and pockets
  - Adjustable shoulder strap (70-120cm)
  - Gold-tone metal hardware
  - Available in Black, Brown, Burgundy
- **Stock**: 28 units
- **Rating**: 4.6/5 (324 reviews)
- **Images**: Professional handbag photography

#### 2. Premium Cotton Polo Shirt - Classic Fit
- **Price**: ₦18,500
- **Description**: High-quality 100% cotton polo shirt with classic fit
- **Features**:
  - 100% Premium Cotton material
  - Classic Regular Fit
  - Reinforced ribbed collar
  - Mother-of-pearl buttons
  - Available in multiple colors and sizes (S-XXL)
- **Stock**: 45 units
- **Rating**: 4.4/5 (567 reviews)
- **Images**: Professional clothing photography

## Technical Details

### Database Structure
Each product includes:
- Complete product information (name, description, price, category)
- High-quality Unsplash images (4 images per product)
- Detailed specifications using MongoDB Map type
- Comprehensive policies (payment, shipping, refund, guidelines, suggestions)
- Discovery fields (view count, trending score, seller favorite status)
- Proper supplier associations

### Suppliers Created
Three specialized suppliers are created:
1. **AutoTech Solutions** - Automotive parts and accessories specialist
2. **BookWorld Nigeria** - Books, media, and educational materials
3. **Fashion Forward Ltd** - Premium fashion and accessories

### Seeding Script
- **File**: `backend/src/scripts/seedAdditionalCategoryProducts.ts`
- **Command**: `npm run db:seed:category-products`
- **Features**:
  - Checks for existing products to avoid duplicates
  - Creates suppliers if they don't exist
  - Provides detailed logging and progress reports
  - Uses proper error handling and database connection management

## How to Run

### Prerequisites
1. Ensure MongoDB connection is available
2. Make sure your IP is whitelisted in MongoDB Atlas
3. Environment variables are properly configured

### Running the Seeding Script
```bash
cd backend
npm run db:seed:category-products
```

### Alternative Method
If you prefer to run the script directly:
```bash
cd backend
npx ts-node src/scripts/seedAdditionalCategoryProducts.ts
```

## Expected Output
When successfully run, the script will:
1. Connect to MongoDB
2. Create 3 suppliers (if they don't exist)
3. Create 6 products across 3 categories
4. Provide detailed logging for each step
5. Display a summary of created vs existing products

## Troubleshooting

### MongoDB Connection Issues
If you encounter connection timeouts:
1. Check your internet connection
2. Verify your IP is whitelisted in MongoDB Atlas
3. Ensure the MONGODB_URI in your .env file is correct
4. Try running other seeding scripts to verify database connectivity

### Product Already Exists
The script checks for existing products by name and will skip duplicates, showing a warning message.

## Integration
These products are designed to integrate seamlessly with the existing e-commerce platform:
- Compatible with all existing product features
- Includes proper categorization for filtering
- Contains rich metadata for search functionality
- Follows the same pricing and inventory patterns
- Includes comprehensive policies for customer information
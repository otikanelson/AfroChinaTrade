import dotenv from 'dotenv';
dotenv.config();

import { connectDatabase } from '../config/database';
import Ad from '../models/Ad';

const ADS = [
  // ── Home / both (original 3) ──────────────────────────────────────────────
  {
    title: 'Buy Directly from Verified Chinese Suppliers',
    description: 'Skip the middlemen. Connect with thousands of verified suppliers and get the best factory prices.',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=300&fit=crop',
    linkPath: '/verified-suppliers',
    placement: 'both',
    displayOrder: 1,
  },
  {
    title: 'New Arrivals Every Week',
    description: 'Fresh products added daily. Be the first to discover trending items before they sell out.',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=300&fit=crop',
    linkPath: '/product-listing',
    linkParams: { sortBy: 'newest', title: 'New Arrivals' },
    placement: 'both',
    displayOrder: 2,
  },
  {
    title: 'Exclusive Deals & Discounts',
    description: 'Save big on bulk orders. Special pricing available for registered buyers.',
    imageUrl: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&h=300&fit=crop',
    linkPath: '/product-listing',
    linkParams: { discount: 'true', title: 'Special Deals' },
    placement: 'both',
    displayOrder: 3,
  },
  {
    title: 'Quality Guaranteed Products',
    description: 'Every product is inspected and verified. Shop with confidence and peace of mind.',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=300&fit=crop',
    linkPath: '/product-listing',
    linkParams: { featured: 'true', title: 'Quality Products' },
    placement: 'both',
    displayOrder: 4,
  },
  {
    title: 'Join Thousands of Happy Buyers',
    description: 'Read reviews from verified customers. See why businesses trust our platform.',
    imageUrl: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&h=300&fit=crop',
    linkPath: '/reviews',
    placement: 'both',
    displayOrder: 5,
  },

  // ── Buy Now page (3 new) ───────────────────────────────────────────────────
  {
    title: 'Fast Delivery on All Orders',
    description: 'Order today, receive in days. Track your shipment in real time.',
    imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=300&fit=crop',
    linkPath: '/my-orders',
    placement: 'buy-now',
    displayOrder: 1,
  },
  {
    title: 'Bulk Orders? Get a Custom Quote',
    description: 'Need large quantities? Request a quote and get factory-direct pricing.',
    imageUrl: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=300&fit=crop',
    linkPath: '/quotations',
    placement: 'buy-now',
    displayOrder: 2,
  },
  {
    title: 'Trending Products This Week',
    description: 'See what thousands of buyers are ordering right now.',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=300&fit=crop',
    linkPath: '/product-listing',
    linkParams: { sortBy: 'trending', title: 'Trending Now' },
    placement: 'buy-now',
    displayOrder: 3,
  },
  {
    title: 'Secure Payment Options',
    description: 'Multiple payment methods available. Your transactions are safe and protected.',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=300&fit=crop',
    linkPath: '/payment-methods',
    placement: 'buy-now',
    displayOrder: 4,
  },
  {
    title: 'Save Your Favorites',
    description: 'Create wishlists and get notified when prices drop on items you love.',
    imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=300&fit=crop',
    linkPath: '/wishlist',
    placement: 'buy-now',
    displayOrder: 5,
  },
  {
    title: 'Best Sellers Collection',
    description: 'Shop the most popular products trusted by thousands of buyers worldwide.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=300&fit=crop',
    linkPath: '/product-listing',
    linkParams: { sortBy: 'popular', title: 'Best Sellers' },
    placement: 'buy-now',
    displayOrder: 6,
  },

  // ── Product Detail page (2 new) ────────────────────────────────────────────
  {
    title: 'You Might Also Like These',
    description: 'Explore similar products from verified suppliers at competitive prices.',
    imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=300&fit=crop',
    linkPath: '/product-listing',
    placement: 'product-detail',
    displayOrder: 1,
  },
  {
    title: 'Message the Supplier Directly',
    description: 'Have questions? Chat with the supplier and get answers before you buy.',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=300&fit=crop',
    linkPath: '/messages',
    placement: 'product-detail',
    displayOrder: 2,
  },
  {
    title: 'Free Shipping on Orders Over $500',
    description: 'Add more items to your cart and qualify for free international shipping.',
    imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=300&fit=crop',
    linkPath: '/cart',
    placement: 'product-detail',
    displayOrder: 3,
  },
  {
    title: 'Check Out Our Collections',
    description: 'Curated product collections for every need. Find exactly what you are looking for.',
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=300&fit=crop',
    linkPath: '/product-listing',
    linkParams: { collections: 'true', title: 'Collections' },
    placement: 'product-detail',
    displayOrder: 4,
  },
  {
    title: 'Verified Supplier Badge',
    description: 'This supplier has been verified and rated highly by our community.',
    imageUrl: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=300&fit=crop',
    linkPath: '/verified-suppliers',
    placement: 'product-detail',
    displayOrder: 5,
  },
];

async function seed() {
  await connectDatabase();
  await Ad.deleteMany({});
  const created = await Ad.insertMany(ADS);
  console.log(`✓ Seeded ${created.length} ads`);
  console.log(`  • both/home: ${created.filter(a => a.placement === 'both').length}`);
  console.log(`  • buy-now:   ${created.filter(a => a.placement === 'buy-now').length}`);
  console.log(`  • product-detail: ${created.filter(a => a.placement === 'product-detail').length}`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });

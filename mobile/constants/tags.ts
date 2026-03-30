/**
 * Collection tags used throughout the application
 * These tags are used in collections, product filtering, and product creation
 * Note: "featured" is handled separately by the isFeatured field
 */

export const COLLECTION_TAGS = [
  'trending', 
  'new',
  'sale',
  'bestseller',
  'limited',
  'premium',
  'eco-friendly'
] as const;

export type CollectionTag = typeof COLLECTION_TAGS[number];

/**
 * Tag display labels for UI
 */
export const TAG_LABELS: Record<CollectionTag, string> = {
  trending: 'Trending',
  new: 'New',
  sale: 'Sale',
  bestseller: 'Bestseller',
  limited: 'Limited',
  premium: 'Premium',
  'eco-friendly': 'Eco-Friendly'
};
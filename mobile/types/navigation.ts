// Navigation types for product collections

export enum NavigationSource {
  HOME_FEATURED = 'home_featured',
  HOME_RECOMMENDED = 'home_recommended', 
  HOME_ALL = 'home_all',
  HOME_TRENDING = 'home_trending',
  HOME_SELLER_FAVORITES = 'home_seller_favorites',
  SEARCH_RESULTS = 'search_results',
  CATEGORY_BROWSE = 'category_browse'
}

export type CollectionType = 
  | 'featured' 
  | 'recommended' 
  | 'all' 
  | 'trending' 
  | 'seller_favorites';

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'trending';
}

export type ProductCollectionRoute = {
  'product-listing': {
    source: NavigationSource;
    collectionType: CollectionType;
    title?: string;
    filters?: ProductFilters;
  };
};
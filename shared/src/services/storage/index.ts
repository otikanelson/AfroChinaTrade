// Storage adapter exports
// These will be implemented in Task 3

export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
  multiGet<T>(keys: string[]): Promise<Record<string, T>>;
  multiSet(items: Record<string, any>): Promise<void>;
}

export { LocalStorageAdapter } from './LocalStorageAdapter';
export { AsyncStorageAdapter } from './AsyncStorageAdapter';

export const STORAGE_KEYS = {
  PRODUCTS: 'afrochinatrade:products',
  CATEGORIES: 'afrochinatrade:categories',
  USERS: 'afrochinatrade:users',
  ADMINS: 'afrochinatrade:admins',
  ORDERS: 'afrochinatrade:orders',
  SUPPLIERS: 'afrochinatrade:suppliers',
  REVIEWS: 'afrochinatrade:reviews',
  CART: 'afrochinatrade:cart',
  WISHLIST: 'afrochinatrade:wishlist',
  AUTH: 'afrochinatrade:auth',
  INITIALIZED: 'afrochinatrade:initialized',
};

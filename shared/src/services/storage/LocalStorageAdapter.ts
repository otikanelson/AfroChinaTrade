import { StorageAdapter } from './index';

/**
 * LocalStorageAdapter implements the StorageAdapter interface for web browsers
 * using the localStorage API. It provides JSON serialization/deserialization
 * and error handling for storage quota exceeded errors.
 * 
 * Requirements: 15.2, 15.3
 */
export class LocalStorageAdapter implements StorageAdapter {
  /**
   * Retrieves a value from localStorage by key
   * @param key - The storage key
   * @returns The parsed value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Failed to parse stored data for key "${key}": ${error.message}`);
      }
      throw new Error(`Failed to get item from localStorage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Stores a value in localStorage with JSON serialization
   * @param key - The storage key
   * @param value - The value to store
   * @throws Error if storage quota is exceeded
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      // Check for quota exceeded error
      if (
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' ||
          error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
      ) {
        throw new Error(
          'Storage quota exceeded. Please clear some data or free up space.'
        );
      }
      throw new Error(`Failed to set item in localStorage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Removes a value from localStorage by key
   * @param key - The storage key to remove
   */
  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      throw new Error(`Failed to remove item from localStorage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Clears all data from localStorage
   */
  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      throw new Error(`Failed to clear localStorage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Retrieves all keys from localStorage
   * @returns Array of all storage keys
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      throw new Error(`Failed to get keys from localStorage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Retrieves multiple values from localStorage by keys
   * @param keys - Array of storage keys
   * @returns Record of key-value pairs for found items
   */
  async multiGet<T>(keys: string[]): Promise<Record<string, T>> {
    const result: Record<string, T> = {};
    const errors: string[] = [];

    for (const key of keys) {
      try {
        const item = localStorage.getItem(key);
        if (item !== null) {
          result[key] = JSON.parse(item) as T;
        }
      } catch (error) {
        errors.push(`Failed to get/parse key "${key}": ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Errors during multiGet: ${errors.join('; ')}`);
    }

    return result;
  }

  /**
   * Stores multiple key-value pairs in localStorage
   * @param items - Record of key-value pairs to store
   * @throws Error if storage quota is exceeded
   */
  async multiSet(items: Record<string, any>): Promise<void> {
    const errors: string[] = [];

    for (const [key, value] of Object.entries(items)) {
      try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
      } catch (error) {
        // Check for quota exceeded error
        if (
          error instanceof DOMException &&
          (error.name === 'QuotaExceededError' ||
            error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
        ) {
          throw new Error(
            'Storage quota exceeded. Please clear some data or free up space.'
          );
        }
        errors.push(`Failed to set key "${key}": ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Errors during multiSet: ${errors.join('; ')}`);
    }
  }
}

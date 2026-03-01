import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageAdapter } from './index';

/**
 * AsyncStorageAdapter implements the StorageAdapter interface for React Native
 * using the AsyncStorage API. It provides JSON serialization/deserialization
 * and error handling for storage errors.
 * 
 * Requirements: 15.2, 15.3
 */
export class AsyncStorageAdapter implements StorageAdapter {
  /**
   * Retrieves a value from AsyncStorage by key
   * @param key - The storage key
   * @returns The parsed value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Failed to parse stored data for key "${key}": ${error.message}`);
      }
      throw new Error(`Failed to get item from AsyncStorage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Stores a value in AsyncStorage with JSON serialization
   * @param key - The storage key
   * @param value - The value to store
   * @throws Error if storage operation fails
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await AsyncStorage.setItem(key, serialized);
    } catch (error) {
      throw new Error(`Failed to set item in AsyncStorage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Removes a value from AsyncStorage by key
   * @param key - The storage key to remove
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      throw new Error(`Failed to remove item from AsyncStorage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Clears all data from AsyncStorage
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      throw new Error(`Failed to clear AsyncStorage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Retrieves all keys from AsyncStorage
   * @returns Array of all storage keys
   */
  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys]; // Convert readonly array to mutable array
    } catch (error) {
      throw new Error(`Failed to get keys from AsyncStorage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Retrieves multiple values from AsyncStorage by keys
   * @param keys - Array of storage keys
   * @returns Record of key-value pairs for found items
   */
  async multiGet<T>(keys: string[]): Promise<Record<string, T>> {
    const result: Record<string, T> = {};
    const errors: string[] = [];

    try {
      const items = await AsyncStorage.multiGet(keys);
      
      for (const [key, value] of items) {
        if (value !== null) {
          try {
            result[key] = JSON.parse(value) as T;
          } catch (error) {
            errors.push(`Failed to parse key "${key}": ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }

      if (errors.length > 0) {
        throw new Error(`Errors during multiGet: ${errors.join('; ')}`);
      }

      return result;
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Errors during multiGet')) {
        throw error;
      }
      throw new Error(`Failed to multiGet from AsyncStorage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Stores multiple key-value pairs in AsyncStorage
   * @param items - Record of key-value pairs to store
   * @throws Error if storage operation fails
   */
  async multiSet(items: Record<string, any>): Promise<void> {
    const errors: string[] = [];
    const keyValuePairs: [string, string][] = [];

    for (const [key, value] of Object.entries(items)) {
      try {
        const serialized = JSON.stringify(value);
        keyValuePairs.push([key, serialized]);
      } catch (error) {
        errors.push(`Failed to serialize key "${key}": ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Errors during multiSet serialization: ${errors.join('; ')}`);
    }

    try {
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      throw new Error(`Failed to multiSet in AsyncStorage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

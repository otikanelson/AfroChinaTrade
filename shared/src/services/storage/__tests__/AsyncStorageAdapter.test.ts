import { AsyncStorageAdapter } from '../AsyncStorageAdapter';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
}));

describe('AsyncStorageAdapter', () => {
  let adapter: AsyncStorageAdapter;

  beforeEach(() => {
    adapter = new AsyncStorageAdapter();
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return null for non-existent key', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await adapter.get('nonexistent');
      expect(result).toBeNull();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('nonexistent');
    });

    it('should retrieve and parse stored value', async () => {
      const testData = { name: 'Test', value: 123 };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testData)
      );

      const result = await adapter.get<typeof testData>('test-key');
      expect(result).toEqual(testData);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('test-key');
    });

    it('should handle different data types', async () => {
      const stringData = 'test string';
      const numberData = 42;
      const booleanData = true;
      const arrayData = [1, 2, 3];
      const objectData = { a: 1, b: 2 };

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(stringData))
        .mockResolvedValueOnce(JSON.stringify(numberData))
        .mockResolvedValueOnce(JSON.stringify(booleanData))
        .mockResolvedValueOnce(JSON.stringify(arrayData))
        .mockResolvedValueOnce(JSON.stringify(objectData));

      expect(await adapter.get('string')).toBe(stringData);
      expect(await adapter.get('number')).toBe(numberData);
      expect(await adapter.get('boolean')).toBe(booleanData);
      expect(await adapter.get('array')).toEqual(arrayData);
      expect(await adapter.get('object')).toEqual(objectData);
    });

    it('should throw error for invalid JSON', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('not valid json {');

      await expect(adapter.get('invalid')).rejects.toThrow(
        'Failed to parse stored data'
      );
    });

    it('should throw error when AsyncStorage.getItem fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      await expect(adapter.get('key')).rejects.toThrow(
        'Failed to get item from AsyncStorage'
      );
    });
  });

  describe('set', () => {
    it('should store value with JSON serialization', async () => {
      const testData = { name: 'Test', value: 123 };
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await adapter.set('test-key', testData);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(testData)
      );
    });

    it('should handle different data types', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await adapter.set('string', 'test');
      await adapter.set('number', 42);
      await adapter.set('boolean', true);
      await adapter.set('array', [1, 2, 3]);
      await adapter.set('object', { a: 1 });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'string',
        JSON.stringify('test')
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'number',
        JSON.stringify(42)
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'boolean',
        JSON.stringify(true)
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'array',
        JSON.stringify([1, 2, 3])
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'object',
        JSON.stringify({ a: 1 })
      );
    });

    it('should throw error when AsyncStorage.setItem fails', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      await expect(adapter.set('key', 'value')).rejects.toThrow(
        'Failed to set item in AsyncStorage'
      );
    });
  });

  describe('remove', () => {
    it('should remove existing key', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await adapter.remove('test-key');

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('should throw error when AsyncStorage.removeItem fails', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      await expect(adapter.remove('key')).rejects.toThrow(
        'Failed to remove item from AsyncStorage'
      );
    });
  });

  describe('clear', () => {
    it('should clear all AsyncStorage data', async () => {
      (AsyncStorage.clear as jest.Mock).mockResolvedValue(undefined);

      await adapter.clear();

      expect(AsyncStorage.clear).toHaveBeenCalled();
    });

    it('should throw error when AsyncStorage.clear fails', async () => {
      (AsyncStorage.clear as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      await expect(adapter.clear()).rejects.toThrow(
        'Failed to clear AsyncStorage'
      );
    });
  });

  describe('getAllKeys', () => {
    it('should return empty array when AsyncStorage is empty', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);

      const keys = await adapter.getAllKeys();
      expect(keys).toEqual([]);
    });

    it('should return all keys in AsyncStorage', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
        'key1',
        'key2',
        'key3',
      ]);

      const keys = await adapter.getAllKeys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('should throw error when AsyncStorage.getAllKeys fails', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      await expect(adapter.getAllKeys()).rejects.toThrow(
        'Failed to get keys from AsyncStorage'
      );
    });
  });

  describe('multiGet', () => {
    it('should return empty object for empty keys array', async () => {
      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([]);

      const result = await adapter.multiGet([]);
      expect(result).toEqual({});
    });

    it('should retrieve multiple values', async () => {
      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
        ['key1', JSON.stringify({ value: 1 })],
        ['key2', JSON.stringify({ value: 2 })],
        ['key3', JSON.stringify({ value: 3 })],
      ]);

      const result = await adapter.multiGet(['key1', 'key2', 'key3']);
      expect(result).toEqual({
        key1: { value: 1 },
        key2: { value: 2 },
        key3: { value: 3 },
      });
    });

    it('should skip non-existent keys', async () => {
      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
        ['key1', JSON.stringify('value1')],
        ['key2', null],
        ['key3', JSON.stringify('value3')],
      ]);

      const result = await adapter.multiGet(['key1', 'key2', 'key3']);
      expect(result).toEqual({
        key1: 'value1',
        key3: 'value3',
      });
      expect(result).not.toHaveProperty('key2');
    });

    it('should throw error if any key has invalid JSON', async () => {
      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
        ['key1', JSON.stringify('value1')],
        ['key2', 'invalid json {'],
      ]);

      await expect(adapter.multiGet(['key1', 'key2'])).rejects.toThrow(
        'Errors during multiGet'
      );
    });

    it('should throw error when AsyncStorage.multiGet fails', async () => {
      (AsyncStorage.multiGet as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      await expect(adapter.multiGet(['key1', 'key2'])).rejects.toThrow(
        'Failed to multiGet from AsyncStorage'
      );
    });
  });

  describe('multiSet', () => {
    it('should store multiple key-value pairs', async () => {
      (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);

      await adapter.multiSet({
        key1: 'value1',
        key2: { nested: 'value2' },
        key3: [1, 2, 3],
      });

      expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
        ['key1', JSON.stringify('value1')],
        ['key2', JSON.stringify({ nested: 'value2' })],
        ['key3', JSON.stringify([1, 2, 3])],
      ]);
    });

    it('should handle empty object', async () => {
      (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);

      await adapter.multiSet({});

      expect(AsyncStorage.multiSet).toHaveBeenCalledWith([]);
    });

    it('should throw error when AsyncStorage.multiSet fails', async () => {
      (AsyncStorage.multiSet as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      await expect(
        adapter.multiSet({ key1: 'value1', key2: 'value2' })
      ).rejects.toThrow('Failed to multiSet in AsyncStorage');
    });
  });

  describe('JSON serialization round-trip', () => {
    it('should maintain data integrity through set and get', async () => {
      const complexData = {
        string: 'test',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        nested: {
          deep: {
            value: 'nested',
          },
        },
      };

      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(complexData)
      );

      await adapter.set('complex', complexData);
      const retrieved = await adapter.get('complex');

      expect(retrieved).toEqual(complexData);
    });

    it('should handle special characters and unicode', async () => {
      const specialData = {
        emoji: '🚀🌟',
        chinese: '中文',
        special: 'Special chars: !@#$%^&*()',
      };

      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(specialData)
      );

      await adapter.set('special', specialData);
      const retrieved = await adapter.get('special');

      expect(retrieved).toEqual(specialData);
    });
  });
});

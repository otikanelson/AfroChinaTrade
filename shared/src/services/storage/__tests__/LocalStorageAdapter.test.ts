import { LocalStorageAdapter } from '../LocalStorageAdapter';

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    adapter = new LocalStorageAdapter();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('get', () => {
    it('should return null for non-existent key', async () => {
      const result = await adapter.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should retrieve and parse stored value', async () => {
      const testData = { name: 'Test', value: 123 };
      localStorage.setItem('test-key', JSON.stringify(testData));

      const result = await adapter.get<typeof testData>('test-key');
      expect(result).toEqual(testData);
    });

    it('should handle different data types', async () => {
      const stringData = 'test string';
      const numberData = 42;
      const booleanData = true;
      const arrayData = [1, 2, 3];
      const objectData = { a: 1, b: 2 };

      localStorage.setItem('string', JSON.stringify(stringData));
      localStorage.setItem('number', JSON.stringify(numberData));
      localStorage.setItem('boolean', JSON.stringify(booleanData));
      localStorage.setItem('array', JSON.stringify(arrayData));
      localStorage.setItem('object', JSON.stringify(objectData));

      expect(await adapter.get('string')).toBe(stringData);
      expect(await adapter.get('number')).toBe(numberData);
      expect(await adapter.get('boolean')).toBe(booleanData);
      expect(await adapter.get('array')).toEqual(arrayData);
      expect(await adapter.get('object')).toEqual(objectData);
    });

    it('should throw error for invalid JSON', async () => {
      localStorage.setItem('invalid', 'not valid json {');

      await expect(adapter.get('invalid')).rejects.toThrow(
        'Failed to parse stored data'
      );
    });
  });

  describe('set', () => {
    it('should store value with JSON serialization', async () => {
      const testData = { name: 'Test', value: 123 };
      await adapter.set('test-key', testData);

      const stored = localStorage.getItem('test-key');
      expect(stored).toBe(JSON.stringify(testData));
    });

    it('should handle different data types', async () => {
      await adapter.set('string', 'test');
      await adapter.set('number', 42);
      await adapter.set('boolean', true);
      await adapter.set('array', [1, 2, 3]);
      await adapter.set('object', { a: 1 });

      expect(localStorage.getItem('string')).toBe(JSON.stringify('test'));
      expect(localStorage.getItem('number')).toBe(JSON.stringify(42));
      expect(localStorage.getItem('boolean')).toBe(JSON.stringify(true));
      expect(localStorage.getItem('array')).toBe(JSON.stringify([1, 2, 3]));
      expect(localStorage.getItem('object')).toBe(JSON.stringify({ a: 1 }));
    });

    it('should overwrite existing value', async () => {
      await adapter.set('key', 'value1');
      await adapter.set('key', 'value2');

      const result = await adapter.get('key');
      expect(result).toBe('value2');
    });

    it('should throw error for quota exceeded', async () => {
      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        const error = new DOMException('Quota exceeded', 'QuotaExceededError');
        throw error;
      });

      await expect(adapter.set('key', 'value')).rejects.toThrow(
        'Storage quota exceeded'
      );

      // Restore original method
      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('remove', () => {
    it('should remove existing key', async () => {
      await adapter.set('test-key', 'test-value');
      expect(localStorage.getItem('test-key')).not.toBeNull();

      await adapter.remove('test-key');
      expect(localStorage.getItem('test-key')).toBeNull();
    });

    it('should not throw error for non-existent key', async () => {
      await expect(adapter.remove('nonexistent')).resolves.not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all localStorage data', async () => {
      await adapter.set('key1', 'value1');
      await adapter.set('key2', 'value2');
      await adapter.set('key3', 'value3');

      expect(localStorage.length).toBe(3);

      await adapter.clear();
      expect(localStorage.length).toBe(0);
    });
  });

  describe('getAllKeys', () => {
    it('should return empty array when localStorage is empty', async () => {
      const keys = await adapter.getAllKeys();
      expect(keys).toEqual([]);
    });

    it('should return all keys in localStorage', async () => {
      await adapter.set('key1', 'value1');
      await adapter.set('key2', 'value2');
      await adapter.set('key3', 'value3');

      const keys = await adapter.getAllKeys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });
  });

  describe('multiGet', () => {
    it('should return empty object for empty keys array', async () => {
      const result = await adapter.multiGet([]);
      expect(result).toEqual({});
    });

    it('should retrieve multiple values', async () => {
      await adapter.set('key1', { value: 1 });
      await adapter.set('key2', { value: 2 });
      await adapter.set('key3', { value: 3 });

      const result = await adapter.multiGet(['key1', 'key2', 'key3']);
      expect(result).toEqual({
        key1: { value: 1 },
        key2: { value: 2 },
        key3: { value: 3 },
      });
    });

    it('should skip non-existent keys', async () => {
      await adapter.set('key1', 'value1');
      await adapter.set('key3', 'value3');

      const result = await adapter.multiGet(['key1', 'key2', 'key3']);
      expect(result).toEqual({
        key1: 'value1',
        key3: 'value3',
      });
      expect(result).not.toHaveProperty('key2');
    });

    it('should throw error if any key has invalid JSON', async () => {
      await adapter.set('key1', 'value1');
      localStorage.setItem('key2', 'invalid json {');

      await expect(adapter.multiGet(['key1', 'key2'])).rejects.toThrow(
        'Errors during multiGet'
      );
    });
  });

  describe('multiSet', () => {
    it('should store multiple key-value pairs', async () => {
      await adapter.multiSet({
        key1: 'value1',
        key2: { nested: 'value2' },
        key3: [1, 2, 3],
      });

      expect(await adapter.get('key1')).toBe('value1');
      expect(await adapter.get('key2')).toEqual({ nested: 'value2' });
      expect(await adapter.get('key3')).toEqual([1, 2, 3]);
    });

    it('should handle empty object', async () => {
      await expect(adapter.multiSet({})).resolves.not.toThrow();
    });

    it('should throw error for quota exceeded', async () => {
      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        const error = new DOMException('Quota exceeded', 'QuotaExceededError');
        throw error;
      });

      await expect(
        adapter.multiSet({ key1: 'value1', key2: 'value2' })
      ).rejects.toThrow('Storage quota exceeded');

      // Restore original method
      Storage.prototype.setItem = originalSetItem;
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

      await adapter.set('special', specialData);
      const retrieved = await adapter.get('special');

      expect(retrieved).toEqual(specialData);
    });
  });
});

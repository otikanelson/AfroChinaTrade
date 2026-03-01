import { DataSerializer } from '../DataSerializer';

describe('DataSerializer', () => {
  describe('serialize', () => {
    it('should serialize simple objects', () => {
      const data = { name: 'Test', value: 123 };
      const result = DataSerializer.serialize(data);
      expect(result).toBe(JSON.stringify(data, null, 2));
    });

    it('should serialize arrays', () => {
      const data = [1, 2, 3, 4, 5];
      const result = DataSerializer.serialize(data);
      expect(result).toBe(JSON.stringify(data, null, 2));
    });

    it('should serialize nested objects', () => {
      const data = {
        user: {
          name: 'John',
          address: {
            city: 'Lagos',
            country: 'Nigeria'
          }
        }
      };
      const result = DataSerializer.serialize(data);
      expect(result).toBe(JSON.stringify(data, null, 2));
    });

    it('should serialize null and undefined', () => {
      expect(DataSerializer.serialize(null)).toBe('null');
      expect(DataSerializer.serialize(undefined)).toBe(undefined);
    });

    it('should serialize primitive values', () => {
      expect(DataSerializer.serialize('string')).toBe('"string"');
      expect(DataSerializer.serialize(123)).toBe('123');
      expect(DataSerializer.serialize(true)).toBe('true');
    });

    it('should throw error for circular references', () => {
      const circular: any = { name: 'Test' };
      circular.self = circular;
      
      expect(() => DataSerializer.serialize(circular)).toThrow('Serialization failed');
    });
  });

  describe('parse', () => {
    it('should parse valid JSON strings', () => {
      const jsonString = '{"name":"Test","value":123}';
      const result = DataSerializer.parse(jsonString);
      expect(result).toEqual({ name: 'Test', value: 123 });
    });

    it('should parse arrays', () => {
      const jsonString = '[1,2,3,4,5]';
      const result = DataSerializer.parse(jsonString);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should parse nested objects', () => {
      const jsonString = '{"user":{"name":"John","address":{"city":"Lagos"}}}';
      const result = DataSerializer.parse(jsonString);
      expect(result).toEqual({
        user: {
          name: 'John',
          address: { city: 'Lagos' }
        }
      });
    });

    it('should parse primitive values', () => {
      expect(DataSerializer.parse('"string"')).toBe('string');
      expect(DataSerializer.parse('123')).toBe(123);
      expect(DataSerializer.parse('true')).toBe(true);
      expect(DataSerializer.parse('null')).toBe(null);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => DataSerializer.parse('invalid json')).toThrow('Parsing failed');
      expect(() => DataSerializer.parse('{invalid}')).toThrow('Parsing failed');
      expect(() => DataSerializer.parse('{"unclosed":')).toThrow('Parsing failed');
    });

    it('should throw error for empty string', () => {
      expect(() => DataSerializer.parse('')).toThrow('Parsing failed');
    });
  });

  describe('isValidJSON', () => {
    it('should return true for valid JSON strings', () => {
      expect(DataSerializer.isValidJSON('{"name":"Test"}')).toBe(true);
      expect(DataSerializer.isValidJSON('[1,2,3]')).toBe(true);
      expect(DataSerializer.isValidJSON('"string"')).toBe(true);
      expect(DataSerializer.isValidJSON('123')).toBe(true);
      expect(DataSerializer.isValidJSON('true')).toBe(true);
      expect(DataSerializer.isValidJSON('null')).toBe(true);
    });

    it('should return false for invalid JSON strings', () => {
      expect(DataSerializer.isValidJSON('invalid json')).toBe(false);
      expect(DataSerializer.isValidJSON('{invalid}')).toBe(false);
      expect(DataSerializer.isValidJSON('{"unclosed":')).toBe(false);
      expect(DataSerializer.isValidJSON('')).toBe(false);
      expect(DataSerializer.isValidJSON('undefined')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(DataSerializer.isValidJSON('{}')).toBe(true);
      expect(DataSerializer.isValidJSON('[]')).toBe(true);
      expect(DataSerializer.isValidJSON('{"a":1,"b":2}')).toBe(true);
    });
  });

  describe('prettyPrint', () => {
    it('should format objects with indentation', () => {
      const data = { name: 'Test', value: 123 };
      const result = DataSerializer.prettyPrint(data);
      expect(result).toBe(JSON.stringify(data, null, 2));
      expect(result).toContain('\n');
    });

    it('should format arrays with indentation', () => {
      const data = [1, 2, 3];
      const result = DataSerializer.prettyPrint(data);
      expect(result).toBe(JSON.stringify(data, null, 2));
    });

    it('should throw error for circular references', () => {
      const circular: any = { name: 'Test' };
      circular.self = circular;
      
      expect(() => DataSerializer.prettyPrint(circular)).toThrow('Pretty print failed');
    });
  });

  describe('round-trip serialization', () => {
    it('should maintain data integrity through serialize-parse cycle', () => {
      const testData = [
        { name: 'Product', price: 99.99, inStock: true },
        { id: 1, items: [1, 2, 3], metadata: { created: '2024-01-01' } },
        ['a', 'b', 'c'],
        { nested: { deep: { value: 'test' } } }
      ];

      testData.forEach(data => {
        const serialized = DataSerializer.serialize(data);
        const parsed = DataSerializer.parse(serialized);
        expect(parsed).toEqual(data);
      });
    });

    it('should produce equivalent JSON after double serialization', () => {
      const data = { name: 'Test', value: 123 };
      const serialized1 = DataSerializer.serialize(data);
      const parsed = DataSerializer.parse(serialized1);
      const serialized2 = DataSerializer.serialize(parsed);
      
      expect(serialized1).toBe(serialized2);
    });
  });

  describe('error handling', () => {
    it('should provide descriptive error messages for serialization failures', () => {
      const circular: any = { name: 'Test' };
      circular.self = circular;
      
      try {
        DataSerializer.serialize(circular);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Serialization failed');
      }
    });

    it('should provide descriptive error messages for parsing failures', () => {
      try {
        DataSerializer.parse('invalid json');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Parsing failed');
      }
    });
  });
});

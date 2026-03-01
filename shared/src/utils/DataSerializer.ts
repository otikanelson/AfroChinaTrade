/**
 * DataSerializer utility for safe JSON serialization and deserialization
 * Provides error handling and validation for data persistence operations
 * 
 * Requirements: 15.4, 21.3, 21.5
 */
export class DataSerializer {
  /**
   * Serialize data to JSON string
   * @param data - Data to serialize
   * @returns JSON string representation
   * @throws Error if serialization fails
   */
  static serialize<T>(data: T): string {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Serialization failed: ${message}`);
    }
  }

  /**
   * Parse JSON string to typed object
   * @param jsonString - JSON string to parse
   * @returns Parsed object
   * @throws Error if parsing fails
   */
  static parse<T>(jsonString: string): T {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Parsing failed: ${message}`);
    }
  }

  /**
   * Validate JSON structure
   * @param jsonString - String to validate
   * @returns true if valid JSON, false otherwise
   */
  static isValidJSON(jsonString: string): boolean {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Pretty print data for debugging
   * @param data - Data to format
   * @returns Formatted JSON string
   */
  static prettyPrint<T>(data: T): string {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Pretty print failed: ${message}`);
    }
  }
}

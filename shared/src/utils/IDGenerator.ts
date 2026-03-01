/**
 * IDGenerator utility for generating unique IDs for all entities
 * 
 * IDs are composed of:
 * - Entity prefix (e.g., 'prod', 'ord', 'usr')
 * - Timestamp in base36 (sortable by creation time)
 * - Random string (ensures uniqueness)
 * 
 * Format: {prefix}_{timestamp}_{random}
 * Example: prod_lx3k2m_a7b9c2d
 */
export class IDGenerator {
  /**
   * Generate a unique ID with optional prefix
   * @param prefix - Optional prefix for the ID (e.g., 'prod', 'ord')
   * @returns Unique ID string
   */
  static generate(prefix?: string): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 9);
    return prefix ? `${prefix}_${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`;
  }

  /**
   * Generate a unique product ID
   * @returns Product ID with 'prod' prefix
   */
  static generateProductId(): string {
    return this.generate('prod');
  }

  /**
   * Generate a unique order ID
   * @returns Order ID with 'ord' prefix
   */
  static generateOrderId(): string {
    return this.generate('ord');
  }

  /**
   * Generate a unique user ID
   * @returns User ID with 'usr' prefix
   */
  static generateUserId(): string {
    return this.generate('usr');
  }

  /**
   * Generate a unique category ID
   * @returns Category ID with 'cat' prefix
   */
  static generateCategoryId(): string {
    return this.generate('cat');
  }

  /**
   * Generate a unique supplier ID
   * @returns Supplier ID with 'sup' prefix
   */
  static generateSupplierId(): string {
    return this.generate('sup');
  }

  /**
   * Generate a unique review ID
   * @returns Review ID with 'rev' prefix
   */
  static generateReviewId(): string {
    return this.generate('rev');
  }

  /**
   * Generate a unique admin ID
   * @returns Admin ID with 'adm' prefix
   */
  static generateAdminId(): string {
    return this.generate('adm');
  }
}

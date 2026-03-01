import { IDGenerator } from '../IDGenerator';

describe('IDGenerator', () => {
  describe('generate', () => {
    it('should generate an ID without prefix', () => {
      const id = IDGenerator.generate();
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^[a-z0-9]+_[a-z0-9]+$/);
    });

    it('should generate an ID with prefix', () => {
      const id = IDGenerator.generate('test');
      expect(id).toBeTruthy();
      expect(id).toMatch(/^test_[a-z0-9]+_[a-z0-9]+$/);
    });

    it('should generate unique IDs', () => {
      const id1 = IDGenerator.generate();
      const id2 = IDGenerator.generate();
      expect(id1).not.toBe(id2);
    });

    it('should generate sortable IDs by creation time', () => {
      const id1 = IDGenerator.generate();
      // Small delay to ensure different timestamp
      const start = Date.now();
      while (Date.now() - start < 2) {
        // Wait for at least 2ms
      }
      const id2 = IDGenerator.generate();
      
      // Extract timestamps (second part of the ID)
      const timestamp1 = id1.split('_')[0];
      const timestamp2 = id2.split('_')[0];
      
      // Compare as base36 numbers
      expect(parseInt(timestamp1, 36)).toBeLessThan(parseInt(timestamp2, 36));
    });
  });

  describe('entity-specific ID generators', () => {
    it('should generate product ID with prod prefix', () => {
      const id = IDGenerator.generateProductId();
      expect(id).toMatch(/^prod_[a-z0-9]+_[a-z0-9]+$/);
    });

    it('should generate order ID with ord prefix', () => {
      const id = IDGenerator.generateOrderId();
      expect(id).toMatch(/^ord_[a-z0-9]+_[a-z0-9]+$/);
    });

    it('should generate user ID with usr prefix', () => {
      const id = IDGenerator.generateUserId();
      expect(id).toMatch(/^usr_[a-z0-9]+_[a-z0-9]+$/);
    });

    it('should generate category ID with cat prefix', () => {
      const id = IDGenerator.generateCategoryId();
      expect(id).toMatch(/^cat_[a-z0-9]+_[a-z0-9]+$/);
    });

    it('should generate supplier ID with sup prefix', () => {
      const id = IDGenerator.generateSupplierId();
      expect(id).toMatch(/^sup_[a-z0-9]+_[a-z0-9]+$/);
    });

    it('should generate review ID with rev prefix', () => {
      const id = IDGenerator.generateReviewId();
      expect(id).toMatch(/^rev_[a-z0-9]+_[a-z0-9]+$/);
    });

    it('should generate admin ID with adm prefix', () => {
      const id = IDGenerator.generateAdminId();
      expect(id).toMatch(/^adm_[a-z0-9]+_[a-z0-9]+$/);
    });
  });

  describe('uniqueness across entity types', () => {
    it('should generate unique IDs across different entity types', () => {
      const productId = IDGenerator.generateProductId();
      const orderId = IDGenerator.generateOrderId();
      const userId = IDGenerator.generateUserId();
      const categoryId = IDGenerator.generateCategoryId();
      const supplierId = IDGenerator.generateSupplierId();
      const reviewId = IDGenerator.generateReviewId();
      const adminId = IDGenerator.generateAdminId();

      const ids = [productId, orderId, userId, categoryId, supplierId, reviewId, adminId];
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should generate multiple unique IDs for the same entity type', () => {
      const ids = Array.from({ length: 100 }, () => IDGenerator.generateProductId());
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(100);
    });
  });

  describe('ID format and human-readability', () => {
    it('should generate IDs with consistent format', () => {
      const id = IDGenerator.generate('prefix');
      const parts = id.split('_');
      
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe('prefix');
      expect(parts[1]).toBeTruthy(); // timestamp
      expect(parts[2]).toBeTruthy(); // random string
    });

    it('should generate IDs with reasonable length', () => {
      const id = IDGenerator.generateProductId();
      // Format: prod_timestamp_random
      // Typical length should be around 20-25 characters
      expect(id.length).toBeGreaterThan(15);
      expect(id.length).toBeLessThan(35);
    });
  });
});

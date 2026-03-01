/**
 * Unit tests for ServiceError class and error handling utilities
 */

import {
  ServiceError,
  ERROR_CODES,
  handleServiceOperation,
  createNotFoundError,
  createValidationError,
  createDuplicateError,
  createStorageFullError,
  createParseError,
  createUnauthorizedError,
  createForbiddenError,
} from '../ServiceError';

describe('ServiceError', () => {
  describe('ServiceError class', () => {
    it('should create a ServiceError with message, code, and statusCode', () => {
      const error = new ServiceError('Test error', ERROR_CODES.NOT_FOUND, 404);
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ServiceError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ERROR_CODES.NOT_FOUND);
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('ServiceError');
    });

    it('should default statusCode to 500 if not provided', () => {
      const error = new ServiceError('Test error', ERROR_CODES.UNKNOWN_ERROR);
      
      expect(error.statusCode).toBe(500);
    });

    it('should maintain proper stack trace', () => {
      const error = new ServiceError('Test error', ERROR_CODES.NOT_FOUND, 404);
      
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ServiceError');
    });
  });

  describe('ERROR_CODES', () => {
    it('should have all expected error codes', () => {
      expect(ERROR_CODES.NOT_FOUND).toBe('NOT_FOUND');
      expect(ERROR_CODES.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ERROR_CODES.DUPLICATE_ENTRY).toBe('DUPLICATE_ENTRY');
      expect(ERROR_CODES.STORAGE_FULL).toBe('STORAGE_FULL');
      expect(ERROR_CODES.PARSE_ERROR).toBe('PARSE_ERROR');
      expect(ERROR_CODES.UNAUTHORIZED).toBe('UNAUTHORIZED');
      expect(ERROR_CODES.FORBIDDEN).toBe('FORBIDDEN');
      expect(ERROR_CODES.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(ERROR_CODES.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    });
  });

  describe('handleServiceOperation', () => {
    it('should return success response when operation succeeds', async () => {
      const operation = async () => ({ id: '1', name: 'Test' });
      
      const result = await handleServiceOperation(operation);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: '1', name: 'Test' });
      expect(result.error).toBeUndefined();
    });

    it('should return error response when operation throws ServiceError', async () => {
      const operation = async () => {
        throw new ServiceError('Not found', ERROR_CODES.NOT_FOUND, 404);
      };
      
      const result = await handleServiceOperation(operation);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Not found');
      expect(result.data).toBeUndefined();
    });

    it('should return error response when operation throws regular Error', async () => {
      const operation = async () => {
        throw new Error('Something went wrong');
      };
      
      const result = await handleServiceOperation(operation);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Something went wrong');
      expect(result.data).toBeUndefined();
    });

    it('should return generic error message for unknown errors', async () => {
      const operation = async () => {
        throw 'String error';
      };
      
      const result = await handleServiceOperation(operation);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('An unexpected error occurred');
      expect(result.data).toBeUndefined();
    });
  });

  describe('Error factory functions', () => {
    describe('createNotFoundError', () => {
      it('should create a not found error with correct properties', () => {
        const error = createNotFoundError('Product', '123');
        
        expect(error).toBeInstanceOf(ServiceError);
        expect(error.message).toBe('Product with ID 123 not found');
        expect(error.code).toBe(ERROR_CODES.NOT_FOUND);
        expect(error.statusCode).toBe(404);
      });
    });

    describe('createValidationError', () => {
      it('should create a validation error with correct properties', () => {
        const error = createValidationError('Invalid email format');
        
        expect(error).toBeInstanceOf(ServiceError);
        expect(error.message).toBe('Invalid email format');
        expect(error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(error.statusCode).toBe(400);
      });
    });

    describe('createDuplicateError', () => {
      it('should create a duplicate error with correct properties', () => {
        const error = createDuplicateError('User', 'email');
        
        expect(error).toBeInstanceOf(ServiceError);
        expect(error.message).toBe('User with this email already exists');
        expect(error.code).toBe(ERROR_CODES.DUPLICATE_ENTRY);
        expect(error.statusCode).toBe(409);
      });
    });

    describe('createStorageFullError', () => {
      it('should create a storage full error with correct properties', () => {
        const error = createStorageFullError();
        
        expect(error).toBeInstanceOf(ServiceError);
        expect(error.message).toBe('Storage capacity exceeded. Please free up space and try again.');
        expect(error.code).toBe(ERROR_CODES.STORAGE_FULL);
        expect(error.statusCode).toBe(507);
      });
    });

    describe('createParseError', () => {
      it('should create a parse error with details', () => {
        const error = createParseError('Invalid JSON');
        
        expect(error).toBeInstanceOf(ServiceError);
        expect(error.message).toBe('Failed to parse data: Invalid JSON');
        expect(error.code).toBe(ERROR_CODES.PARSE_ERROR);
        expect(error.statusCode).toBe(400);
      });

      it('should create a parse error without details', () => {
        const error = createParseError();
        
        expect(error).toBeInstanceOf(ServiceError);
        expect(error.message).toBe('Failed to parse data');
        expect(error.code).toBe(ERROR_CODES.PARSE_ERROR);
        expect(error.statusCode).toBe(400);
      });
    });

    describe('createUnauthorizedError', () => {
      it('should create an unauthorized error with custom message', () => {
        const error = createUnauthorizedError('Invalid credentials');
        
        expect(error).toBeInstanceOf(ServiceError);
        expect(error.message).toBe('Invalid credentials');
        expect(error.code).toBe(ERROR_CODES.UNAUTHORIZED);
        expect(error.statusCode).toBe(401);
      });

      it('should create an unauthorized error with default message', () => {
        const error = createUnauthorizedError();
        
        expect(error).toBeInstanceOf(ServiceError);
        expect(error.message).toBe('Unauthorized access');
        expect(error.code).toBe(ERROR_CODES.UNAUTHORIZED);
        expect(error.statusCode).toBe(401);
      });
    });

    describe('createForbiddenError', () => {
      it('should create a forbidden error with custom message', () => {
        const error = createForbiddenError('Insufficient permissions');
        
        expect(error).toBeInstanceOf(ServiceError);
        expect(error.message).toBe('Insufficient permissions');
        expect(error.code).toBe(ERROR_CODES.FORBIDDEN);
        expect(error.statusCode).toBe(403);
      });

      it('should create a forbidden error with default message', () => {
        const error = createForbiddenError();
        
        expect(error).toBeInstanceOf(ServiceError);
        expect(error.message).toBe('Access forbidden');
        expect(error.code).toBe(ERROR_CODES.FORBIDDEN);
        expect(error.statusCode).toBe(403);
      });
    });
  });
});

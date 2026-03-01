/**
 * ServiceError class and error handling utilities
 * Provides standardized error handling for all service operations
 */

import { ServiceResponse } from '../types/service';

/**
 * Custom error class for service operations
 * Extends Error with additional code and statusCode properties
 */
export class ServiceError extends Error {
  public code: string;
  public statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.statusCode = statusCode;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServiceError);
    }
  }
}

/**
 * Standard error codes used across all services
 */
export const ERROR_CODES = {
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  STORAGE_FULL: 'STORAGE_FULL',
  PARSE_ERROR: 'PARSE_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * Type for error codes
 */
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * Wrapper function for service operations that provides consistent error handling
 * Catches errors and formats them into ServiceResponse objects
 * 
 * @param operation - Async function to execute
 * @returns ServiceResponse with success/error status
 */
export async function handleServiceOperation<T>(
  operation: () => Promise<T>
): Promise<ServiceResponse<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Checks storage quota and warns if nearly full
 * Only works in browsers that support the Storage API
 */
export async function checkStorageQuota(): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      if (estimate.usage && estimate.quota) {
        const percentUsed = (estimate.usage / estimate.quota) * 100;
        if (percentUsed > 90) {
          console.warn(`Storage quota nearly full: ${percentUsed.toFixed(2)}%`);
        }
      }
    } catch (error) {
      // Silently fail if storage estimate is not available
      console.debug('Storage quota check failed:', error);
    }
  }
}

/**
 * Creates a ServiceError for not found scenarios
 */
export function createNotFoundError(resource: string, id: string): ServiceError {
  return new ServiceError(
    `${resource} with ID ${id} not found`,
    ERROR_CODES.NOT_FOUND,
    404
  );
}

/**
 * Creates a ServiceError for validation failures
 */
export function createValidationError(message: string): ServiceError {
  return new ServiceError(message, ERROR_CODES.VALIDATION_ERROR, 400);
}

/**
 * Creates a ServiceError for duplicate entries
 */
export function createDuplicateError(resource: string, field: string): ServiceError {
  return new ServiceError(
    `${resource} with this ${field} already exists`,
    ERROR_CODES.DUPLICATE_ENTRY,
    409
  );
}

/**
 * Creates a ServiceError for storage quota exceeded
 */
export function createStorageFullError(): ServiceError {
  return new ServiceError(
    'Storage capacity exceeded. Please free up space and try again.',
    ERROR_CODES.STORAGE_FULL,
    507
  );
}

/**
 * Creates a ServiceError for parse failures
 */
export function createParseError(details?: string): ServiceError {
  const message = details 
    ? `Failed to parse data: ${details}`
    : 'Failed to parse data';
  return new ServiceError(message, ERROR_CODES.PARSE_ERROR, 400);
}

/**
 * Creates a ServiceError for unauthorized access
 */
export function createUnauthorizedError(message: string = 'Unauthorized access'): ServiceError {
  return new ServiceError(message, ERROR_CODES.UNAUTHORIZED, 401);
}

/**
 * Creates a ServiceError for forbidden access
 */
export function createForbiddenError(message: string = 'Access forbidden'): ServiceError {
  return new ServiceError(message, ERROR_CODES.FORBIDDEN, 403);
}

import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import { ValidationApiError } from './errorHandler';

// Email validation regex (more restrictive)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Phone validation regex (international format)
const PHONE_REGEX = /^[\+]?[(]?[\d\s\-\(\)]{10,}$/;

// Validation helper functions
export const validateEmail = (email: string): boolean => {
  // More restrictive validation to prevent consecutive dots
  if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
    return false;
  }
  return EMAIL_REGEX.test(email);
};

export const validatePhone = (phone: string): boolean => {
  return PHONE_REGEX.test(phone);
};

export const validatePrice = (price: any): boolean => {
  return typeof price === 'number' && price >= 0;
};

export const validateRequiredFields = (fields: any, requiredFields: string[]) => {
  const missing = requiredFields.filter((field) => !fields[field]);
  return missing.length === 0 ? null : missing;
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .replace(/[\$]/g, '') // Remove MongoDB injection characters
    .trim();
};

// Comprehensive validation middleware
export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Run all validations
      await Promise.all(validations.map(validation => validation.run(req)));

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((error: any) => ({
          field: error.param || error.path,
          message: error.msg,
          value: error.value,
          location: error.location
        }));

        return next(new ValidationApiError('Validation failed', formattedErrors));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Common validation chains
export const emailValidation = body('email')
  .isEmail()
  .withMessage('Please provide a valid email address')
  .normalizeEmail()
  .custom((email) => {
    if (!validateEmail(email)) {
      throw new Error('Email format is invalid');
    }
    return true;
  });

export const phoneValidation = body('phone')
  .optional()
  .custom((phone) => {
    if (phone && !validatePhone(phone)) {
      throw new Error('Phone number format is invalid');
    }
    return true;
  });

export const priceValidation = body('price')
  .isNumeric()
  .withMessage('Price must be a number')
  .custom((price) => {
    if (!validatePrice(parseFloat(price))) {
      throw new Error('Price must be a positive number');
    }
    return true;
  });

export const passwordValidation = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one letter and one number');

export const nameValidation = body('name')
  .isLength({ min: 2, max: 100 })
  .withMessage('Name must be between 2 and 100 characters')
  .matches(/^[a-zA-Z\s]+$/)
  .withMessage('Name can only contain letters and spaces');

// Product validation
export const productValidation = [
  body('name')
    .isLength({ min: 3, max: 200 })
    .withMessage('Product name must be between 3 and 200 characters')
    .trim(),
  body('description')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Product description must be between 10 and 2000 characters')
    .trim(),
  priceValidation,
  body('categoryId')
    .notEmpty()
    .withMessage('Category ID is required')
    .isMongoId()
    .withMessage('Category ID must be a valid MongoDB ObjectId'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('discount')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount must be between 0 and 100')
];

// User validation
export const userValidation = [
  nameValidation,
  emailValidation,
  passwordValidation,
  phoneValidation
];

// Order validation
export const orderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.productId')
    .isMongoId()
    .withMessage('Product ID must be valid'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('deliveryAddress.fullName')
    .notEmpty()
    .withMessage('Full name is required'),
  body('deliveryAddress.phone')
    .notEmpty()
    .withMessage('Phone number is required'),
  body('deliveryAddress.street')
    .notEmpty()
    .withMessage('Street address is required'),
  body('deliveryAddress.city')
    .notEmpty()
    .withMessage('City is required'),
  body('deliveryAddress.state')
    .notEmpty()
    .withMessage('State is required'),
  body('deliveryAddress.country')
    .notEmpty()
    .withMessage('Country is required'),
  body('deliveryAddress.postalCode')
    .notEmpty()
    .withMessage('Postal code is required')
];

// Review validation
export const reviewValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Product ID must be valid'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters')
    .trim()
];

// Message validation middleware
export const validateMessage = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { threadId, text } = req.body;
    const errors: string[] = [];

    if (!threadId || typeof threadId !== 'string' || threadId.trim().length === 0) {
      errors.push('Thread ID is required and must be a non-empty string');
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      errors.push('Message text is required and must be a non-empty string');
    } else if (text.length > 1000) {
      errors.push('Message text must not exceed 1000 characters');
    }

    if (errors.length > 0) {
      return next(new ValidationApiError('Message validation failed', errors));
    }

    // Sanitize inputs
    req.body.threadId = sanitizeInput(threadId);
    req.body.text = sanitizeInput(text);

    next();
  } catch (error) {
    next(error);
  }
};

// Generic input sanitization middleware
export const sanitizeInputs = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    }
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeInput(req.query[key] as string);
      }
    }
  }

  next();
};

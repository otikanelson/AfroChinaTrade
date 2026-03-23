import express, { Request, Response, NextFunction } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import {
  getPaymentMethods,
  getPaymentMethod,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod
} from '../controllers/paymentMethodController';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Wrapper to handle AuthRequest type
const asyncHandler = (fn: (req: AuthRequest, res: Response) => Promise<void>) => 
  (req: Request, res: Response, next: NextFunction) => fn(req as AuthRequest, res).catch(next);

// Get all payment methods
router.get('/', asyncHandler(getPaymentMethods));

// Get a specific payment method
router.get('/:id', asyncHandler(getPaymentMethod));

// Add a new payment method
router.post('/', asyncHandler(addPaymentMethod));

// Update a payment method
router.put('/:id', asyncHandler(updatePaymentMethod));

// Delete a payment method
router.delete('/:id', asyncHandler(deletePaymentMethod));

// Set as default
router.patch('/:id/set-default', asyncHandler(setDefaultPaymentMethod));

export default router;

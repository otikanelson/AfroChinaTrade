import { Router, Request, Response, NextFunction } from 'express';
import {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../controllers/deliveryAddressController';
import { verifyToken, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// Wrapper to handle AuthRequest type
const asyncHandler = (fn: (req: AuthRequest, res: Response) => Promise<void>) => 
  (req: Request, res: Response, next: NextFunction) => fn(req as AuthRequest, res).catch(next);

// Get all addresses for user
router.get('/', asyncHandler(getAddresses));

// Get single address
router.get('/:id', asyncHandler(getAddressById));

// Create new address
router.post('/', asyncHandler(createAddress));

// Update address
router.put('/:id', asyncHandler(updateAddress));

// Delete address
router.delete('/:id', asyncHandler(deleteAddress));

// Set as default address
router.patch('/:id/set-default', asyncHandler(setDefaultAddress));

export default router;

import express from 'express';
import { verifyToken, authorize } from '../middleware/auth';
import { getAds, createAd, updateAd, deleteAd } from '../controllers/adController';

const router = express.Router();

router.get('/', getAds);
router.post('/', verifyToken, authorize('admin'), createAd);
router.put('/:id', verifyToken, authorize('admin'), updateAd);
router.delete('/:id', verifyToken, authorize('admin'), deleteAd);

export default router;

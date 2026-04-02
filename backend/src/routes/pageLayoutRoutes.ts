import express from 'express';
import { verifyToken, authorize } from '../middleware/auth';
import { getPageLayout, updatePageLayout, resetPageLayout } from '../controllers/pageLayoutController';

const router = express.Router();

router.get('/:page', getPageLayout);
router.put('/:page', verifyToken, authorize('admin'), updatePageLayout);
router.post('/:page/reset', verifyToken, authorize('admin'), resetPageLayout);

export default router;

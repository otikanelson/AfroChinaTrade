import { Router } from 'express';
import {
  createReport,
  getReports,
  updateReportStatus,
} from '../controllers/reportController';
import { verifyToken, authorize } from '../middleware/auth';

const router = Router();

router.post('/', verifyToken, createReport);
router.get('/', verifyToken, authorize('admin'), getReports);
router.patch('/:id/status', verifyToken, authorize('admin'), updateReportStatus);

export default router;

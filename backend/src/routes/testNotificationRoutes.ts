import express from 'express';
import { verifyToken } from '../middleware/auth';
import { simpleTest } from '../controllers/simpleTestController';

const router = express.Router();

// Test notification endpoints (admin only for security)
router.post('/test', verifyToken, simpleTest);

export default router;
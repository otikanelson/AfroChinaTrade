import express, { RequestHandler } from 'express';
import { verifyToken, authorize } from '../middleware/auth';
import { allowSuspendedUsers } from '../middleware/userStatus';
import {
  createTicket,
  getUserTickets,
  getTicketById,
  getAllTickets,
  updateTicket,
  getUserSuspensionAppeals
} from '../controllers/ticketController';

const router = express.Router();

// User routes (suspended users can create tickets)
router.post('/', verifyToken, allowSuspendedUsers, createTicket as RequestHandler);
router.get('/my-tickets', verifyToken, allowSuspendedUsers, getUserTickets as RequestHandler);
router.get('/:id', verifyToken, allowSuspendedUsers, getTicketById as RequestHandler);

// Admin routes
router.get('/', verifyToken, authorize('admin', 'super_admin'), getAllTickets as RequestHandler);
router.put('/:id', verifyToken, authorize('admin', 'super_admin'), updateTicket as RequestHandler);
router.get('/user/:userId/appeals', verifyToken, authorize('admin', 'super_admin'), getUserSuspensionAppeals as RequestHandler);

export default router;
import express from 'express';
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
router.post('/', verifyToken, allowSuspendedUsers, createTicket);
router.get('/my-tickets', verifyToken, allowSuspendedUsers, getUserTickets);
router.get('/:id', verifyToken, allowSuspendedUsers, getTicketById);

// Admin routes
router.get('/', verifyToken, authorize('admin', 'super_admin'), getAllTickets);
router.put('/:id', verifyToken, authorize('admin', 'super_admin'), updateTicket);
router.get('/user/:userId/appeals', verifyToken, authorize('admin', 'super_admin'), getUserSuspensionAppeals);

export default router;
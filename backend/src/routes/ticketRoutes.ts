import { Router } from 'express';
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  updateTicketPriority,
} from '../controllers/ticketController';
import { verifyToken, authorize } from '../middleware/auth';

const router = Router();

router.post('/', verifyToken, createTicket);
router.get('/', verifyToken, getTickets);
router.get('/:id', verifyToken, getTicketById);
router.patch('/:id/status', verifyToken, authorize('admin'), updateTicketStatus);
router.patch('/:id/priority', verifyToken, authorize('admin'), updateTicketPriority);

export default router;

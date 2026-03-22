import { Router } from 'express';
import { getStates, getLGAs } from '../controllers/locationController';

const router = Router();

// Get all states (public endpoint)
router.get('/states', getStates);

// Get LGAs for a specific state (public endpoint)
router.get('/states/:state/lgas', getLGAs);

export default router;

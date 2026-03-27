import { Router } from 'express';

import { createSOS, getEmergencies } from '../controllers/emergencyController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, createSOS);
router.get('/', getEmergencies);

export default router;

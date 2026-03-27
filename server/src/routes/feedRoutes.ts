import { Router } from 'express';

import { createPost, getFeed } from '../controllers/feedController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', getFeed);
router.post('/', authenticateToken, createPost);

export default router;

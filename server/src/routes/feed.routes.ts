import { Router } from 'express';
import { getFeed } from '../controllers/feed.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, getFeed);

export default router;

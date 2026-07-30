import { Router } from 'express';
import { getAdminStats } from '../controllers/adminStats.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/authorize';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/', getAdminStats);

export default router;

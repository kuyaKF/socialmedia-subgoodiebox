import { Router } from 'express';
import {
  advanceGoodieBoxOrder,
  listGoodieBoxOrdersByStatus,
} from '../controllers/adminGoodieBox.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/authorize';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/', listGoodieBoxOrdersByStatus);
router.post('/:id/advance', advanceGoodieBoxOrder);

export default router;

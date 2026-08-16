import { Router } from 'express';
import {
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
} from '../controllers/announcements.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/authorize';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.post('/', createAnnouncement);
router.patch('/:id', updateAnnouncement);
router.delete('/:id', deleteAnnouncement);

export default router;

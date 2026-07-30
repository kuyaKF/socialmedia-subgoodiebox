import { Router } from 'express';
import { createAnnouncement, deleteAnnouncement } from '../controllers/announcements.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/authorize';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.post('/', createAnnouncement);
router.delete('/:id', deleteAnnouncement);

export default router;

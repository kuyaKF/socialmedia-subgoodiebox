import { Router } from 'express';
import {
  createGroupPost,
  deleteGroupPost,
  getGroupFeed,
  getMyGroupFeed,
  updateGroupPost,
} from '../controllers/groupPosts.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/authorize';

const router = Router();

router.use(requireAuth);

router.get('/', getMyGroupFeed);
router.post('/', createGroupPost);
router.get('/:groupId', requireRole('admin'), getGroupFeed);
router.patch('/:id', updateGroupPost);
router.delete('/:id', deleteGroupPost);

export default router;

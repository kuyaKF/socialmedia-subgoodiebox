import { Router } from 'express';
import { createGroupPost, deleteGroupPost, getMyGroupFeed } from '../controllers/groupPosts.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getMyGroupFeed);
router.post('/', createGroupPost);
router.delete('/:id', deleteGroupPost);

export default router;

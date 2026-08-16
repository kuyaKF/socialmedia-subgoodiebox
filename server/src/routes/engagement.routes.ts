import { Router } from 'express';
import {
  createComment,
  deleteComment,
  listComments,
  toggleLike,
} from '../controllers/engagement.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Reading comments is public — the blog's per-post page shows them to guests too.
router.get('/comments', listComments);

router.use(requireAuth);

router.post('/likes/toggle', toggleLike);
router.post('/comments', createComment);
router.delete('/comments/:id', deleteComment);

export default router;

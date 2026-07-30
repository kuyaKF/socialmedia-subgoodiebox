import { Router } from 'express';
import {
  createBlogPost,
  deleteBlogPost,
  getBlogPost,
  listBlogPosts,
} from '../controllers/blogPosts.controller';
import { optionalAuth, requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/authorize';

const router = Router();

router.get('/', listBlogPosts);
router.get('/:id', optionalAuth, getBlogPost);
router.post('/', requireAuth, requireRole('admin'), createBlogPost);
router.delete('/:id', requireAuth, requireRole('admin'), deleteBlogPost);

export default router;

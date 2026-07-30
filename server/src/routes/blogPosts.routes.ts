import { Router } from 'express';
import {
  createBlogPost,
  deleteBlogPost,
  getBlogPost,
  listBlogPosts,
  updateBlogPost,
} from '../controllers/blogPosts.controller';
import { uploadBlogImage } from '../controllers/blogImages.controller';
import { optionalAuth, requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/authorize';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', listBlogPosts);
router.get('/:id', optionalAuth, getBlogPost);
router.post('/', requireAuth, requireRole('admin'), createBlogPost);
router.post('/images', requireAuth, requireRole('admin'), upload.single('image'), uploadBlogImage);
router.patch('/:id', requireAuth, requireRole('admin'), updateBlogPost);
router.delete('/:id', requireAuth, requireRole('admin'), deleteBlogPost);

export default router;

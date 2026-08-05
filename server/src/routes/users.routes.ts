import { Router } from 'express';
import {
  changeMyPassword,
  createStaffUser,
  getUser,
  listUsers,
  updateMe,
  updateUserRole,
} from '../controllers/users.controller';
import { uploadAvatarImage } from '../controllers/userImages.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/authorize';
import { authAttemptLimiter } from '../middleware/rateLimit';
import { upload } from '../middleware/upload';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole('admin'), listUsers);
router.post('/staff', requireRole('admin'), createStaffUser);
router.patch('/me', updateMe);
router.patch('/me/password', authAttemptLimiter, changeMyPassword);
router.post('/me/avatar', upload.single('image'), uploadAvatarImage);
router.patch('/:id/role', requireRole('admin'), updateUserRole);
router.get('/:id', getUser);

export default router;

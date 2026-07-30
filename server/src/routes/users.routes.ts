import { Router } from 'express';
import {
  changeMyPassword,
  createStaffUser,
  getUser,
  listUsers,
  updateMe,
  updateUserRole,
} from '../controllers/users.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/authorize';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole('admin'), listUsers);
router.post('/staff', requireRole('admin'), createStaffUser);
router.patch('/me', updateMe);
router.patch('/me/password', changeMyPassword);
router.patch('/:id/role', requireRole('admin'), updateUserRole);
router.get('/:id', getUser);

export default router;

import { Router } from 'express';
import {
  addMember,
  createGroup,
  deleteGroup,
  getGroup,
  getMyGroup,
  listGroups,
  removeMember,
  setLeader,
  updateGroup,
} from '../controllers/groups.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/authorize';

const router = Router();

router.use(requireAuth);

// Member-accessible — must be registered before the admin gate below.
router.get('/mine', getMyGroup);

router.use(requireRole('admin'));

router.get('/', listGroups);
router.post('/', createGroup);
router.get('/:id', getGroup);
router.patch('/:id', updateGroup);
router.delete('/:id', deleteGroup);
router.patch('/:id/leader', setLeader);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

export default router;

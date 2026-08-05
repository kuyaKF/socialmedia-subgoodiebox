import { Router } from 'express';
import {
  login,
  logout,
  me,
  register,
  resendVerification,
  verifyEmail,
} from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { authAttemptLimiter, registerLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/register', registerLimiter, register);
router.post('/login', authAttemptLimiter, login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', requireAuth, resendVerification);

export default router;

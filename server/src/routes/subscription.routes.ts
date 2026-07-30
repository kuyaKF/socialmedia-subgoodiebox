import { Router } from 'express';
import { cancelMySubscription, getMySubscription } from '../controllers/subscription.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/me', getMySubscription);
router.post('/cancel', cancelMySubscription);

export default router;

import { Router } from 'express';
import { createCheckout } from '../controllers/payments.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/create-checkout', requireAuth, createCheckout);

export default router;

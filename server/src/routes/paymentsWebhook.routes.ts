import { Router } from 'express';
import { handleWebhook } from '../controllers/payments.controller';

const router = Router();

// No requireAuth — PayMongo calls this directly. Authenticity is established by verifying the
// Paymongo-Signature header inside the controller, not by session/cookie auth.
router.post('/', handleWebhook);

export default router;

import { Router } from 'express';
import { handleGoodieBoxWebhook } from '../controllers/goodieBoxWebhook.controller';

const router = Router();

// No requireAuth — PayMongo calls this directly. Authenticity is established by verifying the
// Paymongo-Signature header inside the controller, not by session/cookie auth.
router.post('/', handleGoodieBoxWebhook);

export default router;

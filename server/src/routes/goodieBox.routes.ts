import { Router } from 'express';
import { createGoodieBoxCheckout, listMyGoodieBoxOrders } from '../controllers/goodieBox.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/create-checkout', createGoodieBoxCheckout);
router.get('/my-orders', listMyGoodieBoxOrders);

export default router;

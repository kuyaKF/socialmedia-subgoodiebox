import { Request, Response } from 'express';
import { HttpError } from '../middleware/errorHandler';
import { GoodieBoxDeliveryStatus, GoodieBoxOrder } from '../models/GoodieBoxOrder';
import { asyncHandler } from '../utils/asyncHandler';

const MAX_PAGE_SIZE = 100;
const VALID_STATUSES: GoodieBoxDeliveryStatus[] = ['pending_delivery', 'in_progress', 'complete'];

export const listGoodieBoxOrdersByStatus = asyncHandler(async (req: Request, res: Response) => {
  const deliveryStatus = req.query.deliveryStatus as string;
  if (!VALID_STATUSES.includes(deliveryStatus as GoodieBoxDeliveryStatus)) {
    throw new HttpError(400, `deliveryStatus must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.limit as string, 10) || 10));

  const filter = { deliveryStatus, paymentStatus: 'paid' };
  // Oldest-first for the active queue (fair fulfillment order), most-recently-finished-first
  // once complete (more useful for reviewing recent activity).
  const sortDirection = deliveryStatus === 'complete' ? -1 : 1;

  const [orders, total] = await Promise.all([
    GoodieBoxOrder.find(filter)
      .sort({ createdAt: sortDirection })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name email'),
    GoodieBoxOrder.countDocuments(filter),
  ]);

  res.json({ orders, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
});

const NEXT_STATUS: Record<GoodieBoxDeliveryStatus, GoodieBoxDeliveryStatus | null> = {
  pending_delivery: 'in_progress',
  in_progress: 'complete',
  complete: null,
};

export const advanceGoodieBoxOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await GoodieBoxOrder.findById(req.params.id);
  if (!order) {
    throw new HttpError(404, 'Order not found');
  }
  if (order.paymentStatus !== 'paid') {
    throw new HttpError(400, 'Order has not been paid yet');
  }

  const next = NEXT_STATUS[order.deliveryStatus];
  if (!next) {
    throw new HttpError(400, 'Order is already complete');
  }

  order.deliveryStatus = next;
  await order.save();
  await order.populate('user', 'name email');
  res.json({ order });
});

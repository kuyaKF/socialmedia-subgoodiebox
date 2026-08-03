import mongoose, { Document, Schema, Types } from 'mongoose';

export type GoodieBoxPaymentStatus = 'pending' | 'paid' | 'failed' | 'expired';
export type GoodieBoxDeliveryStatus = 'pending_delivery' | 'in_progress' | 'complete';

export interface IGoodieBoxOrder extends Document {
  user: Types.ObjectId;
  fullName: string;
  phone: string;
  address: string;
  deliveryNotes?: string;
  amount: number;
  currency: string;
  checkoutSessionId: string;
  paymentStatus: GoodieBoxPaymentStatus;
  deliveryStatus: GoodieBoxDeliveryStatus;
  createdAt: Date;
}

const goodieBoxOrderSchema = new Schema<IGoodieBoxOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    deliveryNotes: { type: String, default: '' },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'PHP' },
    checkoutSessionId: { type: String, required: true, unique: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'expired'],
      default: 'pending',
    },
    deliveryStatus: {
      type: String,
      enum: ['pending_delivery', 'in_progress', 'complete'],
      default: 'pending_delivery',
    },
  },
  { timestamps: true }
);

goodieBoxOrderSchema.index({ deliveryStatus: 1, paymentStatus: 1, createdAt: 1 });

export const GoodieBoxOrder = mongoose.model<IGoodieBoxOrder>(
  'GoodieBoxOrder',
  goodieBoxOrderSchema
);

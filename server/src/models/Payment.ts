import mongoose, { Document, Schema, Types } from 'mongoose';
import { PaidPlan } from '../config/plans';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired';

export interface IPayment extends Document {
  user: Types.ObjectId;
  plan: PaidPlan;
  amount: number;
  currency: string;
  checkoutSessionId: string;
  status: PaymentStatus;
  createdAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: String, enum: ['starter', 'plus', 'premium'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'PHP' },
    checkoutSessionId: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'expired'], default: 'pending' },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

import mongoose, { Document, Schema, Types } from 'mongoose';
import { PaidPlan } from '../config/plans';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired';
export type PaymentSource = 'checkout' | 'subscription_invoice';

export interface IPayment extends Document {
  user: Types.ObjectId;
  plan: PaidPlan;
  amount: number;
  currency: string;
  checkoutSessionId?: string;
  paymongoInvoiceId?: string;
  source: PaymentSource;
  status: PaymentStatus;
  createdAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: String, enum: ['starter', 'plus', 'premium'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'PHP' },
    // Set for one-time Checkout Session purchases only.
    checkoutSessionId: { type: String, unique: true, sparse: true },
    // Set for recurring-subscription invoice charges only.
    paymongoInvoiceId: { type: String, unique: true, sparse: true },
    source: { type: String, enum: ['checkout', 'subscription_invoice'], default: 'checkout' },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'expired'], default: 'pending' },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

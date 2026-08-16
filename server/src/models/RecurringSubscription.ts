import mongoose, { Document, Schema, Types } from 'mongoose';
import { PaidPlan } from '../config/plans';

export type RecurringSubscriptionStatus = 'active' | 'past_due' | 'unpaid' | 'cancelled';

export interface IRecurringSubscription extends Document {
  user: Types.ObjectId;
  plan: PaidPlan;
  paymongoCustomerId: string;
  paymongoSubscriptionId: string;
  paymongoPaymentMethodId: string;
  status: RecurringSubscriptionStatus;
  currentPeriodEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const recurringSubscriptionSchema = new Schema<IRecurringSubscription>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    plan: { type: String, enum: ['starter', 'plus', 'premium'], required: true },
    paymongoCustomerId: { type: String, required: true },
    paymongoSubscriptionId: { type: String, required: true, unique: true },
    paymongoPaymentMethodId: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'past_due', 'unpaid', 'cancelled'],
      default: 'active',
    },
    currentPeriodEnd: { type: Date, default: null },
  },
  { timestamps: true }
);

export const RecurringSubscription = mongoose.model<IRecurringSubscription>(
  'RecurringSubscription',
  recurringSubscriptionSchema
);

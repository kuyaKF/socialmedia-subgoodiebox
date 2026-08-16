import bcrypt from 'bcryptjs';
import mongoose, { Document, Schema, Types } from 'mongoose';
import { SLUG_MAX, SLUG_MIN, SLUG_PATTERN } from '../utils/slug';

export type UserRole = 'user' | 'internal' | 'admin';
export type SubscriptionPlan = 'free' | 'starter' | 'plus' | 'premium';
export type SubscriptionStatus = 'active' | 'inactive' | 'past_due';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  slug?: string;
  role: UserRole;
  group: Types.ObjectId | null;
  subscription: {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    currentPeriodEnd: Date | null;
    // Set only when this user has an active PayMongo-driven recurring (auto-renew) subscription —
    // absence means they're on the manual one-time-checkout renewal path.
    paymongoCustomerId: string | null;
    paymongoSubscriptionId: string | null;
  };
  emailVerified: boolean;
  emailVerificationTokenHash: string | null;
  emailVerificationExpires: Date | null;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    bio: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      minlength: SLUG_MIN,
      maxlength: SLUG_MAX,
      match: SLUG_PATTERN,
    },
    role: { type: String, enum: ['user', 'internal', 'admin'], default: 'user' },
    group: { type: Schema.Types.ObjectId, ref: 'Group', default: null },
    subscription: {
      plan: { type: String, enum: ['free', 'starter', 'plus', 'premium'], default: 'free' },
      status: { type: String, enum: ['active', 'inactive', 'past_due'], default: 'active' },
      currentPeriodEnd: { type: Date, default: null },
      paymongoCustomerId: { type: String, default: null },
      paymongoSubscriptionId: { type: String, default: null },
    },
    emailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String, default: null, select: false },
    emailVerificationExpires: { type: Date, default: null, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.passwordHash = undefined;
        ret.emailVerificationTokenHash = undefined;
        ret.emailVerificationExpires = undefined;
        ret.__v = undefined;
      },
    },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', userSchema);

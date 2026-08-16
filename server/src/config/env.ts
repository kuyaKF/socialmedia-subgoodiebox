import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT || '4000', 10),
  mongoUri: required('MONGO_URI'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  adminName: process.env.ADMIN_NAME || 'Admin',
  paymongoSecretKey: process.env.PAYMONGO_SECRET_KEY,
  paymongoWebhookSecret: process.env.PAYMONGO_WEBHOOK_SECRET,
  paymongoGoodieBoxWebhookSecret: process.env.PAYMONGO_GOODIE_BOX_WEBHOOK_SECRET,
  // Recurring billing (PayMongo Subscriptions API) — optional. The app must still boot before
  // PayMongo support enables Subscriptions on the account and the Plan resources exist; endpoints
  // that need these fail loudly with a specific error instead (see config/plans.ts).
  paymongoSubscriptionWebhookSecret: process.env.PAYMONGO_SUBSCRIPTION_WEBHOOK_SECRET,
  paymongoPlanIdStarter: process.env.PAYMONGO_PLAN_ID_STARTER,
  paymongoPlanIdPlus: process.env.PAYMONGO_PLAN_ID_PLUS,
  paymongoPlanIdPremium: process.env.PAYMONGO_PLAN_ID_PREMIUM,
  resendApiKey: process.env.RESEND_API_KEY,
  // Resend's shared test sender — works with no domain setup, good for local dev.
  // Swap to a verified sender on your own domain before going live.
  emailFrom: process.env.EMAIL_FROM || 'Haven Circle <onboarding@resend.dev>',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
};

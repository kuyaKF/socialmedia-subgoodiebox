import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import adminGoodieBoxRoutes from './routes/adminGoodieBox.routes';
import adminStatsRoutes from './routes/adminStats.routes';
import announcementsRoutes from './routes/announcements.routes';
import authRoutes from './routes/auth.routes';
import blogPostsRoutes from './routes/blogPosts.routes';
import engagementRoutes from './routes/engagement.routes';
import feedRoutes from './routes/feed.routes';
import goodieBoxRoutes from './routes/goodieBox.routes';
import goodieBoxWebhookRoutes from './routes/goodieBoxWebhook.routes';
import groupPostsRoutes from './routes/groupPosts.routes';
import groupsRoutes from './routes/groups.routes';
import newsletterRoutes from './routes/newsletter.routes';
import paymentsRoutes from './routes/payments.routes';
import paymentsWebhookRoutes from './routes/paymentsWebhook.routes';
import subscriptionRoutes from './routes/subscription.routes';
import usersRoutes from './routes/users.routes';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));

// Mounted before express.json() so this route gets the raw request body, which is required to
// verify the Paymongo-Signature HMAC — JSON-parsing first would change the exact bytes signed.
app.use('/api/payments/webhook', express.raw({ type: '*/*' }), paymentsWebhookRoutes);
app.use('/api/goodie-box/webhook', express.raw({ type: '*/*' }), goodieBoxWebhookRoutes);

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/group-posts', groupPostsRoutes);
app.use('/api/blog-posts', blogPostsRoutes);
app.use('/api/engagement', engagementRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/goodie-box', goodieBoxRoutes);
app.use('/api/admin/goodie-box-orders', adminGoodieBoxRoutes);
app.use('/api/admin/stats', adminStatsRoutes);

app.use(errorHandler);

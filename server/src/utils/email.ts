import { Resend } from 'resend';
import { env } from '../config/env';

let client: Resend | null = null;

function getClient(): Resend | null {
  if (!env.resendApiKey) return null;
  if (!client) client = new Resend(env.resendApiKey);
  return client;
}

export async function sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
  const verifyUrl = `${env.clientUrl}/verify-email?token=${token}`;

  const resend = getClient();
  if (!resend) {
    if (env.nodeEnv === 'production') {
      // Fail loudly rather than silently skip sending — and never log the raw
      // verification link (it doubles as an account-verification credential) outside
      // of local dev.
      throw new Error('RESEND_API_KEY is not configured');
    }
    console.warn('[email] RESEND_API_KEY is not configured — skipping verification email to', to);
    console.log('[email] verification link (dev only):', verifyUrl);
    return;
  }

  await resend.emails.send({
    from: env.emailFrom,
    to,
    subject: 'Confirm your email — Haven Circle',
    html: `
      <p>Hi ${name},</p>
      <p>Thanks for joining Haven Circle. Please confirm your email address to finish setting up your account:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
    `,
  });
}

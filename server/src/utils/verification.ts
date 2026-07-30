import crypto from 'node:crypto';

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateVerificationToken(): {
  token: string;
  tokenHash: string;
  expires: Date;
} {
  const token = crypto.randomBytes(32).toString('hex');
  return {
    token,
    tokenHash: hashToken(token),
    expires: new Date(Date.now() + TOKEN_TTL_MS),
  };
}

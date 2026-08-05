import rateLimit from 'express-rate-limit';

// Applies to login attempts and password changes — the endpoints an attacker would use
// to brute-force a password. Keyed by IP by default.
export const authAttemptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
});

// Looser limit for registration — mainly abuse/spam prevention, not brute force.
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
});

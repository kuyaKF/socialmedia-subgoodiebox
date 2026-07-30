import { CookieOptions, Request, Response } from 'express';
import { env } from '../config/env';
import { HttpError } from '../middleware/errorHandler';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { sendVerificationEmail } from '../utils/email';
import { signAccessToken } from '../utils/jwt';
import { ensureSubscriptionCurrent } from '../utils/subscription';
import { generateVerificationToken, hashToken } from '../utils/verification';

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.nodeEnv === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function publicUser(user: InstanceType<typeof User>) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    role: user.role,
    group: user.group,
    subscription: user.subscription,
    emailVerified: user.emailVerified,
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body as { email?: string; password?: string; name?: string };
  if (!email || !password || !name) {
    throw new HttpError(400, 'email, password, and name are required');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new HttpError(409, 'An account with this email already exists');
  }

  const { token, tokenHash, expires } = generateVerificationToken();
  const user = await User.create({
    email,
    passwordHash: password,
    name,
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpires: expires,
  });

  try {
    await sendVerificationEmail(user.email, user.name, token);
  } catch (err) {
    // Don't block registration on an email provider hiccup — the user can request a resend.
    console.error('[auth] failed to send verification email', err);
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  res.cookie('token', accessToken, cookieOptions);
  res.status(201).json({ user: publicUser(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    throw new HttpError(400, 'email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw new HttpError(401, 'Invalid email or password');
  }
  await user.populate('group', 'name leader members');
  await ensureSubscriptionCurrent(user);

  const token = signAccessToken({ sub: user.id, role: user.role });
  res.cookie('token', token, cookieOptions);
  res.json({ user: publicUser(user) });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  const { maxAge: _maxAge, ...clearOptions } = cookieOptions;
  res.clearCookie('token', clearOptions);
  res.status(204).send();
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id).populate('group', 'name leader members');
  if (!user) {
    throw new HttpError(401, 'Not authenticated');
  }
  await ensureSubscriptionCurrent(user);
  res.json({ user: publicUser(user) });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body as { token?: string };
  if (!token) {
    throw new HttpError(400, 'token is required');
  }

  const user = await User.findOne({
    emailVerificationTokenHash: hashToken(token),
    emailVerificationExpires: { $gt: new Date() },
  });
  if (!user) {
    throw new HttpError(400, 'This verification link is invalid or has expired');
  }

  user.emailVerified = true;
  user.emailVerificationTokenHash = null;
  user.emailVerificationExpires = null;
  await user.save();

  res.json({ user: publicUser(user) });
});

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new HttpError(401, 'Not authenticated');
  }
  if (user.emailVerified) {
    throw new HttpError(400, 'Your email is already verified');
  }

  const { token, tokenHash, expires } = generateVerificationToken();
  user.emailVerificationTokenHash = tokenHash;
  user.emailVerificationExpires = expires;
  await user.save();

  await sendVerificationEmail(user.email, user.name, token);
  res.status(204).send();
});

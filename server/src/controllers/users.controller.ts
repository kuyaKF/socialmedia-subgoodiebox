import { Request, Response } from 'express';
import { HttpError } from '../middleware/errorHandler';
import { SubscriptionPlan, User, UserRole } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { escapeRegExp } from '../utils/escapeRegExp';
import { isValidSlug, normalizeSlug, OBJECT_ID_PATTERN } from '../utils/slug';

const VALID_PLANS: SubscriptionPlan[] = ['free', 'starter', 'plus', 'premium'];
const MAX_PAGE_SIZE = 200;

const SORTABLE_FIELDS: Record<string, string> = {
  name: 'name',
  email: 'email',
  createdAt: 'createdAt',
  role: 'role',
  plan: 'subscription.plan',
};

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { search, plan, group, registeredFrom, registeredTo, sortBy, sortOrder } = req.query as Record<
    string,
    string | undefined
  >;

  const filter: Record<string, unknown> = {};

  if (group === 'unassigned') {
    filter.group = null;
  } else if (typeof group === 'string' && OBJECT_ID_PATTERN.test(group)) {
    filter.group = group;
  }

  if (plan && VALID_PLANS.includes(plan as SubscriptionPlan)) {
    filter['subscription.plan'] = plan;
  }

  if (search && search.trim()) {
    const re = new RegExp(escapeRegExp(search.trim()), 'i');
    filter.$or = [{ name: re }, { email: re }];
  }

  if (registeredFrom || registeredTo) {
    const createdAt: Record<string, Date> = {};
    if (registeredFrom) createdAt.$gte = new Date(registeredFrom);
    if (registeredTo) {
      // Treat the "to" date as inclusive of the whole day.
      const end = new Date(registeredTo);
      end.setHours(23, 59, 59, 999);
      createdAt.$lte = end;
    }
    filter.createdAt = createdAt;
  }

  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.limit as string, 10) || 10));

  const sortField = (sortBy && SORTABLE_FIELDS[sortBy]) || 'createdAt';
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const [users, total] = await Promise.all([
    User.find(filter)
      .collation({ locale: 'en', strength: 2 })
      .sort({ [sortField]: sortDirection })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('group', 'name'),
    User.countDocuments(filter),
  ]);

  res.json({ users, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const raw = req.params.id;
  const user = OBJECT_ID_PATTERN.test(raw)
    ? await User.findById(raw).select('-passwordHash').populate('group', 'name')
    : await User.findOne({ slug: normalizeSlug(raw) })
        .select('-passwordHash')
        .populate('group', 'name');
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  // Email is only visible to the profile owner and admins — other members shouldn't be
  // able to harvest each other's email addresses just by viewing a profile.
  const isSelf = req.user!.id === user.id;
  const canSeeEmail = isSelf || req.user!.role === 'admin';
  const response = user.toObject() as unknown as Record<string, unknown>;
  if (!canSeeEmail) {
    delete response.email;
  }

  res.json({ user: response });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { name, bio, avatarUrl, slug } = req.body as {
    name?: string;
    bio?: string;
    avatarUrl?: string;
    slug?: string;
  };
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }
  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  if (slug !== undefined) {
    const trimmed = slug.trim();
    if (trimmed === '') {
      user.slug = undefined;
    } else {
      const normalized = normalizeSlug(trimmed);
      if (!isValidSlug(normalized)) {
        throw new HttpError(
          400,
          'Profile URL must be 3-30 characters: lowercase letters, numbers, and hyphens only (no leading/trailing/double hyphens).'
        );
      }
      user.slug = normalized;
    }
  }
  await user.save();
  res.json({ user: { ...user.toObject(), passwordHash: undefined } });
});

const VALID_ROLES: UserRole[] = ['user', 'internal', 'admin'];

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.body as { role?: UserRole };
  if (!role || !VALID_ROLES.includes(role)) {
    throw new HttpError(400, `role must be one of: ${VALID_ROLES.join(', ')}`);
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }
  user.role = role;
  await user.save();
  res.json({ user: { ...user.toObject(), passwordHash: undefined } });
});

const VALID_STAFF_ROLES: UserRole[] = ['internal', 'admin'];
const MIN_PASSWORD_LENGTH = 8;

export const createStaffUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
  };

  if (!name || !email || !password) {
    throw new HttpError(400, 'name, email, and password are required');
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new HttpError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  if (role && !VALID_STAFF_ROLES.includes(role)) {
    throw new HttpError(400, `role must be one of: ${VALID_STAFF_ROLES.join(', ')}`);
  }

  const user = await User.create({
    name,
    email,
    passwordHash: password,
    role: role ?? 'internal',
  });
  res.status(201).json({ user: { ...user.toObject(), passwordHash: undefined } });
});

export const changeMyPassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword) {
    throw new HttpError(400, 'currentPassword and newPassword are required');
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new HttpError(400, `New password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  const user = await User.findById(req.user!.id).select('+passwordHash');
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new HttpError(401, 'Current password is incorrect');
  }

  user.passwordHash = newPassword;
  await user.save();
  res.status(204).send();
});

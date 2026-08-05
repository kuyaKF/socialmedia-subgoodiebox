import { Request, Response } from 'express';
import { HttpError } from '../middleware/errorHandler';
import { Group } from '../models/Group';
import { IUser, User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { escapeRegExp } from '../utils/escapeRegExp';

// Admin-only views (list/get/create/update/leader/member management) — includes email.
const POPULATE_FIELDS = [
  { path: 'leader', select: 'name email role avatarUrl' },
  { path: 'members', select: 'name email role avatarUrl' },
];

// Member-facing view (a member looking at their own circle's roster) — no email, so
// fellow members can't harvest each other's email addresses just by viewing the roster.
const MEMBER_POPULATE_FIELDS = [
  { path: 'leader', select: 'name role avatarUrl' },
  { path: 'members', select: 'name role avatarUrl' },
];

const MAX_PAGE_SIZE = 200;

// Only staff (internal team or admin) can lead a group — regular subscribers never can.
function isLeaderEligible(user: IUser): boolean {
  return user.role === 'internal' || user.role === 'admin';
}

// After a group's leader changes, the previous leader is no longer implicitly part of the
// group — clear their `.group` unless they were separately added as a plain member too.
async function releasePreviousLeader(userId: string, groupId: string) {
  const group = await Group.findById(groupId);
  if (!group) return;
  const stillMember = group.members.some((m) => String(m) === userId);
  if (!stillMember) {
    await User.updateOne({ _id: userId, group: groupId }, { group: null });
  }
}

export const listGroups = asyncHandler(async (req: Request, res: Response) => {
  const { search } = req.query as Record<string, string | undefined>;

  const filter: Record<string, unknown> = {};
  if (search && search.trim()) {
    filter.name = new RegExp(escapeRegExp(search.trim()), 'i');
  }

  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.limit as string, 10) || 6));

  const [groups, total] = await Promise.all([
    Group.find(filter)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(POPULATE_FIELDS),
    Group.countDocuments(filter),
  ]);

  res.json({ groups, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
});

export const getGroup = asyncHandler(async (req: Request, res: Response) => {
  const group = await Group.findById(req.params.id).populate(POPULATE_FIELDS);
  if (!group) {
    throw new HttpError(404, 'Group not found');
  }
  res.json({ group });
});

export const getMyGroup = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = await User.findById(req.user!.id);
  if (!currentUser?.group) {
    throw new HttpError(404, 'You are not assigned to a group yet');
  }
  const group = await Group.findById(currentUser.group).populate(MEMBER_POPULATE_FIELDS);
  if (!group) {
    throw new HttpError(404, 'Group not found');
  }
  res.json({ group });
});

export const createGroup = asyncHandler(async (req: Request, res: Response) => {
  const { name, leaderId } = req.body as { name?: string; leaderId?: string };
  if (!name) {
    throw new HttpError(400, 'name is required');
  }

  let leader = null;
  if (leaderId) {
    leader = await User.findById(leaderId);
    if (!leader) {
      throw new HttpError(404, 'Leader user not found');
    }
    if (!isLeaderEligible(leader)) {
      throw new HttpError(400, 'Leader must be an internal team member or admin');
    }
  }

  const group = await Group.create({ name, leader: leader?.id ?? null, members: [] });

  if (leader) {
    if (leader.group && String(leader.group) !== String(group.id)) {
      await Group.findByIdAndUpdate(leader.group, { $pull: { members: leader.id } });
    }
    leader.group = group.id;
    await leader.save();
  }

  const populated = await group.populate(POPULATE_FIELDS);
  res.status(201).json({ group: populated });
});

export const updateGroup = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body as { name?: string };
  const group = await Group.findById(req.params.id);
  if (!group) {
    throw new HttpError(404, 'Group not found');
  }
  if (name !== undefined) group.name = name;
  await group.save();
  const populated = await group.populate(POPULATE_FIELDS);
  res.json({ group: populated });
});

export const deleteGroup = asyncHandler(async (req: Request, res: Response) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    throw new HttpError(404, 'Group not found');
  }
  await User.updateMany({ group: group.id }, { group: null });
  await group.deleteOne();
  res.status(204).send();
});

export const setLeader = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body as { userId?: string };
  const group = await Group.findById(req.params.id);
  if (!group) {
    throw new HttpError(404, 'Group not found');
  }

  const previousLeaderId = group.leader ? String(group.leader) : null;

  if (!userId) {
    group.leader = null;
    await group.save();
    if (previousLeaderId) {
      await releasePreviousLeader(previousLeaderId, group.id);
    }
    res.json({ group: await group.populate(POPULATE_FIELDS) });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }
  if (!isLeaderEligible(user)) {
    throw new HttpError(400, 'Leader must be an internal team member or admin');
  }

  group.leader = user.id;
  await group.save();

  // A leader belongs to the group they lead, so their own dashboard reflects it too.
  if (user.group && String(user.group) !== String(group.id)) {
    await Group.findByIdAndUpdate(user.group, { $pull: { members: user.id } });
  }
  if (String(user.group) !== String(group.id)) {
    user.group = group.id;
    await user.save();
  }

  if (previousLeaderId && previousLeaderId !== String(user.id)) {
    await releasePreviousLeader(previousLeaderId, group.id);
  }

  res.json({ group: await group.populate(POPULATE_FIELDS) });
});

export const addMember = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body as { userId?: string };
  if (!userId) {
    throw new HttpError(400, 'userId is required');
  }

  const group = await Group.findById(req.params.id);
  if (!group) {
    throw new HttpError(404, 'Group not found');
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  if (user.group && String(user.group) !== String(group.id)) {
    await Group.findByIdAndUpdate(user.group, { $pull: { members: user.id } });
  }

  if (!group.members.some((m) => String(m) === String(user.id))) {
    group.members.push(user.id);
    await group.save();
  }
  user.group = group.id;
  await user.save();

  res.json({ group: await group.populate(POPULATE_FIELDS) });
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    throw new HttpError(404, 'Group not found');
  }
  const user = await User.findById(req.params.userId);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  group.members = group.members.filter((m) => String(m) !== String(user.id));
  await group.save();

  if (String(user.group) === String(group.id)) {
    user.group = null;
    await user.save();
  }

  res.json({ group: await group.populate(POPULATE_FIELDS) });
});

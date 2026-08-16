import { Request, Response } from 'express';
import { HttpError } from '../middleware/errorHandler';
import { Group } from '../models/Group';
import { GroupPost } from '../models/GroupPost';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { attachEngagement } from '../utils/engagement';

const MAX_PAGE_SIZE = 50;

function isGroupMember(group: InstanceType<typeof Group>, userId: string): boolean {
  const isLeader = !!group.leader && String(group.leader) === userId;
  const isMember = group.members.some((m) => String(m) === userId);
  return isLeader || isMember;
}

export const createGroupPost = asyncHandler(async (req: Request, res: Response) => {
  const { groupId, body, visibility } = req.body as {
    groupId?: string;
    body?: string;
    visibility?: string;
  };
  if (!groupId || !body || !body.trim()) {
    throw new HttpError(400, 'groupId and body are required');
  }
  const group = await Group.findById(groupId);
  if (!group) {
    throw new HttpError(404, 'Group not found');
  }
  const isAdmin = req.user!.role === 'admin';
  if (!isAdmin && !isGroupMember(group, req.user!.id)) {
    throw new HttpError(403, "Only this group's members can post to it");
  }

  // The group's leader and admins (who can oversee any circle) can opt a post to be public
  // (visible feed-wide); everyone else's posts stay private to the circle regardless of what's sent.
  const isLeader = !!group.leader && String(group.leader) === req.user!.id;
  const resolvedVisibility = (isLeader || isAdmin) && visibility === 'public' ? 'public' : 'private';

  const post = await GroupPost.create({
    group: group.id,
    author: req.user!.id,
    body: body.trim(),
    visibility: resolvedVisibility,
  });
  const populated = await post.populate([
    { path: 'author', select: 'name role' },
    { path: 'group', select: 'name' },
  ]);
  res.status(201).json({ post: populated });
});

export const getMyGroupFeed = asyncHandler(async (req: Request, res: Response) => {
  const before = req.query.before ? new Date(req.query.before as string) : null;
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.limit as string, 10) || 10));

  const currentUser = await User.findById(req.user!.id);
  if (!currentUser?.group) {
    res.json({ items: [], nextCursor: null });
    return;
  }

  const filter: Record<string, unknown> = { group: currentUser.group };
  if (before) filter.createdAt = { $lt: before };

  const posts = await GroupPost.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('author', 'name role avatarUrl')
    .populate('group', 'name');

  const page = posts.map((p) => ({
    _id: p._id,
    type: 'group_post' as const,
    body: p.body,
    author: p.author,
    group: p.group,
    visibility: p.visibility,
    createdAt: p.createdAt,
  }));

  const items = await attachEngagement(page, req.user!.id);
  const nextCursor = items.length === limit ? items[items.length - 1].createdAt : null;

  res.json({ items, nextCursor });
});

// Admin-only: view any group's feed regardless of membership, for oversight/moderation.
export const getGroupFeed = asyncHandler(async (req: Request, res: Response) => {
  const before = req.query.before ? new Date(req.query.before as string) : null;
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.limit as string, 10) || 10));

  const filter: Record<string, unknown> = { group: req.params.groupId };
  if (before) filter.createdAt = { $lt: before };

  const posts = await GroupPost.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('author', 'name role avatarUrl')
    .populate('group', 'name');

  const page = posts.map((p) => ({
    _id: p._id,
    type: 'group_post' as const,
    body: p.body,
    author: p.author,
    group: p.group,
    visibility: p.visibility,
    createdAt: p.createdAt,
  }));

  const items = await attachEngagement(page, req.user!.id);
  const nextCursor = items.length === limit ? items[items.length - 1].createdAt : null;

  res.json({ items, nextCursor });
});

export const updateGroupPost = asyncHandler(async (req: Request, res: Response) => {
  const { body } = req.body as { body?: string };
  if (!body || !body.trim()) {
    throw new HttpError(400, 'body is required');
  }
  const post = await GroupPost.findById(req.params.id);
  if (!post) {
    throw new HttpError(404, 'Post not found');
  }
  const isAuthor = String(post.author) === req.user!.id;
  const isAdmin = req.user!.role === 'admin';
  if (!isAuthor && !isAdmin) {
    throw new HttpError(403, 'Not allowed to edit this post');
  }
  post.body = body.trim();
  await post.save();
  const populated = await post.populate([
    { path: 'author', select: 'name role' },
    { path: 'group', select: 'name' },
  ]);
  res.json({ post: populated });
});

export const deleteGroupPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await GroupPost.findById(req.params.id);
  if (!post) {
    throw new HttpError(404, 'Post not found');
  }
  const isAuthor = String(post.author) === req.user!.id;
  const isAdmin = req.user!.role === 'admin';
  if (!isAuthor && !isAdmin) {
    throw new HttpError(403, 'Not allowed to delete this post');
  }
  await post.deleteOne();
  res.status(204).send();
});

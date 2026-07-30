import { Request, Response } from 'express';
import { HttpError } from '../middleware/errorHandler';
import { Comment } from '../models/Comment';
import { GroupPost } from '../models/GroupPost';
import { FEED_TARGET_TYPES, FeedTargetType, Like } from '../models/Like';
import { UserRole, User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';

function assertValidTarget(
  targetType: unknown,
  targetId: unknown
): asserts targetType is FeedTargetType {
  if (typeof targetType !== 'string' || !FEED_TARGET_TYPES.includes(targetType as FeedTargetType)) {
    throw new HttpError(400, 'Invalid targetType');
  }
  if (typeof targetId !== 'string' || !targetId) {
    throw new HttpError(400, 'targetId is required');
  }
}

// Free subscribers can read everything but only paid subscribers (and staff) can like/comment —
// a nudge toward upgrading. Two exceptions: blog posts are open to everyone (the intended
// on-ramp for free users), and a group's own members can always interact with their own
// circle's posts, regardless of plan or whether the leader made that post public.
async function assertCanEngage(
  userId: string,
  userRole: UserRole,
  targetType: FeedTargetType,
  targetId: string
): Promise<void> {
  if (targetType === 'blog_post') return;

  if (targetType === 'group_post') {
    const post = await GroupPost.findById(targetId).select('group visibility');
    if (!post) {
      throw new HttpError(404, 'Post not found');
    }

    const currentUser = await User.findById(userId).select('group subscription.plan');
    const isMember = !!currentUser?.group && String(currentUser.group) === String(post.group);
    if (isMember) return;

    if (post.visibility !== 'public') {
      throw new HttpError(403, "Only this circle's members can interact with this post");
    }
    if (userRole === 'user' && currentUser?.subscription.plan === 'free') {
      throw new HttpError(403, 'Upgrade to a paid plan to like or comment');
    }
    return;
  }

  if (userRole === 'user') {
    const currentUser = await User.findById(userId).select('subscription.plan');
    if (currentUser?.subscription.plan === 'free') {
      throw new HttpError(403, 'Upgrade to a paid plan to like or comment');
    }
  }
}

export const toggleLike = asyncHandler(async (req: Request, res: Response) => {
  const { targetType, targetId } = req.body as { targetType?: string; targetId?: string };
  assertValidTarget(targetType, targetId);
  await assertCanEngage(req.user!.id, req.user!.role, targetType, targetId as string);

  const existing = await Like.findOne({ targetType, targetId, user: req.user!.id });
  if (existing) {
    await existing.deleteOne();
    const count = await Like.countDocuments({ targetType, targetId });
    res.json({ liked: false, likeCount: count });
    return;
  }

  await Like.create({ targetType, targetId, user: req.user!.id });
  const count = await Like.countDocuments({ targetType, targetId });
  res.json({ liked: true, likeCount: count });
});

export const listComments = asyncHandler(async (req: Request, res: Response) => {
  const { targetType, targetId } = req.query as { targetType?: string; targetId?: string };
  assertValidTarget(targetType, targetId);
  const comments = await Comment.find({ targetType, targetId })
    .sort({ createdAt: 1 })
    .populate('author', 'name role');
  res.json({ comments });
});

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const { targetType, targetId, body } = req.body as {
    targetType?: string;
    targetId?: string;
    body?: string;
  };
  assertValidTarget(targetType, targetId);
  await assertCanEngage(req.user!.id, req.user!.role, targetType, targetId as string);
  if (!body || !body.trim()) {
    throw new HttpError(400, 'body is required');
  }
  const comment = await Comment.create({ targetType, targetId, author: req.user!.id, body: body.trim() });
  const populated = await comment.populate('author', 'name role');
  res.status(201).json({ comment: populated });
});

import { Request, Response } from 'express';
import { Announcement } from '../models/Announcement';
import { BlogPost } from '../models/BlogPost';
import { GroupPost } from '../models/GroupPost';
import { FeedTargetType } from '../models/Like';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { attachEngagement } from '../utils/engagement';

const AUTHOR_FIELDS = 'name role';
const MAX_PAGE_SIZE = 50;

interface FeedItem {
  _id: unknown;
  type: FeedTargetType;
  body: string;
  title?: string;
  author: unknown;
  group?: unknown;
  visibility?: string;
  createdAt: Date;
}

export const getFeed = asyncHandler(async (req: Request, res: Response) => {
  const before = req.query.before ? new Date(req.query.before as string) : null;
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.limit as string, 10) || 10));

  const currentUser = await User.findById(req.user!.id);
  const groupId = currentUser?.group ?? null;

  const dateFilter: Record<string, unknown> = {};
  if (before) dateFilter.createdAt = { $lt: before };

  // A user's own group's posts show regardless of visibility; every other group's posts only
  // show here if the group's leader opted them into the general feed.
  const groupPostFilter = {
    ...dateFilter,
    $or: groupId ? [{ group: groupId }, { visibility: 'public' }] : [{ visibility: 'public' }],
  };

  const [announcements, blogPosts, groupPosts] = await Promise.all([
    Announcement.find(dateFilter).sort({ createdAt: -1 }).limit(limit).populate('author', AUTHOR_FIELDS),
    BlogPost.find(dateFilter).sort({ createdAt: -1 }).limit(limit).populate('author', AUTHOR_FIELDS),
    GroupPost.find(groupPostFilter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('author', AUTHOR_FIELDS)
      .populate('group', 'name'),
  ]);

  const merged: FeedItem[] = [
    ...announcements.map((a) => ({
      _id: a._id,
      type: 'announcement' as const,
      body: a.body,
      author: a.author,
      createdAt: a.createdAt,
    })),
    ...blogPosts.map((b) => ({
      _id: b._id,
      type: 'blog_post' as const,
      body: b.body,
      title: b.title,
      author: b.author,
      createdAt: b.createdAt,
    })),
    ...groupPosts.map((g) => ({
      _id: g._id,
      type: 'group_post' as const,
      body: g.body,
      author: g.author,
      group: g.group,
      visibility: g.visibility,
      createdAt: g.createdAt,
    })),
  ];

  merged.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const page = merged.slice(0, limit);

  const items = await attachEngagement(page, req.user!.id);

  const nextCursor = items.length === limit ? items[items.length - 1].createdAt : null;

  res.json({ items, nextCursor });
});

import { Request, Response } from 'express';
import { HttpError } from '../middleware/errorHandler';
import { BlogPost } from '../models/BlogPost';
import { asyncHandler } from '../utils/asyncHandler';
import { attachEngagement } from '../utils/engagement';

const MAX_PAGE_SIZE = 50;

export const listBlogPosts = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.limit as string, 10) || 10));

  const [posts, total] = await Promise.all([
    BlogPost.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name role'),
    BlogPost.countDocuments(),
  ]);

  res.json({ posts, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
});

export const getBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await BlogPost.findById(req.params.id).populate('author', 'name role');
  if (!post) {
    throw new HttpError(404, 'Blog post not found');
  }

  const [engagement] = await attachEngagement(
    [{ _id: post._id, type: 'blog_post' as const }],
    req.user?.id ?? ''
  );

  res.json({
    post: {
      ...post.toObject(),
      likeCount: engagement.likeCount,
      commentCount: engagement.commentCount,
      likedByMe: engagement.likedByMe,
    },
  });
});

export const createBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const { title, body } = req.body as { title?: string; body?: string };
  if (!title || !title.trim() || !body || !body.trim()) {
    throw new HttpError(400, 'title and body are required');
  }
  const post = await BlogPost.create({ author: req.user!.id, title: title.trim(), body: body.trim() });
  const populated = await post.populate('author', 'name role');
  res.status(201).json({ post: populated });
});

export const deleteBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) {
    throw new HttpError(404, 'Blog post not found');
  }
  await post.deleteOne();
  res.status(204).send();
});

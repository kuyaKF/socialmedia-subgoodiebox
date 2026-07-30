import { Request, Response } from 'express';
import { HttpError } from '../middleware/errorHandler';
import { Announcement } from '../models/Announcement';
import { asyncHandler } from '../utils/asyncHandler';

export const createAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const { body } = req.body as { body?: string };
  if (!body || !body.trim()) {
    throw new HttpError(400, 'body is required');
  }
  const announcement = await Announcement.create({ author: req.user!.id, body: body.trim() });
  const populated = await announcement.populate('author', 'name role');
  res.status(201).json({ announcement: populated });
});

export const deleteAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) {
    throw new HttpError(404, 'Announcement not found');
  }
  await announcement.deleteOne();
  res.status(204).send();
});

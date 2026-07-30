import { Request, Response } from 'express';
import { cloudinary } from '../config/cloudinary';
import { HttpError } from '../middleware/errorHandler';
import { asyncHandler } from '../utils/asyncHandler';

export const uploadBlogImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new HttpError(400, 'No image file provided');

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'blog-posts', resource_type: 'image' },
      (err, uploaded) => (err || !uploaded ? reject(err ?? new Error('Upload failed')) : resolve(uploaded))
    );
    stream.end(req.file!.buffer);
  });

  res.status(201).json({ url: result.secure_url });
});

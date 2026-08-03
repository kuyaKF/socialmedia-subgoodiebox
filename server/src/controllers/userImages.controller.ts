import { Request, Response } from 'express';
import { cloudinary } from '../config/cloudinary';
import { HttpError } from '../middleware/errorHandler';
import { asyncHandler } from '../utils/asyncHandler';

function uploadToCloudinary(buffer: Buffer, folder: string): Promise<{ secure_url: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, uploaded) => (err || !uploaded ? reject(err ?? new Error('Upload failed')) : resolve(uploaded))
    );
    stream.end(buffer);
  });
}

export const uploadAvatarImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new HttpError(400, 'No image file provided');
  const result = await uploadToCloudinary(req.file.buffer, 'avatars');
  res.status(201).json({ url: result.secure_url });
});

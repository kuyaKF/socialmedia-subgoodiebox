import multer from 'multer';
import { HttpError } from './errorHandler';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new HttpError(400, 'Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});

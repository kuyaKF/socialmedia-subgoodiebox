import { HttpError } from '../middleware/errorHandler';
import { IBlogBlock } from '../models/BlogPost';

export function validateAndSanitizeBlocks(input: unknown): IBlogBlock[] {
  if (!Array.isArray(input) || input.length === 0) {
    throw new HttpError(400, 'blocks must be a non-empty array');
  }

  return input.map((raw, i) => {
    const b = raw as Record<string, unknown>;

    if (b.type === 'heading' || b.type === 'paragraph') {
      const text = typeof b.text === 'string' ? b.text.trim() : '';
      if (!text) throw new HttpError(400, `block ${i}: text is required`);
      return { type: b.type, text };
    }

    if (b.type === 'image') {
      const url = typeof b.url === 'string' ? b.url.trim() : '';
      if (!url) throw new HttpError(400, `block ${i}: url is required`);
      const caption = typeof b.caption === 'string' ? b.caption.trim() : undefined;
      return { type: 'image' as const, url, ...(caption ? { caption } : {}) };
    }

    throw new HttpError(400, `block ${i}: invalid type`);
  });
}

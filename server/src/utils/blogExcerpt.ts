import { IBlogBlock } from '../models/BlogPost';

export function buildBlogExcerpt(blocks: IBlogBlock[], length = 200): string {
  const text = blocks
    .filter((b) => b.type === 'heading' || b.type === 'paragraph')
    .map((b) => b.text ?? '')
    .join(' ')
    .trim();
  return text.length > length ? text.slice(0, length).trimEnd() + '…' : text;
}

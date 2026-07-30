import type { BlogBlock } from './models'

export type EditorBlock =
  | { id: string; type: 'heading'; text: string }
  | { id: string; type: 'paragraph'; text: string }
  | { id: string; type: 'image'; url: string; caption: string; uploading?: boolean }

export function createEditorBlock(type: EditorBlock['type']): EditorBlock {
  const id = crypto.randomUUID()
  if (type === 'image') return { id, type, url: '', caption: '' }
  return { id, type, text: '' }
}

export function toBlogBlock(b: EditorBlock): BlogBlock {
  if (b.type === 'image') {
    return { type: 'image', url: b.url, ...(b.caption.trim() ? { caption: b.caption.trim() } : {}) }
  }
  return { type: b.type, text: b.text.trim() }
}

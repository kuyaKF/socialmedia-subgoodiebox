import type { EditorBlock } from '../../types/blogEditor'

export function ParagraphBlockEditor({
  block,
  onChange,
}: {
  block: Extract<EditorBlock, { type: 'paragraph' }>
  onChange: (block: EditorBlock) => void
}) {
  return (
    <textarea
      value={block.text}
      onChange={(e) => onChange({ ...block, text: e.target.value })}
      placeholder="Write a paragraph..."
      rows={3}
      className="w-full resize-none rounded border border-transparent px-2 py-1.5 text-sm text-slate-700 focus:border-slate-300 focus:outline-none"
    />
  )
}

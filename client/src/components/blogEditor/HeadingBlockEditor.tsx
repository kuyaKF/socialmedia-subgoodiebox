import type { EditorBlock } from '../../types/blogEditor'

export function HeadingBlockEditor({
  block,
  onChange,
}: {
  block: Extract<EditorBlock, { type: 'heading' }>
  onChange: (block: EditorBlock) => void
}) {
  return (
    <input
      value={block.text}
      onChange={(e) => onChange({ ...block, text: e.target.value })}
      placeholder="Heading"
      className="w-full rounded border border-transparent px-2 py-1.5 text-lg font-semibold text-slate-900 focus:border-slate-300 focus:outline-none"
    />
  )
}

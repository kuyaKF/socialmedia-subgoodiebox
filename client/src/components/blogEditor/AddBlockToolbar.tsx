import type { EditorBlock } from '../../types/blogEditor'

export function AddBlockToolbar({ onAdd }: { onAdd: (type: EditorBlock['type']) => void }) {
  return (
    <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
      <button
        type="button"
        onClick={() => onAdd('heading')}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
      >
        + Heading
      </button>
      <button
        type="button"
        onClick={() => onAdd('paragraph')}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
      >
        + Paragraph
      </button>
      <button
        type="button"
        onClick={() => onAdd('image')}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
      >
        + Image
      </button>
    </div>
  )
}

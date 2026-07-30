import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { EditorBlock } from '../../types/blogEditor'
import { GripIcon, TrashIcon } from '../icons'
import { HeadingBlockEditor } from './HeadingBlockEditor'
import { ImageBlockEditor } from './ImageBlockEditor'
import { ParagraphBlockEditor } from './ParagraphBlockEditor'

export function SortableBlockItem({
  block,
  onChange,
  onRemove,
}: {
  block: EditorBlock
  onChange: (block: EditorBlock) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3"
    >
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="mt-1 shrink-0 cursor-grab touch-none text-slate-300 hover:text-slate-500 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripIcon className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        {block.type === 'heading' && <HeadingBlockEditor block={block} onChange={onChange} />}
        {block.type === 'paragraph' && <ParagraphBlockEditor block={block} onChange={onChange} />}
        {block.type === 'image' && <ImageBlockEditor block={block} onChange={onChange} />}
      </div>

      <button
        type="button"
        onClick={onRemove}
        title="Remove block"
        className="mt-1 shrink-0 rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-600"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

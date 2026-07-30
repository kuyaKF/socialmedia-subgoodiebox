import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { createEditorBlock, type EditorBlock } from '../../types/blogEditor'
import { AddBlockToolbar } from './AddBlockToolbar'
import { SortableBlockItem } from './SortableBlockItem'

export function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: EditorBlock[]
  onChange: (blocks: EditorBlock[]) => void
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = blocks.findIndex((b) => b.id === active.id)
    const newIndex = blocks.findIndex((b) => b.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    onChange(arrayMove(blocks, oldIndex, newIndex))
  }

  function addBlock(type: EditorBlock['type']) {
    onChange([...blocks, createEditorBlock(type)])
  }

  function updateBlock(id: string, updated: EditorBlock) {
    onChange(blocks.map((b) => (b.id === id ? updated : b)))
  }

  function removeBlock(id: string) {
    onChange(blocks.filter((b) => b.id !== id))
  }

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <SortableBlockItem
              key={block.id}
              block={block}
              onChange={(updated) => updateBlock(block.id, updated)}
              onRemove={() => removeBlock(block.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
      <AddBlockToolbar onAdd={addBlock} />
    </div>
  )
}

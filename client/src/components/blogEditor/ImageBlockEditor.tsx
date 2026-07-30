import { useRef, useState, type ChangeEvent } from 'react'
import { uploadBlogImageRequest } from '../../api/blogPosts.api'
import type { EditorBlock } from '../../types/blogEditor'

export function ImageBlockEditor({
  block,
  onChange,
}: {
  block: Extract<EditorBlock, { type: 'image' }>
  onChange: (block: EditorBlock) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    onChange({ ...block, uploading: true })
    try {
      const url = await uploadBlogImageRequest(file)
      onChange({ ...block, url, uploading: false })
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not upload image'
      setError(message)
      onChange({ ...block, uploading: false })
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      {block.url ? (
        <div>
          <img src={block.url} alt="" className="max-h-64 rounded-lg object-cover" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 text-xs font-medium text-slate-600 hover:underline"
          >
            Replace image
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={block.uploading}
          className="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-slate-300 py-8 text-sm text-slate-500 hover:border-slate-400 hover:text-slate-700 disabled:opacity-50"
        >
          {block.uploading ? 'Uploading...' : '+ Choose an image'}
        </button>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {block.url && (
        <input
          value={block.caption}
          onChange={(e) => onChange({ ...block, caption: e.target.value })}
          placeholder="Caption (optional)"
          className="mt-2 w-full rounded border border-slate-200 px-2 py-1.5 text-sm focus:border-slate-400 focus:outline-none"
        />
      )}
    </div>
  )
}

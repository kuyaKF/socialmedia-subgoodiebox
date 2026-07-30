import { useRef, useState, type ChangeEvent } from 'react'
import { uploadBlogImageRequest } from '../../api/blogPosts.api'

export function ThumbnailUploader({
  url,
  uploading,
  onChange,
}: {
  url: string
  uploading: boolean
  onChange: (state: { url: string; uploading: boolean }) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    onChange({ url, uploading: true })
    try {
      const uploadedUrl = await uploadBlogImageRequest(file)
      onChange({ url: uploadedUrl, uploading: false })
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not upload thumbnail'
      setError(message)
      onChange({ url, uploading: false })
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm text-slate-600">Thumbnail (optional)</label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      {url ? (
        <div>
          <img src={url} alt="" className="h-40 w-full rounded-lg object-cover" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 text-xs font-medium text-slate-600 hover:underline"
          >
            Replace thumbnail
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-sm text-slate-500 hover:border-slate-400 hover:text-slate-700 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : '+ Add a thumbnail'}
        </button>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

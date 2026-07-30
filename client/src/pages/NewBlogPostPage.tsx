import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBlogPostRequest } from '../api/blogPosts.api'
import { BlockEditor } from '../components/blogEditor/BlockEditor'
import type { EditorBlock } from '../types/blogEditor'
import { toBlogBlock } from '../types/blogEditor'

function validate(title: string, blocks: EditorBlock[]): string | null {
  if (!title.trim()) return 'Give your post a title.'
  if (blocks.length === 0) return 'Add at least one block.'
  for (const block of blocks) {
    if (block.type === 'heading' || block.type === 'paragraph') {
      if (!block.text.trim()) return 'Every heading and paragraph needs some text.'
    } else if (block.type === 'image') {
      if (block.uploading) return 'Wait for the image upload to finish.'
      if (!block.url) return 'Every image block needs an uploaded image.'
    }
  }
  return null
}

export function NewBlogPostPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [blocks, setBlocks] = useState<EditorBlock[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePublish() {
    const validationError = validate(title, blocks)
    if (validationError) {
      setError(validationError)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const post = await createBlogPostRequest(title.trim(), blocks.map(toBlogBlock))
      navigate(`/blog/${post._id}`)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not publish post'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">New blog post</h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
        className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-2xl font-bold text-slate-900 focus:border-slate-400 focus:outline-none"
      />

      <BlockEditor blocks={blocks} onChange={setBlocks} />

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => navigate('/feed')}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handlePublish}
          disabled={submitting}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {submitting ? 'Publishing...' : 'Publish'}
        </button>
      </div>
    </div>
  )
}

import { useState, type FormEvent } from 'react'
import type { GroupPostVisibility } from '../../types/models'

export function Composer({
  placeholder,
  submitLabel,
  onSubmit,
  showVisibilityToggle = false,
}: {
  placeholder: string
  submitLabel: string
  onSubmit: (body: string, visibility?: GroupPostVisibility) => Promise<void>
  showVisibilityToggle?: boolean
}) {
  const [body, setBody] = useState('')
  const [visibility, setVisibility] = useState<GroupPostVisibility>('private')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(body.trim(), showVisibilityToggle ? visibility : undefined)
      setBody('')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not post'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full resize-none rounded border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      <div className="mt-2 flex items-center justify-between gap-3">
        {showVisibilityToggle ? (
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={visibility === 'private'}
                onChange={() => setVisibility('private')}
              />
              Private (circle only)
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
              />
              Public (everyone can see)
            </label>
          </div>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={submitting || !body.trim()}
          className="shrink-0 rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {submitting ? 'Posting...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

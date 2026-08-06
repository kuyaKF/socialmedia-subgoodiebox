import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs ring-1 ring-foreground/10"
    >
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="resize-none"
      />
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
      <div className="mt-2 flex items-center justify-between gap-3">
        {showVisibilityToggle ? (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
        <Button type="submit" size="sm" disabled={submitting || !body.trim()} className="shrink-0">
          {submitting ? 'Posting...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

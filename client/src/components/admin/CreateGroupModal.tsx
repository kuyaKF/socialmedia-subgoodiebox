import { useState, type FormEvent } from 'react'
import { SearchableSelect } from '../SearchableSelect'
import type { User } from '../../types/models'

export function CreateGroupModal({
  leaderCandidates,
  onClose,
  onCreate,
}: {
  leaderCandidates: User[]
  onClose: () => void
  onCreate: (input: { name: string; leaderId?: string }) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [leaderId, setLeaderId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onCreate({ name, leaderId: leaderId || undefined })
      onClose()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not create group'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Create group</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-slate-600">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Leader (optional)</label>
            <SearchableSelect
              value={leaderId}
              onChange={setLeaderId}
              placeholder="No leader yet"
              options={leaderCandidates.map((u) => ({ value: u.id, label: u.name, sublabel: u.email }))}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-slate-300 px-3 py-1.5 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-slate-900 px-3 py-1.5 text-white disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

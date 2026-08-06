import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { User } from '../../types/models'
import { SearchableSelect } from '../SearchableSelect'

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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Create group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Name</label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Leader (optional)</label>
            <SearchableSelect
              value={leaderId}
              onChange={setLeaderId}
              placeholder="No leader yet"
              options={leaderCandidates.map((u) => ({ value: u.id, label: u.name, sublabel: u.email }))}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

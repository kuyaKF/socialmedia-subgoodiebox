import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { createStaffUserRequest } from '../../api/users.api'

const PASSWORD_CHARSET =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*'

function generatePassword(length = 14): string {
  const bytes = new Uint32Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (n) => PASSWORD_CHARSET[n % PASSWORD_CHARSET.length]).join('')
}

export function RegisterStaffModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'internal' | 'admin'>('internal')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await createStaffUserRequest({ name, email, password, role })
      setCreated({ email, password })
      onCreated()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not create staff account'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  async function copyPassword() {
    if (created) await navigator.clipboard.writeText(created.password)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-sm"
        showCloseButton={!created}
        onEscapeKeyDown={(e) => {
          if (created) e.preventDefault()
        }}
        onInteractOutside={(e) => {
          if (created) e.preventDefault()
        }}
      >
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle>Staff account created</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Share these credentials with them now — the password won't be shown again.
            </p>
            <div className="space-y-2 rounded-md border bg-muted/50 p-3 text-sm">
              <p>
                <span className="text-muted-foreground">Email:</span> {created.email}
              </p>
              <p className="flex items-center gap-2">
                <span className="text-muted-foreground">Password:</span>
                <code className="font-mono">{created.password}</code>
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={copyPassword}>
                Copy password
              </Button>
              <Button type="button" onClick={onClose}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Register staff account</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Name</label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Email</label>
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'internal' | 'admin')}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="internal">Internal Team</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Password</label>
                <div className="flex gap-2">
                  <Input
                    required
                    minLength={8}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPassword(generatePassword())
                    setShowPassword(true)
                  }}
                  className="mt-1.5 text-xs text-muted-foreground underline"
                >
                  Generate a password
                </button>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create account'}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

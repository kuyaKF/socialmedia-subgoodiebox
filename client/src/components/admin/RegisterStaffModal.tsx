import { useState, type FormEvent } from 'react'
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
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-5">
        {created ? (
          <>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Staff account created</h2>
            <p className="mb-3 text-sm text-slate-600">
              Share these credentials with them now — the password won't be shown again.
            </p>
            <div className="mb-4 space-y-2 rounded border border-slate-200 bg-slate-50 p-3 text-sm">
              <p>
                <span className="text-slate-500">Email:</span> {created.email}
              </p>
              <p className="flex items-center gap-2">
                <span className="text-slate-500">Password:</span>
                <code className="font-mono">{created.password}</code>
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={copyPassword}
                className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
              >
                Copy password
              </button>
              <button
                onClick={onClose}
                className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white"
              >
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Register staff account</h2>
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
                <label className="mb-1 block text-sm text-slate-600">Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'internal' | 'admin')}
                  className="w-full rounded border border-slate-300 px-3 py-2"
                >
                  <option value="internal">Internal Team</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Password</label>
                <div className="flex gap-2">
                  <input
                    required
                    minLength={8}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full rounded border border-slate-300 px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="shrink-0 rounded border border-slate-300 px-2 text-xs text-slate-600"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPassword(generatePassword())
                    setShowPassword(true)
                  }}
                  className="mt-1.5 text-xs text-slate-500 underline"
                >
                  Generate a password
                </button>
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
                  {submitting ? 'Creating...' : 'Create account'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

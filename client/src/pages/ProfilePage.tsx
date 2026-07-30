import { useEffect, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { changeMyPasswordRequest, getUserRequest, updateMeRequest } from '../api/users.api'
import { RoleBadge } from '../components/RoleBadge'
import { useAuth } from '../context/AuthContext'
import type { GroupRef, User } from '../types/models'

export function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { user: currentUser, refreshMe } = useAuth()
  const [profile, setProfile] = useState<User | null>(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)

  const [changingPassword, setChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const isSelf = currentUser?.id === id

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getUserRequest(id)
      .then((u) => {
        setProfile(u)
        setName(u.name)
        setBio(u.bio || '')
      })
      .finally(() => setLoading(false))
  }, [id])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    const updated = await updateMeRequest({ name, bio })
    setProfile(updated)
    setEditing(false)
    await refreshMe()
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    setSavingPassword(true)
    try {
      await changeMyPasswordRequest({ currentPassword, newPassword })
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setChangingPassword(false)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not change password'
      setPasswordError(message)
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) return <div className="mt-10 text-center text-slate-500">Loading...</div>
  if (!profile) return <div className="mt-10 text-center text-slate-500">User not found</div>

  const group = typeof profile.group === 'object' ? (profile.group as GroupRef | null) : null

  return (
    <div className="mx-auto mt-10 max-w-xl px-4">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">{profile.name}</h1>
        <RoleBadge role={profile.role} />
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-slate-600">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="rounded bg-slate-900 px-3 py-1.5 text-white">
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded border border-slate-300 px-3 py-1.5 text-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="mb-1 text-slate-600">{profile.email}</p>
          <p className="mb-4 text-slate-700">{profile.bio || 'No bio yet.'}</p>
          <p className="mb-4 text-sm text-slate-500">
            Group: {group ? group.name : 'Not yet assigned'}
          </p>
          {isSelf && (
            <button
              onClick={() => setEditing(true)}
              className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
            >
              Edit profile
            </button>
          )}
        </>
      )}

      {isSelf && !editing && (
        <div className="mt-8 border-t border-slate-200 pt-6">
          {passwordSuccess && !changingPassword && (
            <p className="mb-3 text-sm font-medium text-emerald-600">Password updated.</p>
          )}
          {changingPassword ? (
            <form onSubmit={handleChangePassword} className="max-w-sm space-y-3">
              <h2 className="text-sm font-medium text-slate-900">Change password</h2>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Current password</label>
                <input
                  required
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">New password</label>
                <input
                  required
                  minLength={8}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Confirm new password</label>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2"
                />
              </div>
              {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                >
                  {savingPassword ? 'Saving...' : 'Update password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChangingPassword(false)
                    setPasswordError(null)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                  className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => {
                setChangingPassword(true)
                setPasswordSuccess(false)
              }}
              className="text-sm text-slate-600 underline"
            >
              Change password
            </button>
          )}
        </div>
      )}
    </div>
  )
}

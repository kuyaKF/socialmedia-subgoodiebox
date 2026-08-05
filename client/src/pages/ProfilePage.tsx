import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import {
  changeMyPasswordRequest,
  getUserRequest,
  updateMeRequest,
  uploadAvatarRequest,
} from '../api/users.api'
import { Avatar } from '../components/Avatar'
import { RoleBadge } from '../components/RoleBadge'
import { useAuth } from '../context/AuthContext'
import type { GroupRef, User } from '../types/models'
import { extractErrorMessage } from '../utils/errors'

export function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { user: currentUser, refreshMe } = useAuth()
  const [profile, setProfile] = useState<User | null>(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [slug, setSlug] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [changingPassword, setChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const isSelf = !!profile && currentUser?.id === profile.id

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getUserRequest(id)
      .then((u) => {
        setProfile(u)
        setName(u.name)
        setBio(u.bio || '')
        setSlug(u.slug || '')
      })
      .finally(() => setLoading(false))
  }, [id])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaveError(null)
    setSaving(true)
    try {
      const updated = await updateMeRequest({ name, bio, slug })
      setProfile(updated)
      setEditing(false)
      await refreshMe()
    } catch (err) {
      setSaveError(extractErrorMessage(err, 'Could not save profile'))
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImageError(null)
    setUploadingAvatar(true)
    try {
      const url = await uploadAvatarRequest(file)
      const updated = await updateMeRequest({ avatarUrl: url })
      setProfile(updated)
      await refreshMe()
    } catch (err) {
      setImageError(extractErrorMessage(err, 'Could not upload profile picture'))
    } finally {
      setUploadingAvatar(false)
    }
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
      setPasswordError(extractErrorMessage(err, 'Could not change password'))
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) return <div className="mt-10 text-center text-slate-500">Loading...</div>
  if (!profile) return <div className="mt-10 text-center text-slate-500">User not found</div>

  const group = typeof profile.group === 'object' ? (profile.group as GroupRef | null) : null

  return (
    <div className="mx-auto mt-10 max-w-xl px-4">
      <div className="relative mb-4 flex items-center gap-3">
        <div className="relative">
          <Avatar name={profile.name} avatarUrl={profile.avatarUrl} size={20} />
          {isSelf && (
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              title="Change profile picture"
              className="absolute -bottom-1 -right-1 rounded-full border border-slate-300 bg-white px-1.5 py-1 text-xs shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              {uploadingAvatar ? '...' : '✎'}
            </button>
          )}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarSelect}
          />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">{profile.name}</h1>
            <RoleBadge role={profile.role} />
          </div>
          {profile.slug && <p className="text-sm text-slate-400">/profile/{profile.slug}</p>}
        </div>
      </div>

      {imageError && <p className="mb-4 text-sm text-red-600">{imageError}</p>}

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
          <div>
            <label className="mb-1 block text-sm text-slate-600">Profile URL</label>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-slate-400">/profile/</span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="your-name"
                className="w-full rounded border border-slate-300 px-3 py-2"
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              3-30 characters: lowercase letters, numbers, and hyphens only. Leave blank to remove
              your custom URL — your profile stays reachable at /profile/{profile.id} either way.
            </p>
          </div>
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-slate-900 px-3 py-1.5 text-white disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                setSaveError(null)
                setName(profile.name)
                setBio(profile.bio || '')
                setSlug(profile.slug || '')
              }}
              className="rounded border border-slate-300 px-3 py-1.5 text-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          {profile.email && <p className="mb-1 text-slate-600">{profile.email}</p>}
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

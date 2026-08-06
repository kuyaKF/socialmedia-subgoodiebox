import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  changeMyPasswordRequest,
  getUserRequest,
  updateMeRequest,
  uploadAvatarRequest,
} from '../api/users.api'
import { Avatar } from '../components/Avatar'
import { PencilIcon } from '../components/icons'
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

  if (loading) return <div className="mt-10 text-center text-muted-foreground">Loading...</div>
  if (!profile) return <div className="mt-10 text-center text-muted-foreground">User not found</div>

  const group = typeof profile.group === 'object' ? (profile.group as GroupRef | null) : null

  return (
    <div className="mx-auto mt-10 max-w-xl px-4">
      <div className="relative mb-4 flex items-center gap-3">
        <div className="relative">
          <Avatar name={profile.name} avatarUrl={profile.avatarUrl} size={20} />
          {isSelf && (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              title="Change profile picture"
              className="absolute -bottom-1 -right-1 rounded-full bg-background shadow-sm"
            >
              {uploadingAvatar ? '...' : <PencilIcon className="h-3.5 w-3.5" />}
            </Button>
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
            <h1 className="text-2xl font-semibold text-foreground">{profile.name}</h1>
            <RoleBadge role={profile.role} />
          </div>
          {profile.slug && <p className="text-sm text-muted-foreground">/profile/{profile.slug}</p>}
        </div>
      </div>

      {imageError && <p className="mb-4 text-sm text-destructive">{imageError}</p>}

      {editing ? (
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <Label htmlFor="profile-name" className="mb-1 block text-muted-foreground">
              Name
            </Label>
            <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="profile-bio" className="mb-1 block text-muted-foreground">
              Bio
            </Label>
            <Textarea id="profile-bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
          </div>
          <div>
            <Label htmlFor="profile-slug" className="mb-1 block text-muted-foreground">
              Profile URL
            </Label>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground">/profile/</span>
              <Input
                id="profile-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="your-name"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              3-30 characters: lowercase letters, numbers, and hyphens only. Leave blank to remove
              your custom URL — your profile stays reachable at /profile/{profile.id} either way.
            </p>
          </div>
          {saveError && <p className="text-sm text-destructive">{saveError}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditing(false)
                setSaveError(null)
                setName(profile.name)
                setBio(profile.bio || '')
                setSlug(profile.slug || '')
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          {profile.email && <p className="mb-1 text-muted-foreground">{profile.email}</p>}
          <p className="mb-4 text-foreground/80">{profile.bio || 'No bio yet.'}</p>
          <p className="mb-4 text-sm text-muted-foreground">
            Group: {group ? group.name : 'Not yet assigned'}
          </p>
          {isSelf && (
            <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
              Edit profile
            </Button>
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
              <h2 className="text-sm font-medium text-foreground">Change password</h2>
              <div>
                <Label htmlFor="current-password" className="mb-1 block text-muted-foreground">
                  Current password
                </Label>
                <Input
                  id="current-password"
                  required
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="new-password" className="mb-1 block text-muted-foreground">
                  New password
                </Label>
                <Input
                  id="new-password"
                  required
                  minLength={8}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password" className="mb-1 block text-muted-foreground">
                  Confirm new password
                </Label>
                <Input
                  id="confirm-password"
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={savingPassword}>
                  {savingPassword ? 'Saving...' : 'Update password'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setChangingPassword(false)
                    setPasswordError(null)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-muted-foreground"
              onClick={() => {
                setChangingPassword(true)
                setPasswordSuccess(false)
              }}
            >
              Change password
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

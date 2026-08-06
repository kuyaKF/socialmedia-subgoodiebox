import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Group, User } from '../../types/models'
import { extractErrorMessage } from '../../utils/errors'
import { Avatar } from '../Avatar'
import { CheckIcon, PencilIcon, TrashIcon, XIcon } from '../icons'
import { SearchableSelect } from '../SearchableSelect'

export function GroupCard({
  group,
  leaderCandidates,
  unassignedUsers,
  onSetLeader,
  onAddMember,
  onRemoveMember,
  onDelete,
  onRename,
}: {
  group: Group
  leaderCandidates: User[]
  unassignedUsers: User[]
  onSetLeader: (groupId: string, userId: string) => void
  onAddMember: (groupId: string, userId: string) => void
  onRemoveMember: (groupId: string, userId: string) => void
  onDelete: (groupId: string) => void
  onRename: (groupId: string, name: string) => Promise<void>
}) {
  const [leaderPick, setLeaderPick] = useState('')
  const [memberPick, setMemberPick] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [draftName, setDraftName] = useState(group.name)
  const [renameError, setRenameError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function startEdit() {
    setDraftName(group.name)
    setRenameError(null)
    setEditingName(true)
  }

  function cancelEdit() {
    setEditingName(false)
    setRenameError(null)
  }

  async function submitRename(e: FormEvent) {
    e.preventDefault()
    const trimmed = draftName.trim()
    if (!trimmed || trimmed === group.name) {
      setEditingName(false)
      return
    }
    setSaving(true)
    setRenameError(null)
    try {
      await onRename(group._id, trimmed)
      setEditingName(false)
    } catch (err) {
      setRenameError(extractErrorMessage(err, 'Could not rename group'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={group.name} size={9} />
          {editingName ? (
            <form onSubmit={submitRename} className="min-w-0">
              <div className="flex items-center gap-1">
                <Input
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  disabled={saving}
                  className="h-8 w-full min-w-0 font-semibold"
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon-sm"
                  disabled={saving}
                  title="Save"
                  className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <CheckIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={cancelEdit}
                  disabled={saving}
                  title="Cancel"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
              {renameError && <p className="mt-1 text-xs text-destructive">{renameError}</p>}
            </form>
          ) : (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-lg font-semibold text-foreground">{group.name}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={startEdit}
                  title="Rename group"
                >
                  <PencilIcon className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {group.members.length} member{group.members.length === 1 ? '' : 's'}
              </p>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button type="button" variant="ghost" size="sm" asChild>
            <Link to={`/admin/groups/${group._id}/feed`}>View feed</Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(group._id)}
            title="Delete group"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Leader
        </p>
        {group.leader ? (
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-2.5 py-2">
            <Avatar name={group.leader.name} avatarUrl={group.leader.avatarUrl} size={7} />
            <div className="min-w-0">
              <Link
                to={`/profile/${group.leader._id}`}
                className="block truncate text-sm font-medium text-foreground hover:underline"
              >
                {group.leader.name}
              </Link>
              <p className="truncate text-xs text-muted-foreground">{group.leader.email}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm italic text-muted-foreground">No leader assigned</p>
        )}
        {leaderCandidates.length > 0 && (
          <SearchableSelect
            className="mt-2"
            value={leaderPick}
            onChange={(userId) => {
              onSetLeader(group._id, userId)
              setLeaderPick('')
            }}
            placeholder="Assign leader..."
            options={leaderCandidates.map((u) => ({ value: u.id, label: u.name, sublabel: u.email }))}
          />
        )}
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Members ({group.members.length})
        </p>
        {group.members.length > 0 && (
          <ul className="mb-2 space-y-0.5">
            {group.members.map((m) => (
              <li
                key={m._id}
                className="group/member flex items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 hover:bg-muted/50"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar name={m.name} avatarUrl={m.avatarUrl} size={7} />
                  <div className="min-w-0">
                    <Link
                      to={`/profile/${m._id}`}
                      className="block truncate text-sm text-foreground hover:underline"
                    >
                      {m.name}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onRemoveMember(group._id, m._id)}
                  title="Remove member"
                  className="shrink-0 opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover/member:opacity-100"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        {group.members.length === 0 && (
          <p className="mb-2 text-sm italic text-muted-foreground">No members yet.</p>
        )}
        {unassignedUsers.length > 0 && (
          <SearchableSelect
            value={memberPick}
            onChange={(userId) => {
              onAddMember(group._id, userId)
              setMemberPick('')
            }}
            placeholder="Add member..."
            options={unassignedUsers.map((u) => ({ value: u.id, label: u.name, sublabel: u.email }))}
          />
        )}
      </div>
    </div>
  )
}

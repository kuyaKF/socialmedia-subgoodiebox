import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../Avatar'
import { CheckIcon, PencilIcon, TrashIcon, XIcon } from '../icons'
import { SearchableSelect } from '../SearchableSelect'
import type { Group, User } from '../../types/models'

function extractErrorMessage(err: unknown, fallback: string): string {
  const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
  return message || fallback
}

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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={group.name} size={9} />
          {editingName ? (
            <form onSubmit={submitRename} className="min-w-0">
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  disabled={saving}
                  className="w-full min-w-0 rounded border border-slate-300 px-2 py-1 text-sm font-semibold text-slate-900"
                />
                <button
                  type="submit"
                  disabled={saving}
                  title="Save"
                  className="shrink-0 rounded p-1 text-emerald-600 hover:bg-emerald-50"
                >
                  <CheckIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  title="Cancel"
                  className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
              {renameError && <p className="mt-1 text-xs text-red-600">{renameError}</p>}
            </form>
          ) : (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-lg font-semibold text-slate-900">{group.name}</h3>
                <button
                  onClick={startEdit}
                  title="Rename group"
                  className="shrink-0 rounded p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-500"
                >
                  <PencilIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-400">
                {group.members.length} member{group.members.length === 1 ? '' : 's'}
              </p>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Link
            to={`/admin/groups/${group._id}/feed`}
            className="rounded px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            View feed
          </Link>
          <button
            onClick={() => onDelete(group._id)}
            title="Delete group"
            className="shrink-0 rounded p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-600"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">Leader</p>
        {group.leader ? (
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
            <Avatar name={group.leader.name} size={7} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{group.leader.name}</p>
              <p className="truncate text-xs text-slate-500">{group.leader.email}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm italic text-slate-400">No leader assigned</p>
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
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
          Members ({group.members.length})
        </p>
        {group.members.length > 0 && (
          <ul className="mb-2 space-y-0.5">
            {group.members.map((m) => (
              <li
                key={m._id}
                className="group/member flex items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 hover:bg-slate-50"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar name={m.name} size={7} />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-900">{m.name}</p>
                    <p className="truncate text-xs text-slate-400">{m.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveMember(group._id, m._id)}
                  title="Remove member"
                  className="shrink-0 rounded p-1 text-slate-300 opacity-0 hover:bg-red-50 hover:text-red-600 group-hover/member:opacity-100"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {group.members.length === 0 && (
          <p className="mb-2 text-sm italic text-slate-400">No members yet.</p>
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

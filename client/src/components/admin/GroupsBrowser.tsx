import { useEffect, useState } from 'react'
import { listGroupsRequest } from '../../api/groups.api'
import { PlusIcon, SearchIcon } from '../icons'
import type { PaginatedGroups, User } from '../../types/models'
import { CreateGroupModal } from './CreateGroupModal'
import { GroupCard } from './GroupCard'

const PAGE_SIZE = 6

export function GroupsBrowser({
  leaderCandidates,
  unassignedUsers,
  refreshTick,
  onCreate,
  onSetLeader,
  onAddMember,
  onRemoveMember,
  onDelete,
  onRename,
}: {
  leaderCandidates: User[]
  unassignedUsers: User[]
  refreshTick: number
  onCreate: (input: { name: string; leaderId?: string }) => Promise<void>
  onSetLeader: (groupId: string, userId: string) => void
  onAddMember: (groupId: string, userId: string) => void
  onRemoveMember: (groupId: string, userId: string) => void
  onDelete: (groupId: string) => void
  onRename: (groupId: string, name: string) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PaginatedGroups | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const timer = setTimeout(() => {
      listGroupsRequest({ search: search || undefined, page, limit: PAGE_SIZE })
        .then((result) => {
          if (!cancelled) setData(result)
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [search, page, refreshTick])

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1)
              setSearch(e.target.value)
            }}
            placeholder="Search groups by name..."
            className="w-full rounded-lg border border-slate-300 py-1.5 pl-8 pr-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Create group
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.groups.map((g) => (
          <GroupCard
            key={g._id}
            group={g}
            leaderCandidates={leaderCandidates}
            unassignedUsers={unassignedUsers}
            onSetLeader={onSetLeader}
            onAddMember={onAddMember}
            onRemoveMember={onRemoveMember}
            onDelete={onDelete}
            onRename={onRename}
          />
        ))}
        {!loading && data?.groups.length === 0 && (
          <p className="text-sm text-slate-500">No groups match this search.</p>
        )}
      </div>

      {data && data.total > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>
            {data.total} group{data.total === 1 ? '' : 's'} · page {data.page} of {data.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={data.page <= 1}
              className="rounded border border-slate-300 px-2 py-1 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={data.page >= data.totalPages}
              className="rounded border border-slate-300 px-2 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateGroupModal
          leaderCandidates={leaderCandidates}
          onClose={() => setShowCreateModal(false)}
          onCreate={onCreate}
        />
      )}
    </div>
  )
}

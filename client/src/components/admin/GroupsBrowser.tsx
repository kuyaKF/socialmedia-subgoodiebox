import { PlusIcon, SearchIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePaginatedResource } from '@/hooks/usePaginatedResource'
import { listGroupsRequest } from '../../api/groups.api'
import type { User } from '../../types/models'
import { CreateGroupModal } from './CreateGroupModal'
import { GroupCard } from './GroupCard'
import { Pagination } from './Pagination'

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
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { page, setPage, data, loading } = usePaginatedResource(
    (page) => listGroupsRequest({ search: search || undefined, page, limit: PAGE_SIZE }),
    [search, refreshTick],
  )

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setPage(1)
              setSearch(e.target.value)
            }}
            placeholder="Search groups by name..."
            className="pl-8"
          />
        </div>
        <Button type="button" size="sm" className="shrink-0" onClick={() => setShowCreateModal(true)}>
          <PlusIcon />
          Create group
        </Button>
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
          <p className="text-sm text-muted-foreground">No groups match this search.</p>
        )}
      </div>

      {data && (
        <Pagination
          page={page}
          totalPages={data.totalPages}
          total={data.total}
          itemLabel="group"
          onPageChange={setPage}
        />
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

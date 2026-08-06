import { useEffect, useState } from 'react'
import {
  addMemberRequest,
  createGroupRequest,
  deleteGroupRequest,
  listGroupsRequest,
  removeMemberRequest,
  setLeaderRequest,
  updateGroupRequest,
} from '../api/groups.api'
import { listUsersRequest } from '../api/users.api'
import { GroupsBrowser } from '../components/admin/GroupsBrowser'
import { UsersBrowser } from '../components/admin/UsersBrowser'
import { Skeleton } from '../components/ui/skeleton'
import type { Group, User } from '../types/models'

// Large enough to treat as "all" for filter dropdowns/candidate lists — this boilerplate
// doesn't paginate these particular lookups.
const UNASSIGNED_FETCH_LIMIT = 200
const ALL_GROUPS_FETCH_LIMIT = 500

export function AdminGroupsPage() {
  const [allGroups, setAllGroups] = useState<Group[]>([])
  const [unassignedUsers, setUnassignedUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [groupsRefreshTick, setGroupsRefreshTick] = useState(0)

  async function loadSharedData() {
    const [groupsData, unassignedData] = await Promise.all([
      listGroupsRequest({ limit: ALL_GROUPS_FETCH_LIMIT }),
      listUsersRequest({ group: 'unassigned', limit: UNASSIGNED_FETCH_LIMIT }),
    ])
    setAllGroups(groupsData.groups)
    setUnassignedUsers(unassignedData.users)
  }

  useEffect(() => {
    loadSharedData().finally(() => setLoading(false))
  }, [])

  const leaderCandidates = unassignedUsers.filter((u) => u.role === 'internal' || u.role === 'admin')
  // Groups are now paid "circle" membership — only paying subscribers should be addable as members.
  const paidUnassignedUsers = unassignedUsers.filter((u) => u.subscription.plan !== 'free')

  async function refreshAfterChange() {
    await loadSharedData()
    setGroupsRefreshTick((t) => t + 1)
  }

  async function handleCreate(input: { name: string; leaderId?: string }) {
    await createGroupRequest(input)
    await refreshAfterChange()
  }

  async function handleSetLeader(groupId: string, userId: string) {
    await setLeaderRequest(groupId, userId)
    await refreshAfterChange()
  }

  async function handleAddMember(groupId: string, userId: string) {
    await addMemberRequest(groupId, userId)
    await refreshAfterChange()
  }

  async function handleRemoveMember(groupId: string, userId: string) {
    await removeMemberRequest(groupId, userId)
    await refreshAfterChange()
  }

  async function handleDeleteGroup(groupId: string) {
    await deleteGroupRequest(groupId)
    await refreshAfterChange()
  }

  async function handleRename(groupId: string, name: string) {
    await updateGroupRequest(groupId, name)
    await refreshAfterChange()
  }

  if (loading) {
    return (
      <div className="mx-auto mt-10 max-w-6xl space-y-3 px-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto mt-10 max-w-6xl px-4">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Manage Groups</h1>

      <div className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">All Users</h2>
        <UsersBrowser groups={allGroups} onUserChanged={loadSharedData} />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Groups</h2>
        <GroupsBrowser
          leaderCandidates={leaderCandidates}
          unassignedUsers={paidUnassignedUsers}
          refreshTick={groupsRefreshTick}
          onCreate={handleCreate}
          onSetLeader={handleSetLeader}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          onDelete={handleDeleteGroup}
          onRename={handleRename}
        />
      </div>
    </div>
  )
}

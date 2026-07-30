import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getGroupRequest, getMyGroupRequest } from '../api/groups.api'
import {
  createGroupPostRequest,
  deleteGroupPostRequest,
  getGroupFeedRequest,
  getMyGroupFeedRequest,
} from '../api/groupPosts.api'
import { Avatar } from '../components/Avatar'
import { Composer } from '../components/feed/Composer'
import { FeedCard } from '../components/feed/FeedCard'
import { useAuth } from '../context/AuthContext'
import type { FeedItem, Group, GroupPostVisibility } from '../types/models'
import { canEngageWithItem } from '../utils/engagement'

const PAGE_SIZE = 10

export function GroupPage() {
  const { user } = useAuth()
  const { groupId: routeGroupId } = useParams<{ groupId: string }>()
  const isAdminView = Boolean(routeGroupId)

  const [group, setGroup] = useState<Group | null>(null)
  const [groupLoading, setGroupLoading] = useState(true)
  const [notAssigned, setNotAssigned] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const [items, setItems] = useState<FeedItem[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  useEffect(() => {
    setGroupLoading(true)
    const request = routeGroupId ? getGroupRequest(routeGroupId) : getMyGroupRequest()
    request
      .then(setGroup)
      .catch(() => (routeGroupId ? setNotFound(true) : setNotAssigned(true)))
      .finally(() => setGroupLoading(false))
  }, [routeGroupId])

  const loadMore = useCallback(
    async (reset = false) => {
      if (loadingRef.current) return
      loadingRef.current = true
      setLoading(true)
      try {
        const params = { before: reset ? undefined : (cursor ?? undefined), limit: PAGE_SIZE }
        const result = routeGroupId
          ? await getGroupFeedRequest(routeGroupId, params)
          : await getMyGroupFeedRequest(params)
        setItems((prev) => (reset ? result.items : [...prev, ...result.items]))
        setCursor(result.nextCursor)
        setHasMore(result.nextCursor !== null)
      } finally {
        setLoading(false)
        setInitialLoading(false)
        loadingRef.current = false
      }
    },
    [cursor, routeGroupId]
  )

  useEffect(() => {
    if (!groupLoading && group) loadMore(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupLoading, group])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loading, loadMore])

  async function refreshFeed() {
    setCursor(null)
    await loadMore(true)
  }

  async function handleDelete(item: FeedItem) {
    await deleteGroupPostRequest(item._id)
    setItems((prev) => prev.filter((i) => i._id !== item._id))
  }

  if (!user) return null
  if (groupLoading) return <div className="mt-10 text-center text-slate-500">Loading...</div>

  if (notFound) {
    return (
      <div className="mx-auto mt-16 max-w-md px-4 text-center">
        <h1 className="mb-2 text-xl font-semibold text-slate-900">Group not found</h1>
        <Link to="/admin/groups" className="text-sm font-medium text-slate-900 underline">
          Back to Manage Groups
        </Link>
      </div>
    )
  }

  if (notAssigned || !group) {
    return (
      <div className="mx-auto mt-16 max-w-md px-4 text-center">
        <h1 className="mb-2 text-xl font-semibold text-slate-900">No circle yet</h1>
        <p className="text-slate-500">
          You haven't been placed in a circle yet. Once an admin assigns you to one, its private
          feed will show up here.
        </p>
      </div>
    )
  }

  const isLeader = group.leader?._id === user.id
  const canChooseVisibility = isLeader || user.role === 'admin'

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {isAdminView && (
        <p className="mb-3 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
          Viewing as admin
        </p>
      )}
      <h1 className="mb-1 text-xl font-semibold text-slate-900">{group.name}</h1>
      <p className="mb-4 text-sm text-slate-500">A private space for this circle's members.</p>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-4">
        {group.leader && (
          <Link
            to={`/profile/${group.leader._id}`}
            className="flex items-center gap-2 rounded-full bg-slate-50 py-1 pl-1 pr-3 text-sm hover:bg-slate-100"
          >
            <Avatar name={group.leader.name} size={7} />
            <span className="font-medium text-slate-900">{group.leader.name}</span>
            <span className="text-xs text-slate-400">Leader</span>
          </Link>
        )}
        {group.members.map((m) => (
          <Link
            key={m._id}
            to={`/profile/${m._id}`}
            className="flex items-center gap-2 rounded-full bg-slate-50 py-1 pl-1 pr-3 text-sm hover:bg-slate-100"
          >
            <Avatar name={m.name} size={7} />
            <span className="text-slate-700">{m.name}</span>
          </Link>
        ))}
      </div>

      <div className="mb-6">
        <Composer
          placeholder={`Post something to ${group.name}...`}
          submitLabel={`Post to ${group.name}`}
          showVisibilityToggle={canChooseVisibility}
          onSubmit={async (body, visibility?: GroupPostVisibility) => {
            await createGroupPostRequest(group._id, body, visibility)
            await refreshFeed()
          }}
        />
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <FeedCard
            key={item._id}
            item={item}
            canDelete={user.role === 'admin' || item.author._id === user.id}
            canEngage={canEngageWithItem(user, item)}
            onDelete={() => handleDelete(item)}
          />
        ))}
      </div>

      {initialLoading && <p className="py-8 text-center text-sm text-slate-400">Loading posts...</p>}
      {!initialLoading && items.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-400">
          Nothing here yet. Post something to get things started.
        </p>
      )}
      <div ref={sentinelRef} className="h-4" />
      {loading && !initialLoading && (
        <p className="py-4 text-center text-sm text-slate-400">Loading more...</p>
      )}
      {!hasMore && items.length > 0 && (
        <p className="py-4 text-center text-xs text-slate-300">You're all caught up.</p>
      )}
    </div>
  )
}

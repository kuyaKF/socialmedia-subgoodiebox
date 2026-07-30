import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { createAnnouncementRequest, deleteAnnouncementRequest } from '../api/announcements.api'
import { deleteBlogPostRequest } from '../api/blogPosts.api'
import { getFeedRequest } from '../api/feed.api'
import { createGroupPostRequest, deleteGroupPostRequest } from '../api/groupPosts.api'
import { RoleBadge } from '../components/RoleBadge'
import { Composer } from '../components/feed/Composer'
import { FeedCard } from '../components/feed/FeedCard'
import { useAuth } from '../context/AuthContext'
import type { FeedItem, GroupRef } from '../types/models'
import { canEngageWithItem } from '../utils/engagement'

const PAGE_SIZE = 10

export function FeedPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<FeedItem[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const sentinelRef = useRef<HTMLDivElement>(null)
  // Synchronous re-entrancy guard: the mount effect and the IntersectionObserver's
  // fire-if-already-intersecting behavior can both trigger a load at nearly the same
  // moment. State-based checks aren't enough since both closures may still see
  // `loading === false`. A ref is read/written synchronously, so it reliably prevents
  // the second call from starting until the first has finished.
  const loadingRef = useRef(false)

  const loadMore = useCallback(
    async (reset = false) => {
      if (loadingRef.current) return
      loadingRef.current = true
      setLoading(true)
      try {
        const result = await getFeedRequest({
          before: reset ? undefined : (cursor ?? undefined),
          limit: PAGE_SIZE,
        })
        setItems((prev) => (reset ? result.items : [...prev, ...result.items]))
        setCursor(result.nextCursor)
        setHasMore(result.nextCursor !== null)
      } finally {
        setLoading(false)
        setInitialLoading(false)
        loadingRef.current = false
      }
    },
    [cursor]
  )

  useEffect(() => {
    loadMore(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  if (!user) return null

  const group = typeof user.group === 'object' ? (user.group as GroupRef | null) : null

  async function refreshFeed() {
    setCursor(null)
    await loadMore(true)
  }

  async function handleDelete(item: FeedItem) {
    if (item.type === 'announcement') await deleteAnnouncementRequest(item._id)
    if (item.type === 'group_post') await deleteGroupPostRequest(item._id)
    if (item.type === 'blog_post') await deleteBlogPostRequest(item._id)
    setItems((prev) => prev.filter((i) => i._id !== item._id))
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-xl font-semibold text-slate-900">Welcome, {user.name}</h1>
        <RoleBadge role={user.role} />
      </div>

      <div className="mb-6 space-y-3">
        {user.role === 'admin' && (
          <>
            <Composer
              placeholder="Share an announcement with everyone..."
              submitLabel="Post announcement"
              onSubmit={async (body) => {
                await createAnnouncementRequest(body)
                await refreshFeed()
              }}
            />
            <Link
              to="/admin/blog/new"
              className="inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              + Write a blog post
            </Link>
          </>
        )}
        {group && (
          <Composer
            placeholder={`Post something to ${group.name}...`}
            submitLabel={`Post to ${group.name}`}
            onSubmit={async (body) => {
              await createGroupPostRequest(group._id, body)
              await refreshFeed()
            }}
          />
        )}
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <FeedCard
            key={`${item.type}-${item._id}`}
            item={item}
            canDelete={user.role === 'admin' || item.author._id === user.id}
            canEngage={canEngageWithItem(user, item)}
            onDelete={() => handleDelete(item)}
          />
        ))}
      </div>

      {initialLoading && <p className="py-8 text-center text-sm text-slate-400">Loading feed...</p>}
      {!initialLoading && items.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-400">
          Nothing here yet. {group || user.role === 'admin' ? 'Post something to get things started.' : ''}
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

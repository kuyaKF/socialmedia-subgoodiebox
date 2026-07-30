import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useEngagement } from '../../hooks/useEngagement'
import type { FeedItem } from '../../types/models'
import { Avatar } from '../Avatar'
import { RoleBadge } from '../RoleBadge'
import { BookIcon, HeartIcon, MegaphoneIcon, MessageIcon, TrashIcon, UsersIcon } from '../icons'

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

const ICONS: Record<FeedItem['type'], typeof MegaphoneIcon> = {
  announcement: MegaphoneIcon,
  blog_post: BookIcon,
  group_post: UsersIcon,
}

function ContextLabel({ item, isAdmin }: { item: FeedItem; isAdmin: boolean }) {
  if (item.type === 'announcement') return <>Announcement</>
  if (item.type === 'blog_post') {
    return (
      <Link to={`/blog/${item._id}`} className="hover:underline">
        Blog post
      </Link>
    )
  }

  const groupName = item.group?.name ?? 'group'
  const publicSuffix = item.visibility === 'public' ? ' · Public' : ''
  if (isAdmin && item.group) {
    return (
      <>
        Posted in{' '}
        <Link to={`/admin/groups/${item.group._id}/feed`} className="font-medium hover:underline">
          {groupName}
        </Link>
        {publicSuffix}
      </>
    )
  }
  return (
    <>
      Posted in {groupName}
      {publicSuffix}
    </>
  )
}

export function FeedCard({
  item,
  canDelete,
  canEngage,
  isAdmin,
  onDelete,
}: {
  item: FeedItem
  canDelete: boolean
  canEngage: boolean
  isAdmin?: boolean
  onDelete: () => void
}) {
  const [showComments, setShowComments] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')
  const {
    liked,
    likeCount,
    commentCount,
    comments,
    loadingComments,
    toggleLike,
    loadComments,
    addComment,
  } = useEngagement(item.type, item._id, {
    likeCount: item.likeCount,
    commentCount: item.commentCount,
    likedByMe: item.likedByMe,
  })

  const ContextIcon = ICONS[item.type]

  async function handleToggleComments() {
    const next = !showComments
    setShowComments(next)
    if (next) await loadComments()
  }

  async function handleAddComment() {
    if (!commentDraft.trim()) return
    await addComment(commentDraft.trim())
    setCommentDraft('')
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <Avatar name={item.author.name} size={9} />
          <div>
            <div className="flex items-center gap-1.5">
              <Link
                to={`/profile/${item.author._id}`}
                className="text-sm font-semibold text-slate-900 hover:underline"
              >
                {item.author.name}
              </Link>
              <RoleBadge role={item.author.role} />
            </div>
            <p className="flex items-center gap-1 text-xs text-slate-400">
              <ContextIcon className="h-3.5 w-3.5" />
              <ContextLabel item={item} isAdmin={Boolean(isAdmin)} /> &middot; {timeAgo(item.createdAt)}
            </p>
          </div>
        </div>
        {canDelete && (
          <button
            onClick={onDelete}
            title="Delete"
            className="rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-600"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {item.title && (
        <h3 className="mb-1.5 text-lg font-semibold text-slate-900">
          {item.type === 'blog_post' ? (
            <Link to={`/blog/${item._id}`} className="hover:underline">
              {item.title}
            </Link>
          ) : (
            item.title
          )}
        </h3>
      )}
      <p className="whitespace-pre-wrap text-sm text-slate-700">{item.body}</p>

      <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-sm">
        {canEngage ? (
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1.5 ${liked ? 'text-rose-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <HeartIcon className="h-4 w-4" filled={liked} />
            {likeCount > 0 ? likeCount : 'Like'}
          </button>
        ) : (
          <Link
            to="/subscription"
            title="Upgrade to a paid plan to like posts"
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600"
          >
            <HeartIcon className="h-4 w-4" />
            {likeCount > 0 ? likeCount : 'Like'}
          </Link>
        )}
        <button
          onClick={handleToggleComments}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700"
        >
          <MessageIcon className="h-4 w-4" />
          {commentCount > 0 ? commentCount : 'Comment'}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
          {loadingComments && <p className="text-xs text-slate-400">Loading comments...</p>}
          {comments?.map((c) => (
            <div key={c._id} className="flex items-start gap-2">
              <Avatar name={c.author.name} size={7} />
              <div className="rounded-lg bg-slate-50 px-3 py-1.5">
                <p className="text-xs font-medium text-slate-900">{c.author.name}</p>
                <p className="text-sm text-slate-700">{c.body}</p>
              </div>
            </div>
          ))}
          {canEngage ? (
            <div className="flex items-center gap-2 pt-1">
              <input
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Write a comment..."
                className="w-full rounded-full border border-slate-200 px-3 py-1.5 text-sm focus:border-slate-400 focus:outline-none"
              />
              <button
                onClick={handleAddComment}
                className="shrink-0 text-sm font-medium text-slate-900 hover:underline"
              >
                Post
              </button>
            </div>
          ) : (
            <Link
              to="/subscription"
              className="block pt-1 text-xs font-medium text-indigo-600 hover:underline"
            >
              Upgrade to a paid plan to join the conversation &rarr;
            </Link>
          )}
        </div>
      )}
    </article>
  )
}

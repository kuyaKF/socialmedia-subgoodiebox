import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useEngagement } from '../../hooks/useEngagement'
import type { FeedItem } from '../../types/models'
import { Avatar } from '../Avatar'
import { RoleBadge } from '../RoleBadge'
import {
  BookIcon,
  HeartIcon,
  MegaphoneIcon,
  MessageIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
} from '../icons'

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
  canEdit,
  canEngage,
  isAdmin,
  currentUserId,
  onDelete,
  onEdit,
}: {
  item: FeedItem
  canDelete: boolean
  canEdit?: boolean
  canEngage: boolean
  isAdmin?: boolean
  currentUserId?: string
  onDelete: () => void
  onEdit?: (body: string) => void | Promise<void>
}) {
  const [showComments, setShowComments] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')
  const [editing, setEditing] = useState(false)
  const [editDraft, setEditDraft] = useState(item.body)
  const {
    liked,
    likeCount,
    commentCount,
    comments,
    loadingComments,
    toggleLike,
    loadComments,
    addComment,
    deleteComment,
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

  async function handleSaveEdit() {
    if (!editDraft.trim() || !onEdit) return
    await onEdit(editDraft.trim())
    setEditing(false)
  }

  function handleCancelEdit() {
    setEditDraft(item.body)
    setEditing(false)
  }

  return (
    <Card>
      <CardContent>
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <Avatar name={item.author.name} avatarUrl={item.author.avatarUrl} size={9} />
            <div>
              <div className="flex items-center gap-1.5">
                <Link
                  to={`/profile/${item.author._id}`}
                  className="text-sm font-semibold text-foreground hover:underline"
                >
                  {item.author.name}
                </Link>
                <RoleBadge role={item.author.role} />
              </div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <ContextIcon className="h-3.5 w-3.5" />
                <ContextLabel item={item} isAdmin={Boolean(isAdmin)} /> &middot; {timeAgo(item.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {canEdit && !editing && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setEditing(true)}
                title="Edit"
                className="text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onDelete}
                title="Delete"
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {item.title && (
          <h3 className="mb-1.5 text-lg font-semibold text-foreground">
            {item.type === 'blog_post' ? (
              <Link to={`/blog/${item._id}`} className="hover:underline">
                {item.title}
              </Link>
            ) : (
              item.title
            )}
          </h3>
        )}
        {editing ? (
          <div className="space-y-2">
            <Textarea value={editDraft} onChange={(e) => setEditDraft(e.target.value)} rows={3} />
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm text-foreground/80">{item.body}</p>
        )}

        <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-sm">
          {canEngage ? (
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1.5 ${liked ? 'text-rose-600' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <HeartIcon className="h-4 w-4" filled={liked} />
              {likeCount > 0 ? likeCount : 'Like'}
            </button>
          ) : (
            <Link
              to="/subscription"
              title="Upgrade to a paid plan to like posts"
              className="flex items-center gap-1.5 text-muted-foreground/70 hover:text-muted-foreground"
            >
              <HeartIcon className="h-4 w-4" />
              {likeCount > 0 ? likeCount : 'Like'}
            </Link>
          )}
          <button
            onClick={handleToggleComments}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <MessageIcon className="h-4 w-4" />
            {commentCount > 0 ? commentCount : 'Comment'}
          </button>
        </div>

        {showComments && (
          <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
            {loadingComments && <p className="text-xs text-muted-foreground">Loading comments...</p>}
            {comments?.map((c) => (
              <div key={c._id} className="flex items-start gap-2">
                <Avatar name={c.author.name} avatarUrl={c.author.avatarUrl} size={7} />
                <div className="flex-1 rounded-lg bg-muted/50 px-3 py-1.5">
                  <p className="text-xs font-medium text-foreground">{c.author.name}</p>
                  <p className="text-sm text-foreground/80">{c.body}</p>
                </div>
                {(c.author._id === currentUserId || isAdmin) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => deleteComment(c._id)}
                    title="Delete comment"
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
            {canEngage ? (
              <div className="flex items-center gap-2 pt-1">
                <Input
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Write a comment..."
                />
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="shrink-0 px-0"
                  onClick={handleAddComment}
                >
                  Post
                </Button>
              </div>
            ) : (
              <Link
                to="/subscription"
                className="block pt-1 text-xs font-medium text-primary hover:underline"
              >
                Upgrade to a paid plan to join the conversation &rarr;
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

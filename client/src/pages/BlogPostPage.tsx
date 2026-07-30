import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBlogPostRequest } from '../api/blogPosts.api'
import { Avatar } from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { useEngagement } from '../hooks/useEngagement'
import { HeartIcon } from '../components/icons'
import type { BlogPostSummary } from '../types/models'

export function BlogPostPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [post, setPost] = useState<BlogPostSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setNotFound(false)
    getBlogPostRequest(id)
      .then(setPost)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  const { liked, likeCount, commentCount, comments, loadingComments, toggleLike, loadComments, addComment } =
    useEngagement('blog_post', id ?? '', {
      likeCount: post?.likeCount ?? 0,
      commentCount: post?.commentCount ?? 0,
      likedByMe: post?.likedByMe ?? false,
    })

  useEffect(() => {
    if (post) loadComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post])

  async function handleAddComment() {
    if (!commentDraft.trim()) return
    await addComment(commentDraft.trim())
    setCommentDraft('')
  }

  if (loading) {
    return <p className="mx-auto max-w-2xl px-4 py-12 text-sm text-slate-400">Loading...</p>
  }

  if (notFound || !post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="mb-4 text-sm text-slate-500">Post not found.</p>
        <Link to="/blog" className="text-sm font-medium text-slate-900 underline">
          Back to blog
        </Link>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <Link to="/blog" className="mb-6 inline-block text-sm text-slate-500 hover:text-slate-700">
        &larr; Back to blog
      </Link>
      <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-900">{post.title}</h1>
      {post.thumbnailUrl && (
        <img
          src={post.thumbnailUrl}
          alt=""
          className="mb-6 h-64 w-full rounded-lg object-cover sm:h-80"
        />
      )}
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Avatar name={post.author.name} size={7} />
        <span>{post.author.name}</span>
        <span>&middot;</span>
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>
      {post.blocks.map((block, i) => {
        if (block.type === 'heading') {
          return (
            <h2 key={i} className="mb-2 mt-6 text-xl font-semibold text-slate-900">
              {block.text}
            </h2>
          )
        }
        if (block.type === 'paragraph') {
          return (
            <p key={i} className="mb-4 whitespace-pre-wrap text-base leading-relaxed text-slate-700">
              {block.text}
            </p>
          )
        }
        return (
          <figure key={i} className="my-6">
            <img src={block.url} alt={block.caption ?? ''} className="w-full rounded-lg" />
            {block.caption && (
              <figcaption className="mt-2 text-center text-sm text-slate-400">{block.caption}</figcaption>
            )}
          </figure>
        )
      })}

      <div className="mt-8 flex items-center gap-4 border-t border-slate-100 pt-4 text-sm">
        {user ? (
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1.5 ${liked ? 'text-rose-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <HeartIcon className="h-4 w-4" filled={liked} />
            {likeCount > 0 ? likeCount : 'Like'}
          </button>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600"
          >
            <HeartIcon className="h-4 w-4" />
            {likeCount > 0 ? likeCount : 'Like'}
          </Link>
        )}
        <span className="text-slate-400">
          {commentCount} comment{commentCount === 1 ? '' : 's'}
        </span>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-6">
        <h2 className="mb-4 text-sm font-medium text-slate-900">Comments</h2>
        {loadingComments && <p className="text-xs text-slate-400">Loading comments...</p>}
        <div className="space-y-3">
          {comments?.map((c) => (
            <div key={c._id} className="flex items-start gap-2">
              <Avatar name={c.author.name} size={7} />
              <div className="rounded-lg bg-slate-50 px-3 py-1.5">
                <p className="text-xs font-medium text-slate-900">{c.author.name}</p>
                <p className="text-sm text-slate-700">{c.body}</p>
              </div>
            </div>
          ))}
          {comments?.length === 0 && (
            <p className="text-sm text-slate-400">No comments yet — be the first to say something.</p>
          )}
        </div>

        {user ? (
          <div className="mt-4 flex items-center gap-2">
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
          <p className="mt-4 text-sm text-slate-500">
            <Link to="/login" className="font-medium text-slate-900 underline">
              Log in
            </Link>{' '}
            to join the conversation.
          </p>
        )}
      </div>
    </article>
  )
}

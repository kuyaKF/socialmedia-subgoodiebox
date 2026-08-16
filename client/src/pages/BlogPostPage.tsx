import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBlogPostRequest } from '../api/blogPosts.api'
import { Avatar } from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { useEngagement } from '../hooks/useEngagement'
import { HeartIcon, MessageIcon } from '../components/icons'
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
    return (
      <p className="font-body bg-[#FFFDF9] px-4 py-16 text-center text-sm text-[#4B5A73]">
        Loading...
      </p>
    )
  }

  if (notFound || !post) {
    return (
      <div className="bg-[#FFFDF9] px-4 py-16 text-center">
        <p className="font-body mb-4 text-sm text-[#4B5A73]">Post not found.</p>
        <Link to="/blog" className="font-body text-sm font-semibold text-[#2C4870] underline">
          Back to blog
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[#FFFDF9] px-4 py-12 sm:py-16">
      <article className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/blog"
            className="font-body text-sm text-[#4B5A73] transition-colors hover:text-[#2C4870]"
          >
            &larr; Back to blog
          </Link>
          {user?.role === 'admin' && (
            <Link
              to={`/admin/blog/${post._id}/edit`}
              className="font-body text-sm font-medium text-[#4B5A73] transition-colors hover:text-[#2C4870]"
            >
              Edit post
            </Link>
          )}
        </div>

        <h1 className="font-body mb-3 text-3xl font-extrabold tracking-tight text-[#2C4870] sm:text-4xl">
          {post.title}
        </h1>

        <div className="mb-6 flex items-center gap-2 text-sm text-[#4B5A73]">
          <Avatar name={post.author.name} size={8} />
          <span className="font-body font-medium text-[#2C4870]">{post.author.name}</span>
          <span>&middot;</span>
          <span className="font-body">{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>

        {post.thumbnailUrl && (
          <img
            src={post.thumbnailUrl}
            alt=""
            className="mb-8 h-64 w-full rounded-2xl object-cover sm:h-96"
          />
        )}

        <div className="stationery-card rounded-[1.75rem] p-6 sm:p-10">
          {post.blocks.map((block, i) => {
            if (block.type === 'heading') {
              return (
                <h2
                  key={i}
                  className="font-body mt-8 mb-2 text-xl font-bold text-[#2C4870] first:mt-0"
                >
                  {block.text}
                </h2>
              )
            }
            if (block.type === 'paragraph') {
              return (
                <p
                  key={i}
                  className="font-body mb-4 whitespace-pre-wrap text-[15px] leading-relaxed text-[#4B5A73] last:mb-0"
                >
                  {block.text}
                </p>
              )
            }
            return (
              <figure key={i} className="my-6">
                <img src={block.url} alt={block.caption ?? ''} className="w-full rounded-xl" />
                {block.caption && (
                  <figcaption className="font-body mt-2 text-center text-sm text-[#4B5A73]/80">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            )
          })}
        </div>

        <div className="mt-6 flex items-center gap-3 text-sm">
          {user ? (
            <button
              onClick={toggleLike}
              className={`font-body flex items-center gap-1.5 rounded-full px-4 py-2 font-medium transition-colors ${
                liked ? 'bg-[#E888A0]/15 text-[#2C4870]' : 'text-[#4B5A73] hover:bg-[#2C4870]/5'
              }`}
            >
              <HeartIcon className="h-4 w-4" filled={liked} />
              {likeCount > 0 ? likeCount : 'Like'}
            </button>
          ) : (
            <Link
              to="/login"
              className="font-body flex items-center gap-1.5 rounded-full px-4 py-2 font-medium text-[#4B5A73] transition-colors hover:bg-[#2C4870]/5"
            >
              <HeartIcon className="h-4 w-4" />
              {likeCount > 0 ? likeCount : 'Like'}
            </Link>
          )}
          <span className="font-body flex items-center gap-1.5 px-4 py-2 text-[#4B5A73]">
            <MessageIcon className="h-4 w-4" />
            {commentCount} comment{commentCount === 1 ? '' : 's'}
          </span>
        </div>

        <div className="mt-8 border-t border-[#2C4870]/10 pt-8">
          <h2 className="font-body mb-4 text-sm font-bold text-[#2C4870]">Comments</h2>
          {loadingComments && <p className="font-body text-xs text-[#4B5A73]">Loading comments...</p>}
          <div className="space-y-3">
            {comments?.map((c) => (
              <div key={c._id} className="flex items-start gap-2.5">
                <Avatar name={c.author.name} size={7} />
                <div className="rounded-2xl bg-[#2C4870]/5 px-3.5 py-2">
                  <p className="font-body text-xs font-bold text-[#2C4870]">{c.author.name}</p>
                  <p className="font-body text-sm text-[#4B5A73]">{c.body}</p>
                </div>
              </div>
            ))}
            {comments?.length === 0 && (
              <p className="font-body text-sm text-[#4B5A73]">
                No comments yet — be the first to say something.
              </p>
            )}
          </div>

          {user ? (
            <div className="mt-4 flex items-center gap-2">
              <input
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Write a comment..."
                className="font-body w-full rounded-full border border-[#2C4870]/15 bg-white px-4 py-2 text-sm text-[#2C4870] placeholder:text-[#4B5A73]/60 focus:border-[#2C4870]/40 focus:outline-none"
              />
              <button
                onClick={handleAddComment}
                className="font-body shrink-0 rounded-full bg-[#2C4870] px-4 py-2 text-sm font-semibold text-[#FFFDF9] transition-transform hover:-translate-y-0.5"
              >
                Post
              </button>
            </div>
          ) : (
            <p className="font-body mt-4 text-sm text-[#4B5A73]">
              <Link to="/login" className="font-semibold text-[#2C4870] underline">
                Log in
              </Link>{' '}
              to join the conversation.
            </p>
          )}
        </div>
      </article>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listBlogPostsRequest } from '../api/blogPosts.api'
import { Avatar } from '../components/Avatar'
import { BookIcon } from '../components/icons'
import type { BlogPostSummary } from '../types/models'

const PAGE_SIZE = 10

export function BlogListPage() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    listBlogPostsRequest({ page, limit: PAGE_SIZE })
      .then((result) => {
        setPosts(result.posts)
        setTotalPages(result.totalPages)
      })
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-slate-900">Blog</h1>

      {loading && <p className="text-sm text-slate-400">Loading posts...</p>}
      {!loading && posts.length === 0 && (
        <p className="text-sm text-slate-400">No posts published yet — check back soon.</p>
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post._id}
            to={`/blog/${post._id}`}
            className="flex flex-col gap-4 overflow-hidden rounded-xl border border-slate-200 shadow-sm transition-shadow hover:shadow-md sm:flex-row"
          >
            {post.thumbnailUrl ? (
              <img
                src={post.thumbnailUrl}
                alt=""
                className="h-40 w-full shrink-0 object-cover sm:h-auto sm:w-48"
              />
            ) : (
              <div className="flex h-40 w-full shrink-0 items-center justify-center bg-slate-100 sm:h-auto sm:w-48">
                <BookIcon className="h-8 w-8 text-slate-300" />
              </div>
            )}
            <div className="min-w-0 flex-1 p-5 sm:pl-0">
              <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                <Avatar name={post.author.name} size={7} />
                <span>{post.author.name}</span>
                <span>&middot;</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <h2 className="mb-1.5 text-xl font-semibold text-slate-900">{post.title}</h2>
              <p className="text-sm text-slate-600">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded border border-slate-300 px-3 py-1.5 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded border border-slate-300 px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listBlogPostsRequest } from '../../api/blogPosts.api'
import { BookIcon } from '../icons'
import type { BlogPostSummary } from '../../types/models'

export function BlogPreview() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([])

  useEffect(() => {
    listBlogPostsRequest({ limit: 3 })
      .then((result) => setPosts(result.posts))
      .catch(() => setPosts([]))
  }, [])

  if (posts.length === 0) return null

  return (
    <section className="mx-auto max-w-5xl px-4 py-20">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">From our journal</h2>
          <p className="mt-2 text-slate-600">
            Reflections, resources, and updates from the Haven Circle team.
          </p>
        </div>
        <Link to="/blog" className="hidden text-sm font-medium text-slate-900 underline sm:block">
          View all posts
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post._id}
            to={`/blog/${post._id}`}
            className="overflow-hidden rounded-xl border border-slate-200 transition-shadow hover:shadow-md"
          >
            {post.thumbnailUrl ? (
              <img src={post.thumbnailUrl} alt="" className="h-40 w-full object-cover" />
            ) : (
              <div className="flex h-40 w-full items-center justify-center bg-slate-100">
                <BookIcon className="h-8 w-8 text-slate-300" />
              </div>
            )}
            <div className="p-5">
              <p className="mb-2 text-xs text-slate-400">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
              <h3 className="mb-1.5 font-semibold text-slate-900">{post.title}</h3>
              <p className="text-sm text-slate-600">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
      <Link
        to="/blog"
        className="mt-6 block text-center text-sm font-medium text-slate-900 underline sm:hidden"
      >
        View all posts
      </Link>
    </section>
  )
}

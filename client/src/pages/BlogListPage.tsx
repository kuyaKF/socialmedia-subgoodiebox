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

  const featured = page === 1 ? posts[0] : undefined
  const rest = featured ? posts.slice(1) : posts

  return (
    <div className="bg-[#FFFDF9]">
      <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:py-20">
        <h1 className="font-body text-3xl font-extrabold tracking-tight text-[#2C4870] sm:text-4xl">
          Blog
        </h1>
        <p className="font-body mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-[#4B5A73]">
          Updates, reflections, and resources from the Haven Circle team.
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-20">
        {loading && <p className="font-body text-sm text-[#4B5A73]">Loading posts...</p>}
        {!loading && posts.length === 0 && (
          <p className="font-body text-sm text-[#4B5A73]">No posts published yet — check back soon.</p>
        )}

        {featured && (
          <Link
            to={`/blog/${featured._id}`}
            className="stationery-card mb-8 flex flex-col overflow-hidden rounded-[1.75rem] transition-transform hover:-translate-y-1 sm:flex-row"
          >
            {featured.thumbnailUrl ? (
              <img
                src={featured.thumbnailUrl}
                alt=""
                className="h-56 w-full shrink-0 object-cover sm:h-auto sm:w-1/2"
              />
            ) : (
              <div className="flex h-56 w-full shrink-0 items-center justify-center bg-[#8FAE86]/15 sm:h-auto sm:w-1/2">
                <BookIcon className="h-10 w-10 text-[#2C4870]/40" />
              </div>
            )}
            <div className="flex flex-1 flex-col justify-center p-7 sm:p-9">
              <div className="mb-3 flex items-center gap-2 text-xs text-[#4B5A73]">
                <Avatar name={featured.author.name} size={7} />
                <span>{featured.author.name}</span>
                <span>&middot;</span>
                <span>{new Date(featured.createdAt).toLocaleDateString()}</span>
              </div>
              <h2 className="font-body mb-2 text-2xl font-bold text-[#2C4870]">{featured.title}</h2>
              {featured.excerpt && (
                <p className="font-body text-sm leading-relaxed text-[#4B5A73]">{featured.excerpt}</p>
              )}
            </div>
          </Link>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          {rest.map((post) => (
            <Link
              key={post._id}
              to={`/blog/${post._id}`}
              className="stationery-card flex flex-col overflow-hidden rounded-2xl transition-transform hover:-translate-y-1"
            >
              {post.thumbnailUrl ? (
                <img src={post.thumbnailUrl} alt="" className="h-40 w-full object-cover" />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-[#7FB3CC]/15">
                  <BookIcon className="h-8 w-8 text-[#2C4870]/40" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-center gap-2 text-xs text-[#4B5A73]">
                  <Avatar name={post.author.name} size={6} />
                  <span>{post.author.name}</span>
                  <span>&middot;</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <h2 className="font-body mb-1.5 text-lg font-bold text-[#2C4870]">{post.title}</h2>
                {post.excerpt && <p className="font-body text-sm text-[#4B5A73]">{post.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3 text-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="font-body rounded-full border border-[#2C4870]/20 px-4 py-1.5 font-medium text-[#2C4870] transition-colors hover:bg-[#2C4870]/5 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="font-body text-[#4B5A73]">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="font-body rounded-full border border-[#2C4870]/20 px-4 py-1.5 font-medium text-[#2C4870] transition-colors hover:bg-[#2C4870]/5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

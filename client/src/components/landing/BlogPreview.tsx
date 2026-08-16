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
    <section className="bg-wash-blue px-4 py-20">
      <div className="mx-auto mb-10 flex max-w-5xl flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-body text-3xl font-extrabold tracking-tight text-[#2C4870] sm:text-4xl">
            From our journal
          </h2>
          <p className="font-body mt-2 text-[15px] text-[#4B5A73]">
            Reflections, resources, and updates from the Haven Circle team.
          </p>
        </div>
        <Link to="/blog" className="font-body hidden text-sm font-semibold text-[#2C4870] underline sm:block">
          View all posts
        </Link>
      </div>
      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post._id}
            to={`/blog/${post._id}`}
            className="stationery-card block overflow-hidden rounded-2xl transition-transform hover:-translate-y-1"
          >
            {post.thumbnailUrl ? (
              <img src={post.thumbnailUrl} alt="" className="h-40 w-full object-cover" />
            ) : (
              <div className="flex h-40 w-full items-center justify-center bg-[#7FB3CC]/15">
                <BookIcon className="h-8 w-8 text-[#4B5A73]" />
              </div>
            )}
            <div className="p-5">
              <p className="font-body mb-2 text-xs text-[#4B5A73]">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
              <h3 className="font-body mb-1.5 font-bold text-[#2C4870]">{post.title}</h3>
              <p className="font-body text-sm text-[#4B5A73]">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
      <Link
        to="/blog"
        className="font-body mt-8 block text-center text-sm font-semibold text-[#2C4870] underline sm:hidden"
      >
        View all posts
      </Link>
    </section>
  )
}

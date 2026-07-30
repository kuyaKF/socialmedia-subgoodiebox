import { apiClient } from './client'
import type { BlogPostSummary, PaginatedBlogPosts } from '../types/models'

export async function listBlogPostsRequest(params?: { page?: number; limit?: number }) {
  const { data } = await apiClient.get<PaginatedBlogPosts>('/blog-posts', { params })
  return data
}

export async function getBlogPostRequest(id: string) {
  const { data } = await apiClient.get<{ post: BlogPostSummary }>(`/blog-posts/${id}`)
  return data.post
}

export async function createBlogPostRequest(title: string, body: string) {
  await apiClient.post('/blog-posts', { title, body })
}

export async function deleteBlogPostRequest(id: string) {
  await apiClient.delete(`/blog-posts/${id}`)
}

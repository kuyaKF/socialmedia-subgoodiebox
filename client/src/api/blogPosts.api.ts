import { apiClient } from './client'
import type { BlogBlock, BlogPostSummary, PaginatedBlogPosts } from '../types/models'

export async function listBlogPostsRequest(params?: { page?: number; limit?: number }) {
  const { data } = await apiClient.get<PaginatedBlogPosts>('/blog-posts', { params })
  return data
}

export async function getBlogPostRequest(id: string) {
  const { data } = await apiClient.get<{ post: BlogPostSummary }>(`/blog-posts/${id}`)
  return data.post
}

export async function createBlogPostRequest(title: string, blocks: BlogBlock[], thumbnailUrl?: string) {
  const { data } = await apiClient.post<{ post: BlogPostSummary }>('/blog-posts', {
    title,
    blocks,
    thumbnailUrl,
  })
  return data.post
}

export async function updateBlogPostRequest(
  id: string,
  title: string,
  blocks: BlogBlock[],
  thumbnailUrl?: string
) {
  const { data } = await apiClient.patch<{ post: BlogPostSummary }>(`/blog-posts/${id}`, {
    title,
    blocks,
    thumbnailUrl,
  })
  return data.post
}

export async function uploadBlogImageRequest(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('image', file)
  const { data } = await apiClient.post<{ url: string }>('/blog-posts/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.url
}

export async function deleteBlogPostRequest(id: string) {
  await apiClient.delete(`/blog-posts/${id}`)
}

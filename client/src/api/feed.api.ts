import { apiClient } from './client'
import type { FeedResponse } from '../types/models'

export async function getFeedRequest(params?: { before?: string; limit?: number }) {
  const { data } = await apiClient.get<FeedResponse>('/feed', { params })
  return data
}

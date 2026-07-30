import { apiClient } from './client'
import type { FeedResponse, GroupPostVisibility } from '../types/models'

export async function createGroupPostRequest(
  groupId: string,
  body: string,
  visibility?: GroupPostVisibility
) {
  await apiClient.post('/group-posts', { groupId, body, visibility })
}

export async function deleteGroupPostRequest(id: string) {
  await apiClient.delete(`/group-posts/${id}`)
}

export async function getMyGroupFeedRequest(params?: { before?: string; limit?: number }) {
  const { data } = await apiClient.get<FeedResponse>('/group-posts', { params })
  return data
}

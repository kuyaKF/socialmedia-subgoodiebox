import { apiClient } from './client'
import type { FeedComment, FeedTargetType } from '../types/models'

export async function toggleLikeRequest(targetType: FeedTargetType, targetId: string) {
  const { data } = await apiClient.post<{ liked: boolean; likeCount: number }>(
    '/engagement/likes/toggle',
    { targetType, targetId }
  )
  return data
}

export async function listCommentsRequest(targetType: FeedTargetType, targetId: string) {
  const { data } = await apiClient.get<{ comments: FeedComment[] }>('/engagement/comments', {
    params: { targetType, targetId },
  })
  return data.comments
}

export async function createCommentRequest(
  targetType: FeedTargetType,
  targetId: string,
  body: string
) {
  const { data } = await apiClient.post<{ comment: FeedComment }>('/engagement/comments', {
    targetType,
    targetId,
    body,
  })
  return data.comment
}

export async function deleteCommentRequest(commentId: string) {
  await apiClient.delete(`/engagement/comments/${commentId}`)
}

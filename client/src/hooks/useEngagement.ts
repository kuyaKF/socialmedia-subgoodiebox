import { useEffect, useState } from 'react'
import {
  createCommentRequest,
  deleteCommentRequest,
  listCommentsRequest,
  toggleLikeRequest,
} from '../api/engagement.api'
import type { FeedComment, FeedTargetType } from '../types/models'

export function useEngagement(
  targetType: FeedTargetType,
  targetId: string,
  initial: { likeCount: number; commentCount: number; likedByMe: boolean }
) {
  const [liked, setLiked] = useState(initial.likedByMe)
  const [likeCount, setLikeCount] = useState(initial.likeCount)
  const [commentCount, setCommentCount] = useState(initial.commentCount)
  const [comments, setComments] = useState<FeedComment[] | null>(null)
  const [loadingComments, setLoadingComments] = useState(false)

  // `initial` often arrives after an async fetch (e.g. the blog post itself loads before this
  // hook's caller re-renders with real counts) — useState only reads it on mount, so resync
  // whenever the actual values change rather than trusting the first render's snapshot.
  useEffect(() => {
    setLiked(initial.likedByMe)
    setLikeCount(initial.likeCount)
    setCommentCount(initial.commentCount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.likedByMe, initial.likeCount, initial.commentCount])

  async function toggleLike() {
    const result = await toggleLikeRequest(targetType, targetId)
    setLiked(result.liked)
    setLikeCount(result.likeCount)
  }

  async function loadComments() {
    if (comments !== null) return
    setLoadingComments(true)
    try {
      const list = await listCommentsRequest(targetType, targetId)
      setComments(list)
    } finally {
      setLoadingComments(false)
    }
  }

  async function addComment(body: string) {
    if (!body.trim()) return
    const comment = await createCommentRequest(targetType, targetId, body.trim())
    setComments((prev) => [...(prev ?? []), comment])
    setCommentCount((c) => c + 1)
    return comment
  }

  async function deleteComment(commentId: string) {
    await deleteCommentRequest(commentId)
    setComments((prev) => (prev ?? []).filter((c) => c._id !== commentId))
    setCommentCount((c) => Math.max(0, c - 1))
  }

  return {
    liked,
    likeCount,
    commentCount,
    comments,
    loadingComments,
    toggleLike,
    loadComments,
    addComment,
    deleteComment,
  }
}

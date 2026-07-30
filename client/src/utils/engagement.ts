import type { FeedItem, GroupRef, User } from '../types/models'

// Free subscribers can read everything but only paid subscribers (and staff) can like/comment —
// except blog posts (open to everyone) and their own circle's posts, where members can always
// interact regardless of plan. Mirrors the server-side check in engagement.controller.ts.
export function canEngageWithItem(user: User, item: FeedItem): boolean {
  if (user.role !== 'user') return true
  if (item.type === 'blog_post') return true

  if (item.type === 'group_post') {
    const myGroup = typeof user.group === 'object' ? (user.group as GroupRef | null) : null
    if (myGroup && item.group?._id === myGroup._id) return true
  }

  return user.subscription.plan !== 'free'
}

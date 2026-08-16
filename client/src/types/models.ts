export type UserRole = 'user' | 'internal' | 'admin'
export type SubscriptionPlan = 'free' | 'starter' | 'plus' | 'premium'
export type PaidSubscriptionPlan = Exclude<SubscriptionPlan, 'free'>
export type SubscriptionStatus = 'active' | 'inactive'

export interface Subscription {
  plan: SubscriptionPlan
  status: SubscriptionStatus
  currentPeriodEnd: string | null
}

export interface GroupRef {
  _id: string
  name: string
  leader?: string | null
  members: string[]
}

export interface User {
  id: string
  // Absent when viewing another user's profile as a non-admin — only the profile
  // owner and admins ever receive this field from the server.
  email?: string
  name: string
  bio?: string
  avatarUrl?: string
  slug?: string
  role: UserRole
  group: GroupRef | string | null
  subscription: Subscription
  emailVerified: boolean
  createdAt: string
}

export type UserSortField = 'name' | 'email' | 'createdAt' | 'role' | 'plan'
export type SortOrder = 'asc' | 'desc'

export interface UserFilters {
  search?: string
  plan?: SubscriptionPlan
  group?: string // groupId, or 'unassigned'
  registeredFrom?: string // yyyy-mm-dd
  registeredTo?: string // yyyy-mm-dd
  page?: number
  limit?: number
  sortBy?: UserSortField
  sortOrder?: SortOrder
}

export interface PaginatedUsers {
  users: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface GroupMember {
  _id: string
  name: string
  // Absent on the member-facing "my circle" view — only included for admins.
  email?: string
  role: UserRole
  avatarUrl?: string
}

export interface Group {
  _id: string
  name: string
  leader: GroupMember | null
  members: GroupMember[]
}

export interface GroupFilters {
  search?: string
  page?: number
  limit?: number
}

export interface PaginatedGroups {
  groups: Group[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type FeedTargetType = 'announcement' | 'group_post' | 'blog_post'

export interface FeedAuthor {
  _id: string
  name: string
  role: UserRole
  avatarUrl?: string
}

export type GroupPostVisibility = 'private' | 'public'

export interface FeedItem {
  _id: string
  type: FeedTargetType
  body: string
  title?: string
  author: FeedAuthor
  group?: { _id: string; name: string }
  visibility?: GroupPostVisibility
  createdAt: string
  likeCount: number
  commentCount: number
  likedByMe: boolean
}

export interface FeedResponse {
  items: FeedItem[]
  nextCursor: string | null
}

export interface FeedComment {
  _id: string
  author: FeedAuthor
  body: string
  createdAt: string
}

export type BlogBlockType = 'heading' | 'paragraph' | 'image'

export interface BlogBlock {
  type: BlogBlockType
  text?: string
  url?: string
  caption?: string
}

export interface BlogPostSummary {
  _id: string
  title: string
  thumbnailUrl?: string
  blocks: BlogBlock[]
  excerpt?: string
  author: FeedAuthor
  createdAt: string
  likeCount?: number
  commentCount?: number
  likedByMe?: boolean
}

export interface PaginatedBlogPosts {
  posts: BlogPostSummary[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AdminStats {
  totalUsers: number
  totalGroups: number
  freeUsers: number
  paidUsers: number
  currentMonthRevenue: number
  totalRevenue: number
  planDistribution: { plan: SubscriptionPlan; count: number }[]
  revenueByMonth: { month: string; revenue: number }[]
  paymentsByPlanPerMonth: { month: string; starter: number; plus: number; premium: number }[]
  signupsByMonth: { month: string; count: number }[]
  newSubscriptionsByMonth: { month: string; count: number }[]
  renewalsByMonth: { month: string; count: number }[]
  revenueByDay: { day: string; revenue: number }[]
  signupsByDay: { day: string; count: number }[]
  totalGoodieBoxOrders: number
  totalGoodieBoxRevenue: number
  currentMonthGoodieBoxRevenue: number
  goodieBoxRevenueByMonth: { month: string; revenue: number }[]
  goodieBoxOrdersByMonth: { month: string; count: number }[]
  goodieBoxOrdersByDeliveryStatus: { status: GoodieBoxDeliveryStatus; count: number }[]
}

export type GoodieBoxPaymentStatus = 'pending' | 'paid' | 'failed' | 'expired'
export type GoodieBoxDeliveryStatus = 'pending_delivery' | 'in_progress' | 'complete'

export interface GoodieBoxOrder {
  _id: string
  user: string | { _id: string; name: string; email: string }
  fullName: string
  phone: string
  address: string
  deliveryNotes?: string
  amount: number
  currency: string
  paymentStatus: GoodieBoxPaymentStatus
  deliveryStatus: GoodieBoxDeliveryStatus
  createdAt: string
}

export interface PaginatedGoodieBoxOrders {
  orders: GoodieBoxOrder[]
  total: number
  page: number
  limit: number
  totalPages: number
}

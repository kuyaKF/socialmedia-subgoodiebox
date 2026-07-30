import { apiClient } from './client'
import type { Subscription } from '../types/models'

export async function getMySubscriptionRequest() {
  const { data } = await apiClient.get<{ subscription: Subscription }>('/subscription/me')
  return data.subscription
}

export async function cancelMySubscriptionRequest() {
  const { data } = await apiClient.post<{ subscription: Subscription }>('/subscription/cancel')
  return data.subscription
}

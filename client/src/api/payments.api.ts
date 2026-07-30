import { apiClient } from './client'
import type { PaidSubscriptionPlan } from '../types/models'

export async function createCheckoutRequest(plan: PaidSubscriptionPlan) {
  const { data } = await apiClient.post<{ checkoutUrl: string }>('/payments/create-checkout', {
    plan,
  })
  return data.checkoutUrl
}

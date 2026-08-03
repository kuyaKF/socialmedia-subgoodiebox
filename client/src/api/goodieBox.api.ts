import { apiClient } from './client'
import type { GoodieBoxOrder } from '../types/models'

export async function createGoodieBoxCheckoutRequest(input: {
  fullName: string
  phone: string
  address: string
  deliveryNotes?: string
}) {
  const { data } = await apiClient.post<{ checkoutUrl: string }>(
    '/goodie-box/create-checkout',
    input
  )
  return data.checkoutUrl
}

export async function listMyGoodieBoxOrdersRequest() {
  const { data } = await apiClient.get<{ orders: GoodieBoxOrder[] }>('/goodie-box/my-orders')
  return data.orders
}

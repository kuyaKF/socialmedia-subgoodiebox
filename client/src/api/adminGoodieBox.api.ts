import { apiClient } from './client'
import type { GoodieBoxDeliveryStatus, GoodieBoxOrder, PaginatedGoodieBoxOrders } from '../types/models'

export async function listGoodieBoxOrdersRequest(
  deliveryStatus: GoodieBoxDeliveryStatus,
  page: number,
  limit: number
) {
  const { data } = await apiClient.get<PaginatedGoodieBoxOrders>('/admin/goodie-box-orders', {
    params: { deliveryStatus, page, limit },
  })
  return data
}

export async function advanceGoodieBoxOrderRequest(orderId: string) {
  const { data } = await apiClient.post<{ order: GoodieBoxOrder }>(
    `/admin/goodie-box-orders/${orderId}/advance`
  )
  return data.order
}

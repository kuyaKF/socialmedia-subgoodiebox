import { apiClient } from './client'
import type { AdminStats } from '../types/models'

export async function getAdminStatsRequest() {
  const { data } = await apiClient.get<AdminStats>('/admin/stats')
  return data
}

import { apiClient } from './client'

export async function createAnnouncementRequest(body: string) {
  await apiClient.post('/announcements', { body })
}

export async function deleteAnnouncementRequest(id: string) {
  await apiClient.delete(`/announcements/${id}`)
}

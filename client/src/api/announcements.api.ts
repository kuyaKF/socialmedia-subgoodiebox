import { apiClient } from './client'

export async function createAnnouncementRequest(body: string) {
  await apiClient.post('/announcements', { body })
}

export async function updateAnnouncementRequest(id: string, body: string) {
  const { data } = await apiClient.patch<{ announcement: { body: string } }>(
    `/announcements/${id}`,
    { body }
  )
  return data.announcement
}

export async function deleteAnnouncementRequest(id: string) {
  await apiClient.delete(`/announcements/${id}`)
}

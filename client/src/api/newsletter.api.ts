import { apiClient } from './client'

export async function subscribeToNewsletterRequest(email: string) {
  const { data } = await apiClient.post<{ message: string }>('/newsletter/subscribe', { email })
  return data.message
}

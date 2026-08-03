import { apiClient } from './client'
import type { PaginatedUsers, User, UserFilters, UserRole } from '../types/models'

export async function listUsersRequest(filters?: UserFilters) {
  const { data } = await apiClient.get<PaginatedUsers>('/users', {
    params: filters,
  })
  return data
}

export async function getUserRequest(id: string) {
  const { data } = await apiClient.get<{ user: User }>(`/users/${id}`)
  return data.user
}

export async function updateMeRequest(input: {
  name?: string
  bio?: string
  avatarUrl?: string
  slug?: string
}) {
  const { data } = await apiClient.patch<{ user: User }>('/users/me', input)
  return data.user
}

export async function uploadAvatarRequest(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('image', file)
  const { data } = await apiClient.post<{ url: string }>('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.url
}

export async function updateUserRoleRequest(id: string, role: UserRole) {
  const { data } = await apiClient.patch<{ user: User }>(`/users/${id}/role`, { role })
  return data.user
}

export async function createStaffUserRequest(input: {
  name: string
  email: string
  password: string
  role: 'internal' | 'admin'
}) {
  const { data } = await apiClient.post<{ user: User }>('/users/staff', input)
  return data.user
}

export async function changeMyPasswordRequest(input: { currentPassword: string; newPassword: string }) {
  await apiClient.patch('/users/me/password', input)
}

import { apiClient } from './client'
import type { Group, GroupFilters, PaginatedGroups } from '../types/models'

export async function listGroupsRequest(filters?: GroupFilters) {
  const { data } = await apiClient.get<PaginatedGroups>('/groups', { params: filters })
  return data
}

export async function getMyGroupRequest() {
  const { data } = await apiClient.get<{ group: Group }>('/groups/mine')
  return data.group
}

export async function getGroupRequest(id: string) {
  const { data } = await apiClient.get<{ group: Group }>(`/groups/${id}`)
  return data.group
}

export async function createGroupRequest(input: { name: string; leaderId?: string }) {
  const { data } = await apiClient.post<{ group: Group }>('/groups', input)
  return data.group
}

export async function updateGroupRequest(groupId: string, name: string) {
  const { data } = await apiClient.patch<{ group: Group }>(`/groups/${groupId}`, { name })
  return data.group
}

export async function setLeaderRequest(groupId: string, userId: string | null) {
  const { data } = await apiClient.patch<{ group: Group }>(`/groups/${groupId}/leader`, { userId })
  return data.group
}

export async function addMemberRequest(groupId: string, userId: string) {
  const { data } = await apiClient.post<{ group: Group }>(`/groups/${groupId}/members`, { userId })
  return data.group
}

export async function removeMemberRequest(groupId: string, userId: string) {
  const { data } = await apiClient.delete<{ group: Group }>(`/groups/${groupId}/members/${userId}`)
  return data.group
}

export async function deleteGroupRequest(groupId: string) {
  await apiClient.delete(`/groups/${groupId}`)
}

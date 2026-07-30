import { apiClient } from './client'
import type { User } from '../types/models'

export async function registerRequest(input: { email: string; password: string; name: string }) {
  const { data } = await apiClient.post<{ user: User }>('/auth/register', input)
  return data.user
}

export async function loginRequest(input: { email: string; password: string }) {
  const { data } = await apiClient.post<{ user: User }>('/auth/login', input)
  return data.user
}

export async function logoutRequest() {
  await apiClient.post('/auth/logout')
}

export async function meRequest() {
  const { data } = await apiClient.get<{ user: User }>('/auth/me')
  return data.user
}

export async function verifyEmailRequest(token: string) {
  const { data } = await apiClient.post<{ user: User }>('/auth/verify-email', { token })
  return data.user
}

export async function resendVerificationRequest() {
  await apiClient.post('/auth/resend-verification')
}

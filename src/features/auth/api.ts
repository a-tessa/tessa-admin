import type { LoginCredentials, LoginResponse, MeResponse } from '@/features/auth/types'
import { apiRequest } from '@/shared/lib/api'

export function login(credentials: LoginCredentials) {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export function getCurrentUser(accessToken: string) {
  return apiRequest<MeResponse>('/api/auth/me', {}, accessToken)
}

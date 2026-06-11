import type { LoginCredentials, LoginResponse, MeResponse } from '@/features/auth/types'
import type { UpdateProfileInput } from '@/features/profile/types'
import { apiRequest, authenticatedRequest } from '@/shared/lib/api'

export function login(credentials: LoginCredentials) {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export function getCurrentUser(accessToken: string) {
  return apiRequest<MeResponse>('/api/auth/me', {}, accessToken)
}

export function updateProfile(input: UpdateProfileInput) {
  const hasAvatar = input.avatar instanceof File
  const hasRemoveAvatar = input.removeAvatar === true

  if (hasAvatar || hasRemoveAvatar) {
    const formData = new FormData()
    formData.append('name', input.name)
    formData.append('email', input.email)

    if (hasAvatar) {
      formData.append('avatar', input.avatar ?? '')
    }

    if (hasRemoveAvatar) {
      formData.append('removeAvatar', 'true')
    }

    return authenticatedRequest<MeResponse>('/api/auth/me', {
      method: 'PATCH',
      body: formData,
    })
  }

  return authenticatedRequest<MeResponse>('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify({
      name: input.name,
      email: input.email,
    }),
  })
}

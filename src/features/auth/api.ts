import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginCredentials,
  LoginResponse,
  MeResponse,
  MessageResponse,
  ResetPasswordInput,
} from '@/features/auth/types'
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

export function forgotPassword(input: ForgotPasswordInput) {
  return apiRequest<MessageResponse>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function resetPassword(input: ResetPasswordInput) {
  return apiRequest<MessageResponse>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function changePassword(input: ChangePasswordInput) {
  return authenticatedRequest<MessageResponse>('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

function appendProfileFields(formData: FormData, input: UpdateProfileInput) {
  formData.append('name', input.name)
  formData.append('email', input.email)
  formData.append('cpf', input.cpf)
  formData.append('phone', input.phone)
}

export function updateProfile(input: UpdateProfileInput) {
  const hasAvatar = input.avatar instanceof File
  const hasRemoveAvatar = input.removeAvatar === true

  if (hasAvatar || hasRemoveAvatar) {
    const formData = new FormData()
    appendProfileFields(formData, input)

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
      cpf: input.cpf,
      phone: input.phone,
    }),
  })
}

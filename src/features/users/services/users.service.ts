import { authenticatedRequest } from '@/shared/lib/api'
import type {
  CreateUserInput,
  CreateUserResponse,
  FetchUsersResponse,
  PaginationParams,
  UpdateUserInput,
  UpdateUserResponse,
  UpdateUserStatusResponse,
} from '../types'

export async function fetchUsers(
  params: PaginationParams,
): Promise<FetchUsersResponse> {
  const search = new URLSearchParams({
    page: String(params.page),
    perPage: String(params.perPage),
  })

  return authenticatedRequest<FetchUsersResponse>(
    `/api/users?${search.toString()}`,
  )
}

export async function createUser(
  input: CreateUserInput,
): Promise<CreateUserResponse> {
  return authenticatedRequest<CreateUserResponse>(
    '/api/users',
    { method: 'POST', body: JSON.stringify(input) },
  )
}

export async function updateUserStatus(
  id: string,
  isActive: boolean,
): Promise<UpdateUserStatusResponse> {
  return authenticatedRequest<UpdateUserStatusResponse>(
    `/api/users/${id}/status`,
    { method: 'PATCH', body: JSON.stringify({ isActive }) },
  )
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
): Promise<UpdateUserResponse> {
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

    return authenticatedRequest<UpdateUserResponse>(`/api/users/${id}`, {
      method: 'PATCH',
      body: formData,
    })
  }

  return authenticatedRequest<UpdateUserResponse>(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name: input.name,
      email: input.email,
    }),
  })
}

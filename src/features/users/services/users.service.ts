import { apiRequest } from '@/shared/lib/api'
import type {
  CreateUserInput,
  CreateUserResponse,
  FetchUsersResponse,
  PaginationParams,
  UpdateUserStatusResponse,
} from '../types'

export async function fetchUsers(
  params: PaginationParams,
  accessToken: string,
): Promise<FetchUsersResponse> {
  const search = new URLSearchParams({
    page: String(params.page),
    perPage: String(params.perPage),
  })

  return apiRequest<FetchUsersResponse>(
    `/api/users?${search.toString()}`,
    {},
    accessToken,
  )
}

export async function createUser(
  input: CreateUserInput,
  accessToken: string,
): Promise<CreateUserResponse> {
  return apiRequest<CreateUserResponse>(
    '/api/users',
    { method: 'POST', body: JSON.stringify(input) },
    accessToken,
  )
}

export async function updateUserStatus(
  id: string,
  isActive: boolean,
  accessToken: string,
): Promise<UpdateUserStatusResponse> {
  return apiRequest<UpdateUserStatusResponse>(
    `/api/users/${id}/status`,
    { method: 'PATCH', body: JSON.stringify({ isActive }) },
    accessToken,
  )
}

import { authenticatedRequest } from '@/shared/lib/api'
import type {
  CreateUserInput,
  CreateUserResponse,
  FetchUsersResponse,
  PaginationParams,
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

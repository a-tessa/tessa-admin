import { queryOptions } from '@tanstack/react-query'
import { fetchUsers } from './services/users.service'
import type { PaginationParams } from './types'

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...userKeys.lists(), params] as const,
}

export function usersListQuery(params: PaginationParams) {
  return queryOptions({
    queryKey: userKeys.list(params),
    queryFn: () => fetchUsers(params),
  })
}

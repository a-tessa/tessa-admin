import { useQuery } from '@tanstack/react-query'
import { usersListQuery } from '../users.queries'

export function useUsers(page: number, perPage: number) {
  return useQuery(usersListQuery({ page, perPage }))
}

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/use-auth'
import { fetchUsers } from '../services/users.service'

export function useUsers(page: number, perPage: number) {
  const { session } = useAuth()
  const accessToken = session?.accessToken ?? ''

  return useQuery({
    queryKey: ['users', { page, perPage }],
    queryFn: () => fetchUsers({ page, perPage }, accessToken),
    enabled: session !== null,
  })
}

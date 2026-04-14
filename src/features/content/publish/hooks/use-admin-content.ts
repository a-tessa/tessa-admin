import { useQuery } from '@tanstack/react-query'
import { adminContentQuery } from '../publish.queries'

export function useAdminContent() {
  return useQuery(adminContentQuery())
}

import { queryOptions } from '@tanstack/react-query'
import { fetchAdminContent } from './publish.service'

export const adminContentKeys = {
  all: ['admin-content'] as const,
  detail: () => [...adminContentKeys.all, 'detail'] as const,
}

export function adminContentQuery() {
  return queryOptions({
    queryKey: adminContentKeys.detail(),
    queryFn: fetchAdminContent,
  })
}

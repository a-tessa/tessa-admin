import { queryOptions } from '@tanstack/react-query'
import { fetchAdminContent, fetchPublicationStatus } from './publish.service'

export const adminContentKeys = {
  all: ['admin-content'] as const,
  detail: () => [...adminContentKeys.all, 'detail'] as const,
}

export const publicationStatusKeys = {
  all: ['publication-status'] as const,
  detail: () => [...publicationStatusKeys.all, 'detail'] as const,
}

export function adminContentQuery() {
  return queryOptions({
    queryKey: adminContentKeys.detail(),
    queryFn: fetchAdminContent,
  })
}

export function publicationStatusQuery() {
  return queryOptions({
    queryKey: publicationStatusKeys.detail(),
    queryFn: fetchPublicationStatus,
  })
}

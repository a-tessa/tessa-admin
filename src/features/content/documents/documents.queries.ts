import { queryOptions } from '@tanstack/react-query'
import { fetchAdminDocuments } from './documents.service'

export const documentKeys = {
  all: ['content', 'documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: () => [...documentKeys.lists()] as const,
}

export function adminDocumentsListQuery() {
  return queryOptions({
    queryKey: documentKeys.list(),
    queryFn: fetchAdminDocuments,
  })
}

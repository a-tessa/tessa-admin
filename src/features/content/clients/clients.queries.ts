import { queryOptions } from '@tanstack/react-query'
import { fetchClient, fetchClients } from './clients.service'

export const clientKeys = {
  all: ['content', 'clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: () => [...clientKeys.lists()] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
}

export function clientsListQuery() {
  return queryOptions({
    queryKey: clientKeys.list(),
    queryFn: fetchClients,
  })
}

export function clientDetailQuery(id: string) {
  return queryOptions({
    queryKey: clientKeys.detail(id),
    queryFn: () => fetchClient(id),
    enabled: id !== '',
  })
}

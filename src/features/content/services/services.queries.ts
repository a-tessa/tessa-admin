import { queryOptions } from '@tanstack/react-query'
import { fetchService, fetchServices } from './services.service'

export const serviceKeys = {
  all: ['content', 'services'] as const,
  lists: () => [...serviceKeys.all, 'list'] as const,
  list: () => [...serviceKeys.lists()] as const,
  details: () => [...serviceKeys.all, 'detail'] as const,
  detail: (slug: string) => [...serviceKeys.details(), slug] as const,
}

export function servicesListQuery() {
  return queryOptions({
    queryKey: serviceKeys.list(),
    queryFn: fetchServices,
  })
}

export function serviceDetailQuery(slug: string) {
  return queryOptions({
    queryKey: serviceKeys.detail(slug),
    queryFn: () => fetchService(slug),
    enabled: slug !== '',
  })
}

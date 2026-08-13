import { queryOptions } from '@tanstack/react-query'
import { fetchResultsSection } from './results.service'

export const resultsKeys = {
  all: ['content', 'results'] as const,
  detail: () => [...resultsKeys.all, 'detail'] as const,
}

export function resultsSectionQuery() {
  return queryOptions({
    queryKey: resultsKeys.detail(),
    queryFn: fetchResultsSection,
  })
}

import { queryOptions } from '@tanstack/react-query'
import { fetchOperationSection } from './operations.service'

export const operationKeys = {
  all: ['content', 'operations'] as const,
  detail: () => [...operationKeys.all, 'detail'] as const,
}

export function operationSectionQuery() {
  return queryOptions({
    queryKey: operationKeys.detail(),
    queryFn: fetchOperationSection,
  })
}

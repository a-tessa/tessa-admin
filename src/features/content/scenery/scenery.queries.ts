import { queryOptions } from '@tanstack/react-query'
import { fetchScenerySection } from './scenery.service'

export const sceneryKeys = {
  all: ['content', 'scenery'] as const,
  section: () => [...sceneryKeys.all, 'section'] as const,
}

export function scenerySectionQuery() {
  return queryOptions({
    queryKey: sceneryKeys.section(),
    queryFn: fetchScenerySection,
  })
}

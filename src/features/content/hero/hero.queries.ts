import { queryOptions } from '@tanstack/react-query'
import { fetchHeroSection } from './hero.service'

export const heroKeys = {
  all: ['content', 'hero'] as const,
  detail: () => [...heroKeys.all, 'detail'] as const,
}

export function heroSectionQuery() {
  return queryOptions({
    queryKey: heroKeys.detail(),
    queryFn: fetchHeroSection,
  })
}

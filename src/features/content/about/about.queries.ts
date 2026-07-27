import { queryOptions } from '@tanstack/react-query'
import { fetchAboutSection } from './about.service'

export const aboutKeys = {
  all: ['content', 'about'] as const,
  detail: () => [...aboutKeys.all, 'detail'] as const,
}

export function aboutSectionQuery() {
  return queryOptions({
    queryKey: aboutKeys.detail(),
    queryFn: fetchAboutSection,
  })
}

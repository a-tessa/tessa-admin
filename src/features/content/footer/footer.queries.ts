import { queryOptions } from '@tanstack/react-query'
import { fetchFooterSection } from './footer.service'

export const footerKeys = {
  all: ['content', 'footer'] as const,
  detail: () => [...footerKeys.all, 'detail'] as const,
}

export function footerSectionQuery() {
  return queryOptions({
    queryKey: footerKeys.detail(),
    queryFn: fetchFooterSection,
  })
}

import { queryOptions } from '@tanstack/react-query'
import { fetchRedirects } from './redirects.service'
import type { RedirectListParams } from './types'

export const redirectKeys = {
  all: ['content', 'redirects'] as const,
  lists: () => [...redirectKeys.all, 'list'] as const,
  list: (params: RedirectListParams) =>
    [...redirectKeys.lists(), params] as const,
}

export function redirectsQuery(params: RedirectListParams) {
  return queryOptions({
    queryKey: redirectKeys.list(params),
    queryFn: () => fetchRedirects(params),
  })
}

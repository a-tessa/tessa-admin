import { queryOptions } from '@tanstack/react-query'
import { fetchPageSeo, fetchSeoDefaults } from './seo.service'

export const seoKeys = {
  all: ['content', 'seo'] as const,
  defaults: () => [...seoKeys.all, 'defaults'] as const,
  pages: () => [...seoKeys.all, 'pages'] as const,
}

export function seoDefaultsQuery() {
  return queryOptions({
    queryKey: seoKeys.defaults(),
    queryFn: fetchSeoDefaults,
  })
}

export function pageSeoQuery() {
  return queryOptions({
    queryKey: seoKeys.pages(),
    queryFn: fetchPageSeo,
  })
}

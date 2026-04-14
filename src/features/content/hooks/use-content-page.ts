import { useQuery } from '@tanstack/react-query'
import { contentPageQuery } from '../content.queries'

export function useContentPage(slug: string | undefined) {
  return useQuery({
    ...contentPageQuery(slug ?? ''),
    enabled: slug !== undefined && slug !== '',
  })
}

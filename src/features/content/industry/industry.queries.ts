import { queryOptions } from '@tanstack/react-query'
import { fetchIndustrySection } from './industry.service'

export const industryKeys = {
  all: ['content', 'industry'] as const,
  detail: () => [...industryKeys.all, 'detail'] as const,
}

export function industrySectionQuery() {
  return queryOptions({
    queryKey: industryKeys.detail(),
    queryFn: fetchIndustrySection,
  })
}

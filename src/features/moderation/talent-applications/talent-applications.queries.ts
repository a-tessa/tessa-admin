import { queryOptions } from '@tanstack/react-query'
import { fetchTalentApplications } from './talent-applications.service'
import type { TalentApplicationListParams } from './types'

export const talentApplicationKeys = {
  all: ['moderation', 'talent-applications'] as const,
  lists: () => [...talentApplicationKeys.all, 'list'] as const,
  list: (params: TalentApplicationListParams) =>
    [...talentApplicationKeys.lists(), params] as const,
}

export function talentApplicationsListQuery(params: TalentApplicationListParams) {
  return queryOptions({
    queryKey: talentApplicationKeys.list(params),
    queryFn: () => fetchTalentApplications(params),
  })
}

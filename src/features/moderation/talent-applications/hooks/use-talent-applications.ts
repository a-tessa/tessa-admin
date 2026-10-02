import { useQuery } from '@tanstack/react-query'
import { talentApplicationsListQuery } from '../talent-applications.queries'
import type { TalentApplicationListParams } from '../types'

export function useTalentApplications(params: TalentApplicationListParams) {
  return useQuery(talentApplicationsListQuery(params))
}

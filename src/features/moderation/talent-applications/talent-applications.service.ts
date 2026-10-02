import { authenticatedRequest } from '@/shared/lib/api'
import type {
  TalentApplicationListParams,
  TalentApplicationListResponse,
} from './types'

const BASE_PATH = '/api/talent-applications/admin'

export async function fetchTalentApplications(
  params: TalentApplicationListParams,
): Promise<TalentApplicationListResponse> {
  const search = new URLSearchParams({
    page: String(params.page),
    perPage: String(params.perPage),
  })

  return authenticatedRequest<TalentApplicationListResponse>(
    `${BASE_PATH}?${search.toString()}`,
  )
}

export async function deleteTalentApplication(id: string): Promise<void> {
  await authenticatedRequest<unknown>(`${BASE_PATH}/${id}`, {
    method: 'DELETE',
  })
}

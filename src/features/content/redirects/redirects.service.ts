import { authenticatedRequest } from '@/shared/lib/api'
import type {
  RedirectInput,
  RedirectListParams,
  RedirectListResponse,
  RedirectResponse,
} from './types'

const BASE_PATH = '/api/redirects'

function buildQueryString(params: RedirectListParams): string {
  const search = new URLSearchParams()
  if (params.q) search.set('q', params.q)
  if (params.page !== undefined) search.set('page', String(params.page))
  if (params.perPage !== undefined) {
    search.set('perPage', String(params.perPage))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

export async function fetchRedirects(
  params: RedirectListParams = {},
): Promise<RedirectListResponse> {
  return authenticatedRequest<RedirectListResponse>(
    `${BASE_PATH}${buildQueryString(params)}`,
  )
}

export async function createRedirect(
  input: RedirectInput,
): Promise<RedirectResponse> {
  return authenticatedRequest<RedirectResponse>(BASE_PATH, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateRedirect(
  id: string,
  input: RedirectInput,
): Promise<RedirectResponse> {
  return authenticatedRequest<RedirectResponse>(`${BASE_PATH}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function deleteRedirect(id: string): Promise<void> {
  await authenticatedRequest(`${BASE_PATH}/${id}`, { method: 'DELETE' })
}

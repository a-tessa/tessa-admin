import { apiRequest } from '@/shared/lib/api'
import type {
  ContentPaginationParams,
  FetchContentPageResponse,
  FetchContentPagesResponse,
  PublishContentPageResponse,
  UpsertContentPageInput,
  UpsertContentPageResponse,
} from '../types'

export async function fetchContentPages(
  params: ContentPaginationParams,
  accessToken: string,
): Promise<FetchContentPagesResponse> {
  const search = new URLSearchParams({
    page: String(params.page),
    perPage: String(params.perPage),
  })

  return apiRequest<FetchContentPagesResponse>(
    `/api/content/admin/pages?${search.toString()}`,
    {},
    accessToken,
  )
}

export async function fetchContentPage(
  slug: string,
  accessToken: string,
): Promise<FetchContentPageResponse> {
  return apiRequest<FetchContentPageResponse>(
    `/api/content/admin/pages/${slug}`,
    {},
    accessToken,
  )
}

export async function upsertContentPage(
  slug: string,
  input: UpsertContentPageInput,
  accessToken: string,
): Promise<UpsertContentPageResponse> {
  return apiRequest<UpsertContentPageResponse>(
    `/api/content/admin/pages/${slug}`,
    { method: 'PUT', body: JSON.stringify(input) },
    accessToken,
  )
}

export async function publishContentPage(
  slug: string,
  accessToken: string,
): Promise<PublishContentPageResponse> {
  return apiRequest<PublishContentPageResponse>(
    `/api/content/admin/pages/${slug}/publish`,
    { method: 'POST' },
    accessToken,
  )
}

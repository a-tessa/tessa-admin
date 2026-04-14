import { authenticatedRequest } from '@/shared/lib/api'
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
): Promise<FetchContentPagesResponse> {
  const search = new URLSearchParams({
    page: String(params.page),
    perPage: String(params.perPage),
  })

  return authenticatedRequest<FetchContentPagesResponse>(
    `/api/content/admin/pages?${search.toString()}`,
  )
}

export async function fetchContentPage(
  slug: string,
): Promise<FetchContentPageResponse> {
  return authenticatedRequest<FetchContentPageResponse>(
    `/api/content/admin/pages/${slug}`,
  )
}

export async function upsertContentPage(
  slug: string,
  input: UpsertContentPageInput,
): Promise<UpsertContentPageResponse> {
  return authenticatedRequest<UpsertContentPageResponse>(
    `/api/content/admin/pages/${slug}`,
    { method: 'PUT', body: JSON.stringify(input) },
  )
}

export async function publishContentPage(
  slug: string,
): Promise<PublishContentPageResponse> {
  return authenticatedRequest<PublishContentPageResponse>(
    `/api/content/admin/pages/${slug}/publish`,
    { method: 'POST' },
  )
}

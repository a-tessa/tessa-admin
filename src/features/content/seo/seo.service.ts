import { ApiError, authenticatedRequest, authenticatedUploadRequest } from '@/shared/lib/api'
import type {
  PageSeo,
  PageSeoResponse,
  SeoDefaults,
  SeoDefaultsResponse,
  SeoPageKey,
} from './types'

const DEFAULTS_PATH = '/api/content/admin/seo-defaults'
const PAGE_SEO_PATH = '/api/content/admin/page-seo'

export async function fetchSeoDefaults(): Promise<SeoDefaults | null> {
  try {
    const response =
      await authenticatedRequest<SeoDefaultsResponse>(DEFAULTS_PATH)
    return response.seoDefaults
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }

    throw error
  }
}

export async function createSeoDefaults(
  input: SeoDefaults,
): Promise<SeoDefaultsResponse> {
  return authenticatedRequest<SeoDefaultsResponse>(DEFAULTS_PATH, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateSeoDefaults(
  input: SeoDefaults,
): Promise<SeoDefaultsResponse> {
  return authenticatedRequest<SeoDefaultsResponse>(DEFAULTS_PATH, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function fetchPageSeo(): Promise<PageSeo> {
  try {
    const response = await authenticatedRequest<PageSeoResponse>(PAGE_SEO_PATH)
    return response.pageSeo
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {}
    }

    throw error
  }
}

export async function createPageSeo(input: PageSeo): Promise<PageSeoResponse> {
  return authenticatedRequest<PageSeoResponse>(PAGE_SEO_PATH, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updatePageSeo(input: PageSeo): Promise<PageSeoResponse> {
  return authenticatedRequest<PageSeoResponse>(PAGE_SEO_PATH, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function uploadSeoDefaultOgImage(
  file: File,
  onProgress?: (percentage: number) => void,
): Promise<SeoDefaultsResponse> {
  const formData = new FormData()
  formData.append('file', file)

  return authenticatedUploadRequest<SeoDefaultsResponse>(
    `${DEFAULTS_PATH}/og-image`,
    formData,
    onProgress,
  )
}

export async function deleteSeoDefaultOgImage(): Promise<SeoDefaultsResponse> {
  return authenticatedRequest<SeoDefaultsResponse>(`${DEFAULTS_PATH}/og-image`, {
    method: 'DELETE',
  })
}

export async function uploadPageSeoOgImage(
  pageKey: SeoPageKey,
  file: File,
  onProgress?: (percentage: number) => void,
): Promise<PageSeoResponse> {
  const formData = new FormData()
  formData.append('file', file)

  return authenticatedUploadRequest<PageSeoResponse>(
    `${PAGE_SEO_PATH}/${pageKey}/og-image`,
    formData,
    onProgress,
  )
}

export async function deletePageSeoOgImage(
  pageKey: SeoPageKey,
): Promise<PageSeoResponse> {
  return authenticatedRequest<PageSeoResponse>(
    `${PAGE_SEO_PATH}/${pageKey}/og-image`,
    {
      method: 'DELETE',
    },
  )
}

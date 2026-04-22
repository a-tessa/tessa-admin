import { authenticatedRequest } from '@/shared/lib/api'
import type {
  AdminBlogListParams,
  BlogArticleFormInput,
  BlogArticleResponse,
  BlogArticlesListResponse,
  BlogBodyImageUploadResponse,
} from './types'

const BASE_PATH = '/api/blog'

function buildQueryString(params: AdminBlogListParams): string {
  const search = new URLSearchParams()

  if (params.status) search.set('status', params.status)
  if (params.categorySlug) search.set('categorySlug', params.categorySlug)
  if (params.page !== undefined) search.set('page', String(params.page))
  if (params.perPage !== undefined)
    search.set('perPage', String(params.perPage))

  const query = search.toString()
  return query ? `?${query}` : ''
}

export async function fetchAdminBlogArticles(
  params: AdminBlogListParams = {},
): Promise<BlogArticlesListResponse> {
  const path = `${BASE_PATH}/admin${buildQueryString(params)}`
  return authenticatedRequest<BlogArticlesListResponse>(path)
}

export async function fetchBlogArticleBySlug(
  slug: string,
): Promise<BlogArticleResponse> {
  return authenticatedRequest<BlogArticleResponse>(`${BASE_PATH}/admin/${slug}`)
}

function buildArticleFormData(input: BlogArticleFormInput): FormData {
  const formData = new FormData()
  formData.append('title', input.title)
  formData.append('content', input.content)
  formData.append('categorySlug', input.categorySlug)
  formData.append('status', input.status)

  if (input.headerImageAlt.trim().length > 0) {
    formData.append('headerImageAlt', input.headerImageAlt)
  }

  if (input.headerImageFile) {
    formData.append('headerImage', input.headerImageFile)
  }

  if (input.removeHeaderImage) {
    formData.append('removeHeaderImage', 'true')
  }

  return formData
}

export async function createBlogArticle(
  input: BlogArticleFormInput,
): Promise<BlogArticleResponse> {
  const formData = buildArticleFormData(input)

  return authenticatedRequest<BlogArticleResponse>(BASE_PATH, {
    method: 'POST',
    body: formData,
  })
}

export async function updateBlogArticle(
  slug: string,
  input: BlogArticleFormInput,
): Promise<BlogArticleResponse> {
  const formData = buildArticleFormData(input)

  return authenticatedRequest<BlogArticleResponse>(`${BASE_PATH}/${slug}`, {
    method: 'PUT',
    body: formData,
  })
}

export async function deleteBlogArticle(slug: string): Promise<void> {
  await authenticatedRequest<unknown>(`${BASE_PATH}/${slug}`, {
    method: 'DELETE',
  })
}

export async function uploadBlogBodyImage(
  file: File,
): Promise<BlogBodyImageUploadResponse> {
  const formData = new FormData()
  formData.append('image', file)

  return authenticatedRequest<BlogBodyImageUploadResponse>(
    `${BASE_PATH}/body-images`,
    {
      method: 'POST',
      body: formData,
    },
  )
}

export type LandingPageStatus = 'draft' | 'published'

export interface ContentPageSummary {
  id: string
  slug: string
  title: string
  status: LandingPageStatus
  updatedAt: string
  publishedAt: string | null
}

export interface ContentPage {
  id: string
  slug: string
  title: string
  seoTitle: string | null
  seoDescription: string | null
  status: LandingPageStatus
  draftContent: Record<string, unknown>
  publishedContent: Record<string, unknown> | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ContentPaginationParams {
  page: number
  perPage: number
}

export interface ContentPaginationMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface FetchContentPagesResponse {
  pages: ContentPageSummary[]
  pagination: ContentPaginationMeta
}

export interface FetchContentPageResponse {
  page: ContentPage
}

export interface UpsertContentPageInput {
  title: string
  seoTitle?: string | null | undefined
  seoDescription?: string | null | undefined
  draftContent: Record<string, unknown>
}

export interface UpsertContentPageResponse {
  page: ContentPage
}

export interface PublishContentPageResponse {
  page: ContentPage
}

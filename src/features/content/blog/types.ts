export type BlogArticleStatus = 'draft' | 'published'

export type ContentLocale = 'pt-BR' | 'en' | 'es'

export interface BlogAuthor {
  id: string
  name: string
}

export interface BlogArticleListItem {
  id: string
  title: string
  slug: string
  categorySlug: string
  headerImageUrl: string | null
  headerImageAlt: string | null
  status: BlogArticleStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  author: BlogAuthor
}

export interface BlogArticleAdminListItem extends BlogArticleListItem {
  availableLocales: ContentLocale[]
}

export interface BlogArticle extends BlogArticleListItem {
  content: string
}

export interface BlogArticlePaginationMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface BlogArticlesListResponse {
  articles: BlogArticleAdminListItem[]
  pagination: BlogArticlePaginationMeta
}

export interface BlogArticleResponse {
  article: BlogArticle
}

export interface BlogBodyImageUploadResponse {
  url: string
}

export interface BlogArticleFormInput {
  title: string
  content: string
  categorySlug: string
  headerImageAlt: string
  status: BlogArticleStatus
  headerImageFile: File | null
  removeHeaderImage: boolean
}

export type BlogListOrder = 'asc' | 'desc'

export type BlogListSortBy = 'updatedAt' | 'publishedAt'

export interface AdminBlogListParams {
  status?: BlogArticleStatus
  categorySlug?: string
  /** Case-insensitive title search. */
  q?: string
  /** Sort direction: desc = newest first, asc = oldest first. */
  order?: BlogListOrder
  /** Which date column to sort by. */
  sortBy?: BlogListSortBy
  page?: number
  perPage?: number
}

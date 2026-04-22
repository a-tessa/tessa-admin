export type BlogArticleStatus = 'draft' | 'published'

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

export interface BlogArticle extends BlogArticleListItem {
  content: string
}

export interface BlogArticlePaginationMeta {
  page: number
  perPage: number
  total: number
}

export interface BlogArticlesListResponse {
  articles: BlogArticleListItem[]
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

export interface AdminBlogListParams {
  status?: BlogArticleStatus
  categorySlug?: string
  page?: number
  perPage?: number
}

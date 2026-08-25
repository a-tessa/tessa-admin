export type RedirectSource = 'manual' | 'slugChange'

export interface RedirectRecord {
  id: string
  fromPath: string
  toPath: string
  statusCode: number
  source: RedirectSource
  entityType: string | null
  entityId: string | null
  createdAt: string
  updatedAt: string
}

export interface RedirectPagination {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface RedirectListParams {
  page?: number
  perPage?: number
  q?: string
}

export interface RedirectListResponse {
  redirects: RedirectRecord[]
  pagination: RedirectPagination
}

export interface RedirectResponse {
  redirect: RedirectRecord
}

export interface RedirectInput {
  fromPath: string
  toPath: string
  statusCode: 301 | 302
}

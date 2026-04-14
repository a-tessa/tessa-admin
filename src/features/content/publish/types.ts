export interface AdminContentResponse {
  content: Record<string, unknown>
  publishedContent: Record<string, unknown> | null
  status: 'draft' | 'published'
  publishedAt: string | null
  updatedAt: string | null
}

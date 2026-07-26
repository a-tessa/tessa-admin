export interface AdminContentResponse {
  content: Record<string, unknown>
  publishedContent: Record<string, unknown> | null
  status: 'draft' | 'published'
  publishedAt: string | null
  updatedAt: string | null
}

export type TranslationLocale = 'en' | 'es'

export type TranslationPublicationStatus =
  | 'not_started'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'

export interface TranslationLocaleStatus {
  locale: TranslationLocale
  status: TranslationPublicationStatus
  attempts: number
  error: string | null
  fields: string[]
  updatedAt: string | null
}

export interface PublicationStatusResponse {
  translations: {
    configured: boolean
    locales: TranslationLocaleStatus[]
  }
}

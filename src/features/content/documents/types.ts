import type { ContentLocale } from '@/features/content/blog/types'

export type { ContentLocale }

export interface DocumentFile {
  id: string
  locale: ContentLocale
  url: string
  pathname: string
  mimeType: string
  sizeBytes: number
  originalFilename: string | null
  coverImageUrl: string | null
  coverImagePathname: string | null
  createdAt: string
  updatedAt: string
}

export interface DocumentAdmin {
  id: string
  title: string
  titleEn: string | null
  titleEs: string | null
  description: string | null
  descriptionEn: string | null
  descriptionEs: string | null
  categorySlug: string
  order: number
  createdAt: string
  updatedAt: string
  files: DocumentFile[]
  availableLocales: ContentLocale[]
}

export interface DocumentsAdminListResponse {
  documents: DocumentAdmin[]
}

export interface DocumentAdminResponse {
  document: DocumentAdmin
}

export interface DocumentFormInput {
  title: string
  description?: string | null
  titleEn?: string | null
  titleEs?: string | null
  descriptionEn?: string | null
  descriptionEs?: string | null
  categorySlug: string
  order: number
}

export interface PersistDocumentFileInput {
  url: string
  pathname: string
  mimeType: 'application/pdf'
  sizeBytes: number
  originalFilename?: string | null
}

export const ALL_CONTENT_LOCALES: ContentLocale[] = ['pt-BR', 'en', 'es']

export const LOCALE_LABELS: Record<ContentLocale, string> = {
  'pt-BR': 'Português (BR)',
  en: 'Inglês',
  es: 'Espanhol',
}

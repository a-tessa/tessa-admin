import { authenticatedRequest } from '@/shared/lib/api'
import type {
  AdminContentResponse,
  PublicationStatusResponse,
} from './types'

export async function fetchAdminContent(): Promise<AdminContentResponse> {
  return authenticatedRequest<AdminContentResponse>('/api/content/admin')
}

export async function publishMainContent(): Promise<AdminContentResponse> {
  return authenticatedRequest<AdminContentResponse>('/api/content/admin/publish', {
    method: 'POST',
  })
}

export async function fetchPublicationStatus(): Promise<PublicationStatusResponse> {
  return authenticatedRequest<PublicationStatusResponse>(
    '/api/content/admin/publication-status',
  )
}

export async function retryHomepageTranslations(): Promise<PublicationStatusResponse> {
  return authenticatedRequest<PublicationStatusResponse>(
    '/api/content/admin/translations/retry',
    { method: 'POST' },
  )
}

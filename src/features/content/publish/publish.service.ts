import { authenticatedRequest } from '@/shared/lib/api'
import type { AdminContentResponse } from './types'

export async function fetchAdminContent(): Promise<AdminContentResponse> {
  return authenticatedRequest<AdminContentResponse>('/api/content/admin')
}

export async function publishMainContent(): Promise<AdminContentResponse> {
  return authenticatedRequest<AdminContentResponse>('/api/content/admin/publish', {
    method: 'POST',
  })
}

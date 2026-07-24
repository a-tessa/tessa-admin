import { authenticatedRequest } from '@/shared/lib/api'
import type {
  InstagramCatalogResponse,
  InstagramOAuthStartResponse,
  SaveInstagramSelectionInput,
  InstagramStatusResponse,
  InstagramSyncResponse,
} from './types'

const BASE_PATH = '/api/instagram'

export async function fetchInstagramStatus(): Promise<InstagramStatusResponse> {
  return authenticatedRequest<InstagramStatusResponse>(`${BASE_PATH}/admin/status`)
}

export async function startInstagramOAuth(): Promise<InstagramOAuthStartResponse> {
  return authenticatedRequest<InstagramOAuthStartResponse>(
    `${BASE_PATH}/admin/oauth/start`,
  )
}

export async function syncInstagramMedia(): Promise<InstagramSyncResponse> {
  return authenticatedRequest<InstagramSyncResponse>(`${BASE_PATH}/admin/sync`, {
    method: 'POST',
  })
}

export async function fetchInstagramCatalog(): Promise<InstagramCatalogResponse> {
  return authenticatedRequest<InstagramCatalogResponse>(
    `${BASE_PATH}/admin/catalog`,
  )
}

export async function saveInstagramSelection(
  input: SaveInstagramSelectionInput,
): Promise<InstagramCatalogResponse> {
  return authenticatedRequest<InstagramCatalogResponse>(
    `${BASE_PATH}/admin/selection`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
  )
}

export async function disconnectInstagram(): Promise<void> {
  await authenticatedRequest<unknown>(`${BASE_PATH}/admin/connection`, {
    method: 'DELETE',
  })
}

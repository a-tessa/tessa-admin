import { authenticatedRequest } from '@/shared/lib/api'
import type {
  RepresentantInput,
  RepresentantItemResponse,
  RepresentantSegmentsResponse,
  RepresentantsResponse,
} from './types'

const BASE_PATH = '/api/content/admin/representants-base'
const SEGMENTS_PATH = `${BASE_PATH}/segments`

export async function fetchRepresentants(): Promise<RepresentantsResponse> {
  return authenticatedRequest<RepresentantsResponse>(BASE_PATH)
}

export async function fetchRepresentant(
  id: string,
): Promise<RepresentantItemResponse> {
  return authenticatedRequest<RepresentantItemResponse>(`${BASE_PATH}/${id}`)
}

export async function fetchRepresentantSegments(): Promise<RepresentantSegmentsResponse> {
  return authenticatedRequest<RepresentantSegmentsResponse>(SEGMENTS_PATH)
}

export async function createRepresentant(
  input: RepresentantInput,
): Promise<RepresentantItemResponse> {
  return authenticatedRequest<RepresentantItemResponse>(BASE_PATH, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateRepresentant(
  id: string,
  input: RepresentantInput,
): Promise<RepresentantItemResponse> {
  return authenticatedRequest<RepresentantItemResponse>(`${BASE_PATH}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function deleteRepresentant(id: string): Promise<void> {
  await authenticatedRequest<unknown>(`${BASE_PATH}/${id}`, {
    method: 'DELETE',
  })
}

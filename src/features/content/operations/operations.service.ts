import { ApiError, authenticatedRequest } from '@/shared/lib/api'
import type {
  OperationAssetUploadResponse,
  OperationSection,
  OperationSectionResponse,
} from './types'

const BASE_PATH = '/api/content/admin/operation-section'
const ASSETS_PATH = `${BASE_PATH}/assets`

export async function fetchOperationSection(): Promise<OperationSection | null> {
  try {
    const response: OperationSectionResponse =
      await authenticatedRequest<OperationSectionResponse>(BASE_PATH)
    return response.operationSection
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }

    throw error
  }
}

export async function createOperationSection(
  input: OperationSection,
): Promise<OperationSectionResponse> {
  return authenticatedRequest<OperationSectionResponse>(BASE_PATH, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateOperationSection(
  input: OperationSection,
): Promise<OperationSectionResponse> {
  return authenticatedRequest<OperationSectionResponse>(BASE_PATH, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function deleteOperationSection(): Promise<void> {
  await authenticatedRequest<unknown>(BASE_PATH, {
    method: 'DELETE',
  })
}

export async function uploadOperationAsset(
  file: File,
  index?: number,
): Promise<OperationAssetUploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  if (typeof index === 'number') {
    formData.append('index', String(index))
  }

  return authenticatedRequest<OperationAssetUploadResponse>(ASSETS_PATH, {
    method: 'POST',
    body: formData,
  })
}

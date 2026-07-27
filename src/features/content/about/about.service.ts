import {
  ApiError,
  authenticatedRequest,
  authenticatedUploadRequest,
} from '@/shared/lib/api'
import type {
  AboutAssetUploadResponse,
  AboutSection,
  AboutSectionResponse,
} from './types'

const BASE_PATH = '/api/content/admin/about-section'
const ASSETS_PATH = `${BASE_PATH}/assets`

export async function fetchAboutSection(): Promise<AboutSection | null> {
  try {
    const response: AboutSectionResponse =
      await authenticatedRequest<AboutSectionResponse>(BASE_PATH)
    return response.aboutSection
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }

    throw error
  }
}

export async function createAboutSection(
  input: AboutSection,
): Promise<AboutSectionResponse> {
  return authenticatedRequest<AboutSectionResponse>(BASE_PATH, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateAboutSection(
  input: AboutSection,
): Promise<AboutSectionResponse> {
  return authenticatedRequest<AboutSectionResponse>(BASE_PATH, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function deleteAboutSection(): Promise<void> {
  await authenticatedRequest<unknown>(BASE_PATH, {
    method: 'DELETE',
  })
}

export async function uploadAboutSideImage(
  file: File,
  onProgress?: (percentage: number) => void,
): Promise<AboutAssetUploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  return authenticatedUploadRequest<AboutAssetUploadResponse>(
    ASSETS_PATH,
    formData,
    onProgress,
  )
}

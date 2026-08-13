import { ApiError, authenticatedRequest } from '@/shared/lib/api'
import type { FooterSection, FooterSectionResponse } from './types'

const BASE_PATH = '/api/content/admin/footer-section'

export async function fetchFooterSection(): Promise<FooterSection | null> {
  try {
    const response: FooterSectionResponse =
      await authenticatedRequest<FooterSectionResponse>(BASE_PATH)
    return response.footerSection
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }

    throw error
  }
}

export async function createFooterSection(
  input: FooterSection,
): Promise<FooterSectionResponse> {
  return authenticatedRequest<FooterSectionResponse>(BASE_PATH, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateFooterSection(
  input: FooterSection,
): Promise<FooterSectionResponse> {
  return authenticatedRequest<FooterSectionResponse>(BASE_PATH, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function deleteFooterSection(): Promise<void> {
  await authenticatedRequest<unknown>(BASE_PATH, {
    method: 'DELETE',
  })
}

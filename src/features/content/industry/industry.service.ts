import { ApiError, authenticatedRequest } from '@/shared/lib/api'
import type { IndustrySection, IndustrySectionResponse } from './types'

const BASE_PATH = '/api/content/admin/industry-section'

export async function fetchIndustrySection(): Promise<IndustrySection | null> {
  try {
    const response: IndustrySectionResponse =
      await authenticatedRequest<IndustrySectionResponse>(BASE_PATH)
    return response.industrySection
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }

    throw error
  }
}

export async function createIndustrySection(
  input: IndustrySection,
): Promise<IndustrySectionResponse> {
  return authenticatedRequest<IndustrySectionResponse>(BASE_PATH, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateIndustrySection(
  input: IndustrySection,
): Promise<IndustrySectionResponse> {
  return authenticatedRequest<IndustrySectionResponse>(BASE_PATH, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function deleteIndustrySection(): Promise<void> {
  await authenticatedRequest<unknown>(BASE_PATH, {
    method: 'DELETE',
  })
}

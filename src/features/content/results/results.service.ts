import { ApiError, authenticatedRequest } from '@/shared/lib/api'
import type {
  ResultsSection,
  ResultsSectionResponse,
  StoredResultsSection,
} from './types'

const BASE_PATH = '/api/content/admin/results-section'

export async function fetchResultsSection(): Promise<StoredResultsSection | null> {
  try {
    const response: ResultsSectionResponse =
      await authenticatedRequest<ResultsSectionResponse>(BASE_PATH)
    return response.resultsSection
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }

    throw error
  }
}

export async function createResultsSection(
  input: ResultsSection,
): Promise<ResultsSectionResponse> {
  return authenticatedRequest<ResultsSectionResponse>(BASE_PATH, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateResultsSection(
  input: ResultsSection,
): Promise<ResultsSectionResponse> {
  return authenticatedRequest<ResultsSectionResponse>(BASE_PATH, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function deleteResultsSection(): Promise<void> {
  await authenticatedRequest<unknown>(BASE_PATH, {
    method: 'DELETE',
  })
}

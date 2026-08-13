import { ApiError, authenticatedRequest } from '@/shared/lib/api'
import type {
  CompanyInformation,
  CompanyInformationResponse,
} from './types'

const BASE_PATH = '/api/content/admin/company-information'

export async function fetchCompanyInformation(): Promise<CompanyInformation | null> {
  try {
    const response: CompanyInformationResponse =
      await authenticatedRequest<CompanyInformationResponse>(BASE_PATH)
    return response.companyInformation
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }

    throw error
  }
}

export async function createCompanyInformation(
  input: CompanyInformation,
): Promise<CompanyInformationResponse> {
  return authenticatedRequest<CompanyInformationResponse>(BASE_PATH, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateCompanyInformation(
  input: CompanyInformation,
): Promise<CompanyInformationResponse> {
  return authenticatedRequest<CompanyInformationResponse>(BASE_PATH, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function deleteCompanyInformation(): Promise<void> {
  await authenticatedRequest<unknown>(BASE_PATH, {
    method: 'DELETE',
  })
}

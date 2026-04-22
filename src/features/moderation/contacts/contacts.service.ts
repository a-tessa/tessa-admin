import { authenticatedRequest } from '@/shared/lib/api'
import type {
  ContactItemResponse,
  ContactListParams,
  ContactListResponse,
  ContactStatsResponse,
  UpdateContactStatusInput,
} from './types'

const BASE_PATH = '/api/contacts/admin'

export async function fetchContacts(
  params: ContactListParams,
): Promise<ContactListResponse> {
  const search = new URLSearchParams({
    page: String(params.page),
    perPage: String(params.perPage),
  })

  return authenticatedRequest<ContactListResponse>(
    `${BASE_PATH}?${search.toString()}`,
  )
}

export async function fetchContactStats(): Promise<ContactStatsResponse> {
  return authenticatedRequest<ContactStatsResponse>(`${BASE_PATH}/stats`)
}

export async function fetchContact(
  id: string,
): Promise<ContactItemResponse> {
  return authenticatedRequest<ContactItemResponse>(`${BASE_PATH}/${id}`)
}

export async function updateContactStatus(
  id: string,
  input: UpdateContactStatusInput,
): Promise<ContactItemResponse> {
  return authenticatedRequest<ContactItemResponse>(
    `${BASE_PATH}/${id}/contact-status`,
    { method: 'PATCH', body: JSON.stringify(input) },
  )
}

export async function deleteContact(id: string): Promise<void> {
  await authenticatedRequest<unknown>(`${BASE_PATH}/${id}`, {
    method: 'DELETE',
  })
}

import { authenticatedRequest } from '@/shared/lib/api'
import type {
  ClientFormData,
  ClientItemResponse,
  ClientsResponse,
} from './types'

const BASE_PATH = '/api/content/admin/clients'

export async function fetchClients(): Promise<ClientsResponse> {
  return authenticatedRequest<ClientsResponse>(BASE_PATH)
}

export async function fetchClient(id: string): Promise<ClientItemResponse> {
  return authenticatedRequest<ClientItemResponse>(`${BASE_PATH}/${id}`)
}

function buildClientFormData(data: ClientFormData): FormData {
  const formData = new FormData()
  formData.append('payload', JSON.stringify(data.payload))

  if (data.file) {
    formData.append('logo', data.file)
  }

  return formData
}

export async function createClient(data: ClientFormData): Promise<ClientItemResponse> {
  return authenticatedRequest<ClientItemResponse>(BASE_PATH, {
    method: 'POST',
    body: buildClientFormData(data),
  })
}

export async function updateClient(
  id: string,
  data: ClientFormData,
): Promise<ClientItemResponse> {
  return authenticatedRequest<ClientItemResponse>(`${BASE_PATH}/${id}`, {
    method: 'PUT',
    body: buildClientFormData(data),
  })
}

export async function deleteClient(id: string): Promise<void> {
  await authenticatedRequest<void>(`${BASE_PATH}/${id}`, {
    method: 'DELETE',
  })
}

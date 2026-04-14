import { authenticatedRequest } from '@/shared/lib/api'
import type {
  ServicePageFormData,
  ServicePageItemResponse,
  ServicePagesResponse,
} from './types'

const BASE_PATH = '/api/content/admin/services-pages'

export async function fetchServices(): Promise<ServicePagesResponse> {
  return authenticatedRequest<ServicePagesResponse>(BASE_PATH)
}

export async function fetchService(slug: string): Promise<ServicePageItemResponse> {
  return authenticatedRequest<ServicePageItemResponse>(`${BASE_PATH}/${slug}`)
}

function hasFileUploads(data: ServicePageFormData): boolean {
  return data.backgroundImage !== undefined || (data.galleryFiles !== undefined && data.galleryFiles.size > 0)
}

function buildMultipartBody(data: ServicePageFormData): FormData {
  const formData = new FormData()
  formData.append('payload', JSON.stringify(data.payload))

  if (data.backgroundImage) {
    formData.append('backgroundImage', data.backgroundImage)
  }

  if (data.galleryFiles) {
    for (const [index, file] of data.galleryFiles) {
      formData.append(`image_${String(index)}`, file)
    }
  }

  return formData
}

function buildRequestBody(data: ServicePageFormData): FormData | string {
  if (hasFileUploads(data)) {
    return buildMultipartBody(data)
  }
  return JSON.stringify(data.payload)
}

export async function createService(
  data: ServicePageFormData,
): Promise<ServicePageItemResponse> {
  return authenticatedRequest<ServicePageItemResponse>(BASE_PATH, {
    method: 'POST',
    body: buildRequestBody(data),
  })
}

export async function updateService(
  slug: string,
  data: ServicePageFormData,
): Promise<ServicePageItemResponse> {
  return authenticatedRequest<ServicePageItemResponse>(`${BASE_PATH}/${slug}`, {
    method: 'PUT',
    body: buildRequestBody(data),
  })
}

export async function deleteService(slug: string): Promise<void> {
  await authenticatedRequest<void>(`${BASE_PATH}/${slug}`, {
    method: 'DELETE',
  })
}

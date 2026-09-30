import { authenticatedRequest } from '@/shared/lib/api'
import { downscaleServiceImage } from './downscale-service-image'
import type {
  ServicePageAssetUploadResponse,
  ServicePageFormData,
  ServicePageFormPayload,
  ServicePageFormPayloadImage,
  ServicePageItemResponse,
  ServicePagesResponse,
} from './types'

const BASE_PATH = '/api/content/admin/services-pages'
const ASSETS_PATH = `${BASE_PATH}/assets`

async function uploadServicePageAsset(
  slug: string,
  file: File,
  kind: 'background' | 'image',
  index?: number,
): Promise<ServicePageAssetUploadResponse> {
  const prepared = await downscaleServiceImage(file)
  const formData = new FormData()
  formData.append('slug', slug)
  formData.append('kind', kind)
  formData.append('file', prepared)
  if (kind === 'image' && typeof index === 'number') {
    formData.append('index', String(index))
  }

  return authenticatedRequest<ServicePageAssetUploadResponse>(ASSETS_PATH, {
    method: 'POST',
    body: formData,
  })
}

function assetMeta(asset: ServicePageAssetUploadResponse) {
  return {
    pathname: asset.pathname,
    mimeType: asset.mimeType,
    sizeBytes: asset.sizeBytes,
    originalFilename: asset.originalFilename,
  }
}

async function resolveUploads(data: ServicePageFormData): Promise<ServicePageFormPayload> {
  const payload: ServicePageFormPayload = {
    ...data.payload,
    images: data.payload.images.map((image) => ({ ...image })),
  }

  if (data.backgroundImage) {
    const asset = await uploadServicePageAsset(payload.slug, data.backgroundImage, 'background')
    payload.backgroundImageUrl = asset.url
    payload.backgroundImageMeta = assetMeta(asset)
  }

  if (data.galleryFiles && data.galleryFiles.size > 0) {
    for (const [index, file] of data.galleryFiles) {
      const asset = await uploadServicePageAsset(payload.slug, file, 'image', index)
      const nextImage: ServicePageFormPayloadImage = {
        ...payload.images[index],
        imgUrl: asset.url,
        meta: assetMeta(asset),
      }
      payload.images[index] = nextImage
    }
  }

  return payload
}

export async function fetchServices(): Promise<ServicePagesResponse> {
  return authenticatedRequest<ServicePagesResponse>(BASE_PATH)
}

export async function fetchService(slug: string): Promise<ServicePageItemResponse> {
  return authenticatedRequest<ServicePageItemResponse>(`${BASE_PATH}/${slug}`)
}

export async function createService(
  data: ServicePageFormData,
): Promise<ServicePageItemResponse> {
  const payload = await resolveUploads(data)
  return authenticatedRequest<ServicePageItemResponse>(BASE_PATH, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateService(
  slug: string,
  data: ServicePageFormData,
): Promise<ServicePageItemResponse> {
  const payload = await resolveUploads(data)
  return authenticatedRequest<ServicePageItemResponse>(`${BASE_PATH}/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteService(slug: string): Promise<void> {
  await authenticatedRequest<undefined>(`${BASE_PATH}/${slug}`, {
    method: 'DELETE',
  })
}

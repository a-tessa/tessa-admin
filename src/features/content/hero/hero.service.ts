import { ApiError, authenticatedRequest } from '@/shared/lib/api'
import type { HeroSectionFormData, HeroSectionResponse } from './types'

const BASE_PATH = '/api/content/admin/hero-section'

export async function fetchHeroSection(): Promise<HeroSectionResponse> {
  try {
    return await authenticatedRequest<HeroSectionResponse>(BASE_PATH)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { heroSection: [] }
    }

    throw error
  }
}

function buildHeroFormData(data: HeroSectionFormData): FormData {
  const formData = new FormData()
  formData.append('payload', JSON.stringify(data.payload))

  if (data.files) {
    for (const [index, file] of data.files) {
      formData.append(`image_${String(index)}`, file)
    }
  }

  if (data.alts) {
    for (const [index, alt] of data.alts) {
      formData.append(`alt_${String(index)}`, alt)
    }
  }

  return formData
}

export async function createHeroSection(
  data: HeroSectionFormData,
): Promise<HeroSectionResponse> {
  const formData = buildHeroFormData(data)

  return authenticatedRequest<HeroSectionResponse>(BASE_PATH, {
    method: 'POST',
    body: formData,
  })
}

export async function updateHeroSection(
  data: HeroSectionFormData,
): Promise<HeroSectionResponse> {
  const formData = buildHeroFormData(data)

  return authenticatedRequest<HeroSectionResponse>(BASE_PATH, {
    method: 'PUT',
    body: formData,
  })
}

export async function deleteHeroSection(): Promise<void> {
  await authenticatedRequest<void>(BASE_PATH, {
    method: 'DELETE',
  })
}

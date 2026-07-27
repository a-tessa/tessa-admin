import { authenticatedRequest } from '@/shared/lib/api'
import type {
  ModerateTestimonialInput,
  SetTestimonialVisibilityInput,
  TestimonialItemResponse,
  TestimonialListParams,
  TestimonialStatsResponse,
  TestimonialsListResponse,
} from './types'

const BASE_PATH = '/api/testimonials/admin'

export async function fetchTestimonials(
  params: TestimonialListParams,
): Promise<TestimonialsListResponse> {
  const search = new URLSearchParams({
    page: String(params.page),
    perPage: String(params.perPage),
  })

  if (params.status) {
    search.set('status', params.status)
  }

  return authenticatedRequest<TestimonialsListResponse>(
    `${BASE_PATH}?${search.toString()}`,
  )
}

export async function fetchTestimonialStats(): Promise<TestimonialStatsResponse> {
  return authenticatedRequest<TestimonialStatsResponse>(`${BASE_PATH}/stats`)
}

export async function fetchTestimonial(
  id: string,
): Promise<TestimonialItemResponse> {
  return authenticatedRequest<TestimonialItemResponse>(`${BASE_PATH}/${id}`)
}

export async function moderateTestimonial(
  id: string,
  input: ModerateTestimonialInput,
): Promise<TestimonialItemResponse> {
  return authenticatedRequest<TestimonialItemResponse>(
    `${BASE_PATH}/${id}/moderation`,
    { method: 'PATCH', body: JSON.stringify(input) },
  )
}

export async function setTestimonialVisibility(
  id: string,
  input: SetTestimonialVisibilityInput,
): Promise<TestimonialItemResponse> {
  return authenticatedRequest<TestimonialItemResponse>(
    `${BASE_PATH}/${id}/visibility`,
    { method: 'PATCH', body: JSON.stringify(input) },
  )
}

export async function deleteTestimonial(id: string): Promise<void> {
  await authenticatedRequest<unknown>(`${BASE_PATH}/${id}`, { method: 'DELETE' })
}

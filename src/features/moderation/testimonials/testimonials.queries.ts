import { queryOptions } from '@tanstack/react-query'
import {
  fetchTestimonial,
  fetchTestimonialStats,
  fetchTestimonials,
} from './testimonials.service'
import type { TestimonialListParams } from './types'

export const testimonialKeys = {
  all: ['moderation', 'testimonials'] as const,
  lists: () => [...testimonialKeys.all, 'list'] as const,
  list: (params: TestimonialListParams) =>
    [...testimonialKeys.lists(), params] as const,
  stats: () => [...testimonialKeys.all, 'stats'] as const,
  details: () => [...testimonialKeys.all, 'detail'] as const,
  detail: (id: string) => [...testimonialKeys.details(), id] as const,
}

export function testimonialsListQuery(params: TestimonialListParams) {
  return queryOptions({
    queryKey: testimonialKeys.list(params),
    queryFn: () => fetchTestimonials(params),
  })
}

export function testimonialStatsQuery() {
  return queryOptions({
    queryKey: testimonialKeys.stats(),
    queryFn: fetchTestimonialStats,
  })
}

export function testimonialDetailQuery(id: string) {
  return queryOptions({
    queryKey: testimonialKeys.detail(id),
    queryFn: () => fetchTestimonial(id),
    enabled: id !== '',
  })
}

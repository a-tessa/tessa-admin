import { useQuery } from '@tanstack/react-query'
import { testimonialsListQuery } from '../testimonials.queries'
import type { TestimonialListParams } from '../types'

export function useTestimonials(params: TestimonialListParams) {
  return useQuery(testimonialsListQuery(params))
}

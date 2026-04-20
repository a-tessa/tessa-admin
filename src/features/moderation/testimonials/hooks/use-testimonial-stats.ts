import { useQuery } from '@tanstack/react-query'
import { testimonialStatsQuery } from '../testimonials.queries'

export function useTestimonialStats() {
  return useQuery(testimonialStatsQuery())
}

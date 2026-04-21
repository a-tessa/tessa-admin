import { useQuery } from '@tanstack/react-query'
import { representantSegmentsQuery } from '../representants.queries'

export function useRepresentantSegments() {
  return useQuery(representantSegmentsQuery())
}

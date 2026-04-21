import { useQuery } from '@tanstack/react-query'
import { representantsListQuery } from '../representants.queries'

export function useRepresentants() {
  return useQuery(representantsListQuery())
}

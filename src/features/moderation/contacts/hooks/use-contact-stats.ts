import { useQuery } from '@tanstack/react-query'
import { contactStatsQuery } from '../contacts.queries'

export function useContactStats() {
  return useQuery(contactStatsQuery())
}

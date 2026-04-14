import { useQuery } from '@tanstack/react-query'
import { servicesListQuery } from '../services.queries'

export function useServices() {
  return useQuery(servicesListQuery())
}

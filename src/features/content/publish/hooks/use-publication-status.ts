import { useQuery } from '@tanstack/react-query'
import { publicationStatusQuery } from '../publish.queries'

export function usePublicationStatus(enabled: boolean) {
  return useQuery({
    ...publicationStatusQuery(),
    enabled,
  })
}

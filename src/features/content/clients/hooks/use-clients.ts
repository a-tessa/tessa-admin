import { useQuery } from '@tanstack/react-query'
import { clientsListQuery } from '../clients.queries'

export function useClients() {
  return useQuery(clientsListQuery())
}

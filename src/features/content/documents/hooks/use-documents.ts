import { useQuery } from '@tanstack/react-query'
import { adminDocumentsListQuery } from '../documents.queries'

export function useDocuments() {
  return useQuery(adminDocumentsListQuery())
}

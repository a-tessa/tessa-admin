import { useQuery } from '@tanstack/react-query'
import { contactsListQuery } from '../contacts.queries'
import type { ContactListParams } from '../types'

export function useContacts(params: ContactListParams) {
  return useQuery(contactsListQuery(params))
}

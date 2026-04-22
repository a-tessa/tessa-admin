import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteContact } from '../contacts.service'
import { contactKeys } from '../contacts.queries'

export function useDeleteContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteContact(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contactKeys.all })
    },
  })
}

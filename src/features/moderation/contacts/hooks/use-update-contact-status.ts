import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateContactStatus } from '../contacts.service'
import { contactKeys } from '../contacts.queries'
import type { UpdateContactStatusInput } from '../types'

interface UpdateContactStatusVariables {
  id: string
  input: UpdateContactStatusInput
}

export function useUpdateContactStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: UpdateContactStatusVariables) =>
      updateContactStatus(variables.id, variables.input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contactKeys.all })
    },
  })
}

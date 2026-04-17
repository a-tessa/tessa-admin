import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateClient } from '../clients.service'
import { clientKeys } from '../clients.queries'
import { contentKeys } from '../../content.queries'
import { adminContentKeys } from '../../publish/publish.queries'
import type { ClientFormData } from '../types'

interface UpdateClientVariables {
  id: string
  data: ClientFormData
}

export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: UpdateClientVariables) =>
      updateClient(variables.id, variables.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clientKeys.all })
      void queryClient.invalidateQueries({ queryKey: contentKeys.all })
      void queryClient.invalidateQueries({ queryKey: adminContentKeys.all })
    },
  })
}

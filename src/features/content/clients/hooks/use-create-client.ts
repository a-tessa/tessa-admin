import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '../clients.service'
import { clientKeys } from '../clients.queries'
import { contentKeys } from '../../content.queries'
import { adminContentKeys } from '../../publish/publish.queries'
import type { ClientFormData } from '../types'

export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ClientFormData) => createClient(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clientKeys.all })
      void queryClient.invalidateQueries({ queryKey: contentKeys.all })
      void queryClient.invalidateQueries({ queryKey: adminContentKeys.all })
    },
  })
}

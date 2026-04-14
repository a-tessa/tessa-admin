import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateService } from '../services.service'
import { serviceKeys } from '../services.queries'
import { contentKeys } from '../../content.queries'
import { adminContentKeys } from '../../publish/publish.queries'
import type { ServicePageFormData } from '../types'

interface UpdateServiceVariables {
  slug: string
  data: ServicePageFormData
}

export function useUpdateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: UpdateServiceVariables) =>
      updateService(variables.slug, variables.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: serviceKeys.all })
      void queryClient.invalidateQueries({ queryKey: contentKeys.all })
      void queryClient.invalidateQueries({ queryKey: adminContentKeys.all })
    },
  })
}

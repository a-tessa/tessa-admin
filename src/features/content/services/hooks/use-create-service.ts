import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createService } from '../services.service'
import { serviceKeys } from '../services.queries'
import { contentKeys } from '../../content.queries'
import { adminContentKeys } from '../../publish/publish.queries'
import type { ServicePageFormData } from '../types'

export function useCreateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ServicePageFormData) => createService(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: serviceKeys.all })
      void queryClient.invalidateQueries({ queryKey: contentKeys.all })
      void queryClient.invalidateQueries({ queryKey: adminContentKeys.all })
    },
  })
}

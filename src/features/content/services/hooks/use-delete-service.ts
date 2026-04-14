import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteService } from '../services.service'
import { serviceKeys } from '../services.queries'
import { contentKeys } from '../../content.queries'
import { adminContentKeys } from '../../publish/publish.queries'

export function useDeleteService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug: string) => deleteService(slug),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: serviceKeys.all })
      void queryClient.invalidateQueries({ queryKey: contentKeys.all })
      void queryClient.invalidateQueries({ queryKey: adminContentKeys.all })
    },
  })
}

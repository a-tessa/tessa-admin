import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteCategory } from '../categories.service'
import { categoryKeys } from '../categories.queries'
import { contentKeys } from '../../content.queries'
import { adminContentKeys } from '../../publish/publish.queries'

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      void queryClient.invalidateQueries({ queryKey: contentKeys.all })
      void queryClient.invalidateQueries({ queryKey: adminContentKeys.all })
    },
  })
}

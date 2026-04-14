import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCategory } from '../categories.service'
import { categoryKeys } from '../categories.queries'
import { contentKeys } from '../../content.queries'
import { adminContentKeys } from '../../publish/publish.queries'
import type { CategoryInput } from '../types'

interface UpdateCategoryVariables {
  id: string
  input: CategoryInput
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: UpdateCategoryVariables) =>
      updateCategory(variables.id, variables.input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      void queryClient.invalidateQueries({ queryKey: contentKeys.all })
      void queryClient.invalidateQueries({ queryKey: adminContentKeys.all })
    },
  })
}

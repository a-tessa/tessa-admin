import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUser } from '../services/users.service'
import { userKeys } from '../users.queries'
import type { UpdateUserInput } from '../types'

interface UpdateUserVariables {
  id: string
  input: UpdateUserInput
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: UpdateUserVariables) => updateUser(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}

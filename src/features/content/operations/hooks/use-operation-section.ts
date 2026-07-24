import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contentKeys } from '@/features/content/content.queries'
import { adminContentKeys } from '@/features/content/publish/publish.queries'
import { operationKeys, operationSectionQuery } from '../operations.queries'
import {
  createOperationSection,
  deleteOperationSection,
  updateOperationSection,
} from '../operations.service'
import type { OperationSection } from '../types'

function useInvalidateOperationContent(): () => Promise<void> {
  const queryClient = useQueryClient()

  return async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: operationKeys.all }),
      queryClient.invalidateQueries({ queryKey: contentKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminContentKeys.all }),
    ])
  }
}

export function useOperationSection() {
  return useQuery(operationSectionQuery())
}

export function useSaveOperationSection(hasSection: boolean) {
  const invalidateOperationContent = useInvalidateOperationContent()

  return useMutation({
    mutationFn: (input: OperationSection) =>
      hasSection
        ? updateOperationSection(input)
        : createOperationSection(input),
    onSuccess: invalidateOperationContent,
  })
}

export function useDeleteOperationSection() {
  const invalidateOperationContent = useInvalidateOperationContent()

  return useMutation({
    mutationFn: deleteOperationSection,
    onSuccess: invalidateOperationContent,
  })
}

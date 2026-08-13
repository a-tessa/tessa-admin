import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contentKeys } from '@/features/content/content.queries'
import { adminContentKeys } from '@/features/content/publish/publish.queries'
import {
  companyInformationKeys,
  companyInformationQuery,
} from '../company-information.queries'
import {
  createCompanyInformation,
  deleteCompanyInformation,
  updateCompanyInformation,
} from '../company-information.service'
import type { CompanyInformation } from '../types'

function useInvalidateCompanyInformation(): () => Promise<void> {
  const queryClient = useQueryClient()

  return async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: companyInformationKeys.all }),
      queryClient.invalidateQueries({ queryKey: contentKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminContentKeys.all }),
    ])
  }
}

export function useCompanyInformation() {
  return useQuery(companyInformationQuery())
}

export function useSaveCompanyInformation(hasSection: boolean) {
  const invalidateCompanyInformation = useInvalidateCompanyInformation()

  return useMutation({
    mutationFn: (input: CompanyInformation) =>
      hasSection
        ? updateCompanyInformation(input)
        : createCompanyInformation(input),
    onSuccess: invalidateCompanyInformation,
  })
}

export function useDeleteCompanyInformation() {
  const invalidateCompanyInformation = useInvalidateCompanyInformation()

  return useMutation({
    mutationFn: deleteCompanyInformation,
    onSuccess: invalidateCompanyInformation,
  })
}

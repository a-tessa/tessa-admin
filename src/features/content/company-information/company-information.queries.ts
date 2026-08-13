import { queryOptions } from '@tanstack/react-query'
import { fetchCompanyInformation } from './company-information.service'

export const companyInformationKeys = {
  all: ['content', 'company-information'] as const,
  detail: () => [...companyInformationKeys.all, 'detail'] as const,
}

export function companyInformationQuery() {
  return queryOptions({
    queryKey: companyInformationKeys.detail(),
    queryFn: fetchCompanyInformation,
  })
}

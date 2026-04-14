export { useServices } from './hooks/use-services'
export { useService } from './hooks/use-service'
export { useCreateService } from './hooks/use-create-service'
export { useUpdateService } from './hooks/use-update-service'
export { useDeleteService } from './hooks/use-delete-service'

export { serviceKeys, servicesListQuery, serviceDetailQuery } from './services.queries'

export type {
  ServicePage,
  ServicePageFormPayload,
  ServicePageFormData,
  ServicePagesResponse,
  ServicePageItemResponse,
} from './types'

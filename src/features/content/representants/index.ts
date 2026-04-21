export { useRepresentants } from './hooks/use-representants'
export { useRepresentantSegments } from './hooks/use-representant-segments'
export { useCreateRepresentant } from './hooks/use-create-representant'
export { useUpdateRepresentant } from './hooks/use-update-representant'
export { useDeleteRepresentant } from './hooks/use-delete-representant'

export {
  representantKeys,
  representantsListQuery,
  representantDetailQuery,
  representantSegmentsQuery,
} from './representants.queries'

export type {
  Representant,
  RepresentantInput,
  RepresentantsResponse,
  RepresentantItemResponse,
  RepresentantSegmentsResponse,
} from './types'

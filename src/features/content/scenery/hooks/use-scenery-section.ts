import { useQuery } from '@tanstack/react-query'
import { scenerySectionQuery } from '../scenery.queries'

export function useScenerySection() {
  return useQuery(scenerySectionQuery())
}

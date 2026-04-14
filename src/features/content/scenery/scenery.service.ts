import { authenticatedRequest } from '@/shared/lib/api'
import type { ScenerySectionResponse } from './types'

const BASE_PATH = '/api/content/admin/scenery-section'

export async function fetchScenerySection(): Promise<ScenerySectionResponse> {
  return authenticatedRequest<ScenerySectionResponse>(BASE_PATH)
}

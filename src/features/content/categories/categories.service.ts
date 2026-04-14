import { authenticatedRequest } from '@/shared/lib/api'
import type {
  CategoriesResponse,
  CategoryInput,
  CategoryItemResponse,
} from './types'

const BASE_PATH = '/api/content/admin/categories'

export async function fetchCategories(): Promise<CategoriesResponse> {
  return authenticatedRequest<CategoriesResponse>(BASE_PATH)
}

export async function fetchCategory(id: string): Promise<CategoryItemResponse> {
  return authenticatedRequest<CategoryItemResponse>(`${BASE_PATH}/${id}`)
}

export async function createCategory(input: CategoryInput): Promise<CategoryItemResponse> {
  return authenticatedRequest<CategoryItemResponse>(BASE_PATH, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<CategoryItemResponse> {
  return authenticatedRequest<CategoryItemResponse>(`${BASE_PATH}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function deleteCategory(id: string): Promise<void> {
  await authenticatedRequest<void>(`${BASE_PATH}/${id}`, {
    method: 'DELETE',
  })
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface CategoryInput {
  name: string
  slug: string
}

export interface CategoriesResponse {
  categories: Category[]
}

export interface CategoryItemResponse {
  item: Category
}

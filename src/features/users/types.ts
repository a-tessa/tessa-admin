import type { UserRole } from '@/features/auth/types'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PaginationParams {
  page: number
  perPage: number
}

export interface PaginationMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface FetchUsersResponse {
  users: User[]
  pagination: PaginationMeta
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
}

export interface CreateUserResponse {
  user: User
}

export interface UpdateUserStatusResponse {
  user: User
}

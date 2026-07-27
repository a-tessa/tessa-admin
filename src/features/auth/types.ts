export type UserRole = 'MASTER' | 'ADMIN'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  cpf?: string | null
  phone?: string | null
  avatarUrl?: string | null
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  user: AuthUser
  accessToken: string
}

export interface MeResponse {
  user: AuthUser | null
}

export interface MessageResponse {
  message: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export interface ForgotPasswordInput {
  email: string
}

export interface ResetPasswordInput {
  token: string
  newPassword: string
}

export type AuthStatus = 'checking' | 'authenticated' | 'anonymous'

export interface AuthSession {
  accessToken: string
  user: AuthUser
}

export interface AuthContextValue {
  status: AuthStatus
  session: AuthSession | null
  signIn: (credentials: LoginCredentials) => Promise<AuthUser>
  signOut: () => void
  refreshUser: () => Promise<AuthUser | null>
  updateSessionUser: (user: AuthUser) => void
}

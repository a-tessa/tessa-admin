export type UserRole = 'MASTER' | 'ADMIN'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
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
}

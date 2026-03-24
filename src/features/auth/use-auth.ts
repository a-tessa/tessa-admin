import { useContext } from 'react'
import { AuthContext } from '@/features/auth/auth-context-instance'

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider.')
  }

  return context
}

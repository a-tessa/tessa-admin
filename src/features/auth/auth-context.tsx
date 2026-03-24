import type { PropsWithChildren } from 'react'
import { useEffect, useState } from 'react'
import { getCurrentUser, login } from '@/features/auth/api'
import { AuthContext } from '@/features/auth/auth-context-instance'
import { clearStoredAccessToken, readStoredAccessToken, writeStoredAccessToken } from '@/features/auth/auth-storage'
import type { AuthSession, AuthStatus, LoginCredentials } from '@/features/auth/types'

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [status, setStatus] = useState<AuthStatus>(() =>
    readStoredAccessToken() ? 'checking' : 'anonymous',
  )

  useEffect(() => {
    const accessToken = readStoredAccessToken()

    if (accessToken === null) {
      return
    }

    const storedAccessToken = accessToken

    let cancelled = false

    async function restoreSession() {
      try {
        const response = await getCurrentUser(storedAccessToken)

        if (cancelled) {
          return
        }

        if (!response.user) {
          clearStoredAccessToken()
          setSession(null)
          setStatus('anonymous')
          return
        }

        setSession({
          accessToken: storedAccessToken,
          user: response.user,
        })
        setStatus('authenticated')
      } catch {
        clearStoredAccessToken()

        if (cancelled) {
          return
        }

        setSession(null)
        setStatus('anonymous')
      }
    }

    void restoreSession()

    return () => {
      cancelled = true
    }
  }, [])

  async function signIn(credentials: LoginCredentials) {
    const response = await login(credentials)

    writeStoredAccessToken(response.accessToken)
    setSession({
      accessToken: response.accessToken,
      user: response.user,
    })
    setStatus('authenticated')

    return response.user
  }

  function signOut() {
    clearStoredAccessToken()
    setSession(null)
    setStatus('anonymous')
  }

  return (
    <AuthContext.Provider
      value={{
        status,
        session,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

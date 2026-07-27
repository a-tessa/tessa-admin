import type { ChangeEvent, SyntheticEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, Navigate, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react'
import { startTransition, useState, useTransition } from 'react'
import type { LoginCredentials } from '@/features/auth/types'
import { AuthScreenLayout } from '@/features/auth/components/AuthScreenLayout'
import { useAuth } from '@/features/auth/use-auth'
import { Button } from '@/shared/components/ui/button'
import { FloatingInput } from '@/shared/components/ui/floating-input'
import { ApiError } from '@/shared/lib/api'
import { cn } from '@/shared/lib/utils'

const initialCredentials: LoginCredentials = {
  email: '',
  password: '',
}

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, status } = useAuth()
  const [credentials, setCredentials] = useState(initialCredentials)
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startSubmitting] = useTransition()
  const signInMutation = useMutation({
    mutationFn: signIn,
    onSuccess: () => {
      startTransition(() => {
        void navigate({ to: '/dashboard' })
      })
    },
  })

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />
  }

  function handleInputChange(field: keyof LoginCredentials) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      setCredentials((current) => ({ ...current, [field]: value }))
    }
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    startSubmitting(() => {
      signInMutation.reset()
      signInMutation.mutate(credentials)
    })
  }

  const isSubmitting = isPending || signInMutation.isPending

  const errorMessage =
    signInMutation.error instanceof ApiError
      ? signInMutation.error.message
      : signInMutation.error
        ? 'Não foi possível autenticar com a API.'
        : null

  return (
    <AuthScreenLayout
      title="Entrar no painel"
      description="Informe suas credenciais de administrador para acessar."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FloatingInput
          id="email"
          type="email"
          label="Email"
          value={credentials.email}
          onChange={handleInputChange('email')}
          autoComplete="email"
          required
        />

        <FloatingInput
          id="password"
          type={showPassword ? 'text' : 'password'}
          label="Senha"
          value={credentials.password}
          onChange={handleInputChange('password')}
          autoComplete="current-password"
          required
          endAdornment={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </Button>
          }
        />

        <div className="flex justify-end">
          <Link
            to="/esqueci-senha"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>

        <div
          className={cn(
            'overflow-hidden rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive transition-all',
            errorMessage ? 'max-h-24 opacity-100' : 'max-h-0 border-0 py-0 opacity-0',
          )}
          role="alert"
        >
          {errorMessage}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full gap-2"
          size="lg"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <KeyRound className="size-4" />
          )}
          {isSubmitting ? 'Autenticando...' : 'Entrar'}
        </Button>
      </form>
    </AuthScreenLayout>
  )
}

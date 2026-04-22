import type { ChangeEvent, SyntheticEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Navigate, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react'
import { startTransition, useState, useTransition } from 'react'
import type { LoginCredentials } from '@/features/auth/types'
import { useAuth } from '@/features/auth/use-auth'
import { TessaLogo } from '@/shared/components/tessa-logo'
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
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* ---- painel esquerdo (branding) ---- */}
      <div className="relative hidden overflow-hidden bg-foreground lg:block">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, oklch(0.53 0.12 163 / 0.55), transparent 50%), radial-gradient(circle at 80% 75%, oklch(0.6 0.19 230 / 0.3), transparent 50%)',
          }}
        />

        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'120\' height=\'120\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h1v1H0z\' fill=\'%23fff\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />

        <div className="relative flex h-full flex-col justify-between p-10 text-primary-foreground xl:p-16">
          <TessaLogo className="h-15 text-white" />

          <div className="max-w-lg my-auto mx-auto">
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight xl:text-5xl">
              Gerencie conteúdo e&nbsp;usuários em um só lugar.
            </h1>
          </div>
        </div>
      </div>

      {/* ---- painel direito (formulário) ---- */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <TessaLogo className="h-7 text-foreground lg:hidden" />

          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Entrar no painel
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Informe suas credenciais de administrador para acessar.
            </p>
          </div>

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
        </div>
      </div>
    </div>
  )
}

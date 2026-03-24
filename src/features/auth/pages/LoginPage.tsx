import type { ChangeEvent, SyntheticEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Navigate, useNavigate } from '@tanstack/react-router'
import { KeyRound, Loader2 } from 'lucide-react'
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

        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h1v1H0z\' fill=\'%23fff\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />

        <div className="relative flex h-full flex-col justify-between p-10 text-primary-foreground xl:p-16">
          <TessaLogo className="h-7 text-white" />

          <div className="max-w-lg">
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight xl:text-5xl">
              Gerencie conteúdo e&nbsp;usuários em um só lugar.
            </h1>
            <p className="mt-6 text-base leading-7 text-primary-foreground/70">
              Painel administrativo conectado à API Tessa com autenticação JWT, fluxo draft/publish e controle de permissões MASTER&thinsp;/&thinsp;ADMIN.
            </p>
          </div>

          <div className="flex items-center gap-8 text-sm text-primary-foreground/50">
            <span>JWT Auth</span>
            <span className="size-1 rounded-full bg-primary-foreground/20" />
            <span>Draft &rarr; Publish</span>
            <span className="size-1 rounded-full bg-primary-foreground/20" />
            <span>Role-based access</span>
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
              type="password"
              label="Senha"
              value={credentials.password}
              onChange={handleInputChange('password')}
              autoComplete="current-password"
              required
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

          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-xs font-medium text-foreground">Primeiro acesso?</p>
            <ol className="mt-2 space-y-1 text-xs leading-5 text-muted-foreground">
              <li>1. Suba a API em <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-foreground">localhost:3002</code></li>
              <li>2. Execute o bootstrap do usuário master</li>
              <li>3. Faça login com as credenciais criadas</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

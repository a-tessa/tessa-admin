import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, Navigate, useSearch } from '@tanstack/react-router'
import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { resetPassword } from '@/features/auth/api'
import { AuthScreenLayout } from '@/features/auth/components/AuthScreenLayout'
import { useAuth } from '@/features/auth/use-auth'
import { Button } from '@/shared/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/shared/components/ui/form'
import { FloatingInput } from '@/shared/components/ui/floating-input'
import { ApiError } from '@/shared/lib/api'
import { cn } from '@/shared/lib/utils'

const resetSchema = z
  .object({
    newPassword: z.string().min(8, 'Senha precisa ter ao menos 8 caracteres.'),
    confirmPassword: z.string().min(8, 'Confirme a nova senha.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

type ResetFormValues = z.infer<typeof resetSchema>

export function ResetPasswordPage() {
  const { status } = useAuth()
  const { token } = useSearch({ from: '/redefinir-senha' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  const mutation = useMutation({
    mutationFn: resetPassword,
  })

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />
  }

  if (!token) {
    return (
      <AuthScreenLayout
        title="Link inválido"
        description="Este link de redefinição está incompleto ou expirado."
        footer={
          <p className="text-center text-sm text-muted-foreground">
            <Link
              to="/esqueci-senha"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Solicitar um novo link
            </Link>
          </p>
        }
      >
        <Button className="h-12 w-full" size="lg" asChild>
          <Link to="/login">Voltar ao login</Link>
        </Button>
      </AuthScreenLayout>
    )
  }

  function handleSubmit(values: ResetFormValues) {
    mutation.mutate({
      token,
      newPassword: values.newPassword,
    })
  }

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? 'Não foi possível redefinir a senha.'
        : null

  return (
    <AuthScreenLayout
      title="Redefinir senha"
      description="Escolha uma nova senha para acessar o painel administrativo."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Voltar ao login
          </Link>
        </p>
      }
    >
      {mutation.isSuccess ? (
        <div className="space-y-4 rounded-lg border bg-card px-4 py-5 text-sm">
          <p className="font-medium text-foreground">{mutation.data.message}</p>
          <Button className="w-full" asChild>
            <Link to="/login">Entrar</Link>
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingInput
                      id="reset-password"
                      type={showPassword ? 'text' : 'password'}
                      label="Nova senha"
                      autoComplete="new-password"
                      required
                      endAdornment={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword((current) => !current)}
                          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </Button>
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingInput
                      id="reset-confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      label="Confirmar nova senha"
                      autoComplete="new-password"
                      required
                      endAdornment={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => setShowConfirm((current) => !current)}
                          aria-label={
                            showConfirm ? 'Ocultar confirmação' : 'Mostrar confirmação'
                          }
                        >
                          {showConfirm ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </Button>
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
              disabled={mutation.isPending}
              className="h-12 w-full gap-2"
              size="lg"
            >
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <KeyRound className="size-4" />
              )}
              {mutation.isPending ? 'Salvando...' : 'Redefinir senha'}
            </Button>
          </form>
        </Form>
      )}
    </AuthScreenLayout>
  )
}

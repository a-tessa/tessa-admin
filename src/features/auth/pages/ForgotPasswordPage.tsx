import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, Navigate } from '@tanstack/react-router'
import { Loader2, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { forgotPassword } from '@/features/auth/api'
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

const forgotSchema = z.object({
  email: z.email('Email inválido.'),
})

type ForgotFormValues = z.infer<typeof forgotSchema>

export function ForgotPasswordPage() {
  const { status } = useAuth()
  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  })

  const mutation = useMutation({
    mutationFn: forgotPassword,
  })

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />
  }

  function handleSubmit(values: ForgotFormValues) {
    mutation.mutate({ email: values.email })
  }

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? 'Não foi possível solicitar a redefinição.'
        : null

  return (
    <AuthScreenLayout
      title="Esqueci minha senha"
      description="Informe o e-mail da sua conta. Se estiver cadastrado, enviaremos um link para redefinir a senha."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Lembrou a senha?{' '}
          <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Voltar ao login
          </Link>
        </p>
      }
    >
      {mutation.isSuccess ? (
        <div className="space-y-4 rounded-lg border bg-card px-4 py-5 text-sm">
          <p className="font-medium text-foreground">{mutation.data.message}</p>
          <p className="text-muted-foreground">
            Verifique sua caixa de entrada e o spam. O link expira em 1 hora.
          </p>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/login">Voltar ao login</Link>
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingInput
                      id="forgot-email"
                      type="email"
                      label="Email"
                      autoComplete="email"
                      required
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
                <Mail className="size-4" />
              )}
              {mutation.isPending ? 'Enviando...' : 'Enviar link'}
            </Button>
          </form>
        </Form>
      )}
    </AuthScreenLayout>
  )
}

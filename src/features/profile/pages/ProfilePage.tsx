import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAuth } from '@/features/auth/use-auth'
import { ProfileAvatarField } from '@/features/profile/components/ProfileAvatarField'
import { useUpdateProfile } from '@/features/profile/hooks/use-update-profile'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'

const profileSchema = z.object({
  name: z.string().min(2, 'Nome precisa ter ao menos 2 caracteres.'),
  email: z.email('Email inválido.'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function ProfilePage() {
  const { session, status, updateSessionUser } = useAuth()
  const updateMutation = useUpdateProfile()
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [removeAvatar, setRemoveAvatar] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  })

  useEffect(() => {
    if (!session?.user) return

    form.reset({
      name: session.user.name,
      email: session.user.email,
    })
    setAvatarFile(null)
    setRemoveAvatar(false)
  }, [session?.user, form])

  function handleSubmit(values: ProfileFormValues) {
    updateMutation.mutate(
      {
        name: values.name,
        email: values.email,
        avatar: avatarFile,
        removeAvatar,
      },
      {
        onSuccess: (response) => {
          if (response.user) {
            updateSessionUser(response.user)
          }
          setAvatarFile(null)
          setRemoveAvatar(false)
          toast.success('Perfil atualizado com sucesso.')
        },
        onError: (error) => {
          toast.error(error.message)
        },
      },
    )
  }

  if (status === 'checking') {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const user = session?.user

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Meu perfil</h2>
        <p className="text-sm text-muted-foreground">
          Atualize sua foto, nome e email de acesso.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <UserRound className="size-5 text-primary" />
            </div>
            <div>
              <CardTitle>Informações pessoais</CardTitle>
              <CardDescription>
                Esses dados aparecem no painel e identificam você no sistema.
              </CardDescription>
            </div>
            {user ? (
              <Badge variant="secondary" className="ml-auto uppercase">
                {user.role}
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <ProfileAvatarField
                name={form.watch('name') || user?.name || ''}
                currentAvatarUrl={user?.avatarUrl ?? null}
                disabled={updateMutation.isPending}
                onFileChange={(file) => {
                  setAvatarFile(file)
                  if (file) setRemoveAvatar(false)
                }}
                onRemoveCurrent={() => setRemoveAvatar(true)}
                removeCurrent={removeAvatar}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
                  {updateMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Salvar alterações
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

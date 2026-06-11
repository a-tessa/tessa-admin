import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ProfileAvatarField } from '@/features/profile/components/ProfileAvatarField'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import type { User } from '../types'

const editUserSchema = z.object({
  name: z.string().min(2, 'Nome precisa ter ao menos 2 caracteres.'),
  email: z.email('Email inválido.'),
})

type EditUserFormValues = z.infer<typeof editUserSchema>

export interface UserEditSubmitData {
  name: string
  email: string
  avatar: File | null
  removeAvatar: boolean
}

interface UserEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  isPending: boolean
  onSubmit: (data: UserEditSubmitData) => void
}

export function UserEditDialog({
  open,
  onOpenChange,
  user,
  isPending,
  onSubmit,
}: UserEditDialogProps) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [removeAvatar, setRemoveAvatar] = useState(false)

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  })

  useEffect(() => {
    if (!open || !user) return

    form.reset({
      name: user.name,
      email: user.email,
    })
    setAvatarFile(null)
    setRemoveAvatar(false)
  }, [open, user, form])

  function handleSubmit(values: EditUserFormValues) {
    onSubmit({
      name: values.name,
      email: values.email,
      avatar: avatarFile,
      removeAvatar,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar usuário</DialogTitle>
          <DialogDescription>
            Atualize a foto, nome e email do usuário selecionado.
          </DialogDescription>
        </DialogHeader>

        {user ? (
          <div className="flex items-center gap-2">
            <Badge variant={user.role === 'MASTER' ? 'default' : 'secondary'}>
              {user.role === 'MASTER' ? 'Master' : 'Admin'}
            </Badge>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        ) : null}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <ProfileAvatarField
              name={form.watch('name') || user?.name || ''}
              currentAvatarUrl={user?.avatarUrl ?? null}
              disabled={isPending}
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
                    <Input placeholder="Nome completo" {...field} />
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
                    <Input type="email" placeholder="admin@tessa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

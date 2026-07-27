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
import {
  formatBrazilPhoneDisplay,
  formatCpfDisplay,
  isValidBrazilPhone,
  isValidCpf,
  normalizeBrazilPhoneDigits,
  normalizeCpfDigits,
} from '@/shared/lib/brazil-ids'
import type { User } from '../types'

const editUserSchema = z.object({
  name: z.string().min(2, 'Nome precisa ter ao menos 2 caracteres.'),
  email: z.email('Email inválido.'),
  cpf: z
    .string()
    .refine(
      (value) => value.trim().length === 0 || isValidCpf(value),
      'CPF inválido.',
    ),
  phone: z
    .string()
    .refine(
      (value) => value.trim().length === 0 || isValidBrazilPhone(value),
      'Telefone inválido.',
    ),
})

type EditUserFormValues = z.infer<typeof editUserSchema>

export interface UserEditSubmitData {
  name: string
  email: string
  cpf: string
  phone: string
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
      cpf: '',
      phone: '',
    },
  })

  useEffect(() => {
    if (!open || !user) return

    form.reset({
      name: user.name,
      email: user.email,
      cpf: user.cpf ? formatCpfDisplay(user.cpf) : '',
      phone: user.phone ? formatBrazilPhoneDisplay(user.phone) : '',
    })
    setAvatarFile(null)
    setRemoveAvatar(false)
  }, [open, user, form])

  function handleSubmit(values: EditUserFormValues) {
    onSubmit({
      name: values.name,
      email: values.email,
      cpf: values.cpf.trim().length > 0 ? normalizeCpfDigits(values.cpf) : '',
      phone:
        values.phone.trim().length > 0
          ? formatBrazilPhoneDisplay(values.phone)
          : '',
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
            Atualize a foto, nome, email, CPF e telefone do usuário selecionado.
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

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="000.000.000-00"
                        {...field}
                        onChange={(event) => {
                          field.onChange(formatCpfDisplay(event.target.value))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="(00) 00000-0000"
                        {...field}
                        onChange={(event) => {
                          field.onChange(
                            formatBrazilPhoneDisplay(
                              normalizeBrazilPhoneDigits(event.target.value),
                            ),
                          )
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

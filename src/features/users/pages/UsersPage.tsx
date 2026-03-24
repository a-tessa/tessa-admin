import { Loader2, Plus, ShieldCheck, UserPlus, Users } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/features/auth/use-auth'
import { useCreateUser } from '@/features/users/hooks/use-create-user'
import { useToggleUserStatus } from '@/features/users/hooks/use-toggle-user-status'
import { useUsers } from '@/features/users/hooks/use-users'
import type { UserRole } from '@/features/auth/types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Switch } from '@/shared/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { formatDateTime } from '@/shared/lib/format'

const roleBadgeConfig: Record<UserRole, { label: string; variant: 'default' | 'secondary' }> = {
  MASTER: { label: 'Master', variant: 'default' },
  ADMIN: { label: 'Admin', variant: 'secondary' },
}

const createUserSchema = z.object({
  name: z.string().min(2, 'Nome precisa ter ao menos 2 caracteres.'),
  email: z.email('Email inválido.'),
  password: z.string().min(8, 'Senha precisa ter ao menos 8 caracteres.'),
})

type CreateUserFormValues = z.infer<typeof createUserSchema>

export function UsersPage() {
  const { session } = useAuth()
  const [page, setPage] = useState(1)
  const perPage = 20
  const usersQuery = useUsers(page, perPage)
  const createMutation = useCreateUser()
  const toggleStatusMutation = useToggleUserStatus()
  const [dialogOpen, setDialogOpen] = useState(false)
  const isMaster = session?.user.role === 'MASTER'

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  function handleCreateUser(values: CreateUserFormValues) {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success('Usuário criado com sucesso.')
        form.reset()
        setDialogOpen(false)
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  function handleToggleStatus(userId: string, currentActive: boolean) {
    toggleStatusMutation.mutate(
      { id: userId, isActive: !currentActive },
      {
        onSuccess: (data) => {
          toast.success(
            data.user.isActive ? 'Usuário ativado.' : 'Usuário desativado.',
          )
        },
        onError: (error) => {
          toast.error(error.message)
        },
      },
    )
  }

  if (!isMaster) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center text-muted-foreground">
        <ShieldCheck className="size-12" />
        <div>
          <p className="text-lg font-semibold text-foreground">Acesso restrito</p>
          <p className="text-sm">Apenas usuários com papel MASTER podem gerenciar admins.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Usuários</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os administradores do sistema.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Novo admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar administrador</DialogTitle>
              <DialogDescription>
                O novo usuário será criado com o papel ADMIN.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateUser)} className="space-y-4">
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
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Mínimo 8 caracteres" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} className="gap-2">
                    {createMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <UserPlus className="size-4" />
                    )}
                    Criar
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead>Criado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersQuery.isPending ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))
            ) : null}

            {usersQuery.isSuccess && usersQuery.data.users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Users className="size-8" />
                    <p>Nenhum usuário encontrado.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : null}

            {usersQuery.data?.users.map((user) => {
              const roleConfig = roleBadgeConfig[user.role]
              const isMasterUser = user.role === 'MASTER'
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleConfig.variant}>{roleConfig.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={user.isActive}
                      disabled={isMasterUser || toggleStatusMutation.isPending}
                      onCheckedChange={() => handleToggleStatus(user.id, user.isActive)}
                      aria-label={user.isActive ? 'Desativar usuário' : 'Ativar usuário'}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(user.createdAt)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {usersQuery.isSuccess && usersQuery.data.pagination.totalPages > 1 ? (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {usersQuery.data.pagination.total} usuário(s) no total
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= usersQuery.data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

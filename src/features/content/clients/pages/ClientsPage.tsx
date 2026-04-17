import {
  Building2,
  ExternalLink,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useClients } from '../hooks/use-clients'
import { useCreateClient } from '../hooks/use-create-client'
import { useUpdateClient } from '../hooks/use-update-client'
import { useDeleteClient } from '../hooks/use-delete-client'
import { ClientFormDialog } from '../components/ClientFormDialog'
import type { ClientFormData, ClientLogo } from '../types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

export function ClientsPage() {
  const clientsQuery = useClients()
  const createMutation = useCreateClient()
  const updateMutation = useUpdateClient()
  const deleteMutation = useDeleteClient()

  const [formOpen, setFormOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientLogo | undefined>(
    undefined,
  )
  const [deletingClient, setDeletingClient] = useState<ClientLogo | null>(null)

  const clients = clientsQuery.data?.clients
  const hasClients = clients && clients.length > 0
  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  function openCreate() {
    setEditingClient(undefined)
    setFormOpen(true)
  }

  function openEdit(client: ClientLogo) {
    setEditingClient(client)
    setFormOpen(true)
  }

  function handleFormSubmit(data: ClientFormData) {
    if (editingClient) {
      updateMutation.mutate(
        { id: editingClient.id, data },
        {
          onSuccess: () => {
            toast.success('Cliente atualizado.')
            setFormOpen(false)
          },
          onError: (error) => toast.error(error.message),
        },
      )
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success('Cliente criado.')
          setFormOpen(false)
        },
        onError: (error) => toast.error(error.message),
      })
    }
  }

  function handleDelete() {
    if (!deletingClient) return

    deleteMutation.mutate(deletingClient.id, {
      onSuccess: () => {
        toast.success('Cliente removido.')
        setDeletingClient(null)
      },
      onError: (error) => toast.error(error.message),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Clientes</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os logos de clientes exibidos no carrossel da landing.
          </p>
        </div>

        <Button className="gap-2" onClick={openCreate} disabled={isMutating}>
          <Plus className="size-4" />
          Novo cliente
        </Button>
      </div>

      {clientsQuery.isPending ? (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Logo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Texto alternativo</TableHead>
                <TableHead>Site</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-10 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {clientsQuery.isError ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Erro ao carregar</CardTitle>
            <CardDescription>{clientsQuery.error.message}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {clientsQuery.isSuccess && !hasClients ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Building2 className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum cliente cadastrado.</p>
            <Button className="mt-2 gap-2" onClick={openCreate}>
              <Plus className="size-4" />
              Criar cliente
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {hasClients ? (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Logo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Texto alternativo</TableHead>
                <TableHead>Site</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex h-10 w-16 items-center justify-center overflow-hidden rounded border bg-muted">
                      <img
                        src={client.logoUrl}
                        alt={client.alt}
                        className="max-h-full max-w-full object-contain p-1"
                        loading="lazy"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.alt}
                  </TableCell>
                  <TableCell>
                    {client.website ? (
                      <a
                        href={client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <span className="max-w-[200px] truncate">
                          {client.website}
                        </span>
                        <ExternalLink className="size-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(client)}>
                          <Pencil className="mr-2 size-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingClient(client)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 size-4" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {String(clients.length)} cliente(s) no total
            </p>
          </div>
        </div>
      ) : null}

      <ClientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        client={editingClient}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog
        open={deletingClient !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingClient(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              O logo de <strong>{deletingClient?.name}</strong> será removido do
              rascunho e o arquivo deletado do armazenamento. Publique para
              refletir no site.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

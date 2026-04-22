import {
  Handshake,
  Loader2,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { RepresentantFormDialog } from '../components/RepresentantFormDialog'
import { BRAZILIAN_STATES, getStateName } from '../constants'
import { useCreateRepresentant } from '../hooks/use-create-representant'
import { useDeleteRepresentant } from '../hooks/use-delete-representant'
import { useRepresentants } from '../hooks/use-representants'
import { useUpdateRepresentant } from '../hooks/use-update-representant'
import type { Representant, RepresentantInput } from '../types'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

const ALL_STATES_VALUE = '__all__'

export function RepresentantsPage() {
  const representantsQuery = useRepresentants()
  const createMutation = useCreateRepresentant()
  const updateMutation = useUpdateRepresentant()
  const deleteMutation = useDeleteRepresentant()

  const [formOpen, setFormOpen] = useState(false)
  const [editingRepresentant, setEditingRepresentant] = useState<
    Representant | undefined
  >(undefined)
  const [deletingRepresentant, setDeletingRepresentant] =
    useState<Representant | null>(null)
  const [stateFilter, setStateFilter] = useState(ALL_STATES_VALUE)

  const representants = representantsQuery.data?.representantsBase
  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  const availableStateCodes = useMemo(() => {
    if (!representants) return new Set<string>()
    const codes = new Set<string>()
    for (const representant of representants) {
      const code = representant.state.trim()
      if (code.length > 0) {
        codes.add(code)
      }
    }
    return codes
  }, [representants])

  const filteredRepresentants = useMemo(() => {
    if (!representants) return []
    if (stateFilter === ALL_STATES_VALUE) return representants
    return representants.filter(
      (representant) => representant.state === stateFilter,
    )
  }, [representants, stateFilter])

  const hasRepresentants = representants !== undefined && representants.length > 0
  const hasFilteredRepresentants = filteredRepresentants.length > 0

  function openCreate() {
    setEditingRepresentant(undefined)
    setFormOpen(true)
  }

  function openEdit(representant: Representant) {
    setEditingRepresentant(representant)
    setFormOpen(true)
  }

  function handleFormSubmit(input: RepresentantInput) {
    if (editingRepresentant) {
      updateMutation.mutate(
        { id: editingRepresentant.id, input },
        {
          onSuccess: () => {
            toast.success('Representante atualizado.')
            setFormOpen(false)
          },
          onError: (error) => toast.error(error.message),
        },
      )
    } else {
      createMutation.mutate(input, {
        onSuccess: () => {
          toast.success('Representante criado.')
          setFormOpen(false)
        },
        onError: (error) => toast.error(error.message),
      })
    }
  }

  function handleDelete() {
    if (!deletingRepresentant) return

    deleteMutation.mutate(deletingRepresentant.id, {
      onSuccess: () => {
        toast.success('Representante removido.')
        setDeletingRepresentant(null)
      },
      onError: (error) => toast.error(error.message),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Representantes
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie a base de representantes exibida nos canais Tessa.
          </p>
        </div>

        <Button className="gap-2" onClick={openCreate} disabled={isMutating}>
          <Plus className="size-4" />
          Novo representante
        </Button>
      </div>

      {hasRepresentants ? (
        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor="representants-state-filter"
            className="text-sm font-medium text-muted-foreground"
          >
            Filtrar por estado
          </label>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger
              id="representants-state-filter"
              className="w-[240px]"
            >
              <SelectValue placeholder="Todos os estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATES_VALUE}>
                Todos os estados
              </SelectItem>
              {BRAZILIAN_STATES.filter((state) =>
                availableStateCodes.has(state.code),
              ).map((state) => (
                <SelectItem key={state.code} value={state.code}>
                  {state.code} — {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {stateFilter !== ALL_STATES_VALUE ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStateFilter(ALL_STATES_VALUE)}
            >
              Limpar filtro
            </Button>
          ) : null}
        </div>
      ) : null}

      {representantsQuery.isPending ? (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Cidade / UF</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {representantsQuery.isError ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Erro ao carregar</CardTitle>
            <CardDescription>
              {representantsQuery.error.message}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {representantsQuery.isSuccess && !hasRepresentants ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Handshake className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              Nenhum representante cadastrado.
            </p>
            <Button className="mt-2 gap-2" onClick={openCreate}>
              <Plus className="size-4" />
              Cadastrar representante
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {hasRepresentants ? (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Cidade / UF</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {hasFilteredRepresentants ? (
                filteredRepresentants.map((representant) => (
                  <TableRow key={representant.id}>
                    <TableCell className="font-medium">
                      {representant.name}
                    </TableCell>
                    <TableCell>{representant.companyName || '—'}</TableCell>
                    <TableCell>
                      {representant.segment ? (
                        <Badge variant="secondary" className="font-normal">
                          {representant.segment}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        <a
                          href={`mailto:${representant.email}`}
                          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                        >
                          <Mail className="size-3.5" />
                          <span className="truncate">{representant.email}</span>
                        </a>
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="size-3.5" />
                          {representant.phone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-sm">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="size-3.5" />
                          {representant.city}
                        </span>
                        {representant.state ? (
                          <span
                            className="pl-5 text-xs text-muted-foreground"
                            title={getStateName(representant.state)}
                          >
                            {representant.state} —{' '}
                            {getStateName(representant.state)}
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEdit(representant)}
                          >
                            <Pencil className="mr-2 size-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setDeletingRepresentant(representant)
                            }
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 size-4" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Nenhum representante encontrado para o estado selecionado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {stateFilter === ALL_STATES_VALUE
                ? `${String(representants.length)} representante(s) no total`
                : `${String(filteredRepresentants.length)} de ${String(representants.length)} representante(s)`}
            </p>
          </div>
        </div>
      ) : null}

      <RepresentantFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        representant={editingRepresentant}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog
        open={deletingRepresentant !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingRepresentant(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover representante?</AlertDialogTitle>
            <AlertDialogDescription>
              O representante <strong>{deletingRepresentant?.name}</strong> será
              removido permanentemente da base.
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

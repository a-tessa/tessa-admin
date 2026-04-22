import {
  Building2,
  CheckCircle2,
  Clock,
  Inbox,
  Mail,
  MapPin,
  Phone,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useContactStats } from '../hooks/use-contact-stats'
import { useContacts } from '../hooks/use-contacts'
import { useDeleteContact } from '../hooks/use-delete-contact'
import { useUpdateContactStatus } from '../hooks/use-update-contact-status'
import type { AdminContact } from '../types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Label } from '@/shared/components/ui/label'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Switch } from '@/shared/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { formatDateTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'

type StatusFilter = 'pending' | 'contacted' | 'all'

interface StatusTab {
  readonly value: StatusFilter
  readonly label: string
}

const statusTabs: readonly StatusTab[] = [
  { value: 'pending', label: 'Pendentes' },
  { value: 'contacted', label: 'Contatados' },
  { value: 'all', label: 'Todos' },
]

const PER_PAGE = 24

function buildMailtoHref(contact: AdminContact): string {
  const subject = `Contato Tessa - ${contact.companyName}`
  const greeting = `Olá ${contact.fullName},`
  const lines = [greeting, '', 'Obrigado pelo seu contato.', '']

  if (contact.service) {
    lines.push(`Sobre o serviço de interesse: ${contact.service}.`)
  }

  const body = lines.join('\n')

  return `mailto:${encodeURIComponent(
    contact.email,
  )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

interface StatCardProps {
  label: string
  value: number | undefined
  icon: React.ComponentType<{ className?: string }>
  isLoading: boolean
  accent?: 'default' | 'warning' | 'success'
}

function StatCard({
  label,
  value,
  icon: Icon,
  isLoading,
  accent = 'default',
}: StatCardProps) {
  const accentClass: Record<NonNullable<StatCardProps['accent']>, string> = {
    default: 'text-muted-foreground',
    warning: 'text-amber-600 dark:text-amber-400',
    success: 'text-emerald-600 dark:text-emerald-400',
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className={cn('size-4', accentClass[accent])} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-2xl font-bold">{String(value ?? 0)}</p>
        )}
      </CardContent>
    </Card>
  )
}

interface ContactCardProps {
  contact: AdminContact
  onToggleStatus: (id: string, hasBeenContacted: boolean) => void
  onDelete: (id: string) => void
  isUpdating: boolean
  isDeleting: boolean
}

function ContactCard({
  contact,
  onToggleStatus,
  onDelete,
  isUpdating,
  isDeleting,
}: ContactCardProps) {
  const statusBadge = contact.hasBeenContacted
    ? {
        label: 'Contatado',
        className: 'bg-emerald-600 text-white hover:bg-emerald-600',
      }
    : {
        label: 'Pendente',
        className:
          'bg-amber-100 text-amber-900 hover:bg-amber-100 dark:bg-amber-500/20 dark:text-amber-200',
      }

  const switchId = `contact-status-${contact.id}`

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate text-base">
            {contact.fullName}
          </CardTitle>
          <CardDescription className="flex items-center gap-1.5 truncate">
            <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{contact.companyName}</span>
          </CardDescription>
        </div>
        <Badge className={cn('shrink-0', statusBadge.className)}>
          {statusBadge.label}
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 text-sm">
        <a
          href={`mailto:${contact.email}`}
          className="flex items-center gap-2 truncate text-muted-foreground transition-colors hover:text-foreground"
        >
          <Mail className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{contact.email}</span>
        </a>

        <a
          href={`tel:${contact.phone.replace(/\D/g, '')}`}
          className="flex items-center gap-2 truncate text-muted-foreground transition-colors hover:text-foreground"
        >
          <Phone className="size-3.5 shrink-0" aria-hidden="true" />
          <span>{contact.phone}</span>
        </a>

        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {contact.city} / {contact.state}
          </span>
        </div>

        {contact.service ? (
          <Badge variant="outline" className="w-fit font-normal">
            {contact.service}
          </Badge>
        ) : null}

        {contact.message ? (
          <p className="line-clamp-4 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
            {contact.message}
          </p>
        ) : null}

        <p className="mt-auto pt-1 text-xs text-muted-foreground">
          Recebido em {formatDateTime(contact.createdAt)}
        </p>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t pt-4">
        <Button asChild className="w-full" aria-label="Enviar contato por e-mail">
          <a href={buildMailtoHref(contact)}>
            <Mail className="size-4" aria-hidden="true" />
            Enviar contato
          </a>
        </Button>

        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Switch
              id={switchId}
              checked={contact.hasBeenContacted}
              onCheckedChange={(checked) => onToggleStatus(contact.id, checked)}
              disabled={isUpdating}
              aria-label="Marcar como contatado"
            />
            <Label
              htmlFor={switchId}
              className="cursor-pointer text-xs text-muted-foreground"
            >
              Contatado
            </Label>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                disabled={isDeleting}
                aria-label="Excluir contato"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir contato?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. O pedido de contato de{' '}
                  <strong>{contact.fullName}</strong> será removido
                  permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(contact.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  )
}

export function ContactsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')
  const [page, setPage] = useState(1)

  const statsQuery = useContactStats()
  const listQuery = useContacts({ page, perPage: PER_PAGE })
  const updateStatus = useUpdateContactStatus()
  const deleteMutation = useDeleteContact()

  const allContacts = useMemo(
    () => listQuery.data?.contacts ?? [],
    [listQuery.data],
  )

  const filteredContacts = useMemo(() => {
    if (statusFilter === 'pending') {
      return allContacts.filter((c) => !c.hasBeenContacted)
    }
    if (statusFilter === 'contacted') {
      return allContacts.filter((c) => c.hasBeenContacted)
    }
    return allContacts
  }, [allContacts, statusFilter])

  const pagination = listQuery.data?.pagination
  const hasItems = filteredContacts.length > 0

  const pendingCount =
    statsQuery.data
      ? statsQuery.data.stats.totalContacts -
        statsQuery.data.stats.respondedContacts
      : undefined

  function handleStatusChange(value: string) {
    setStatusFilter(value as StatusFilter)
  }

  function handleToggleStatus(id: string, hasBeenContacted: boolean) {
    updateStatus.mutate(
      { id, input: { hasBeenContacted } },
      {
        onSuccess: () => {
          toast.success(
            hasBeenContacted
              ? 'Contato marcado como contatado.'
              : 'Contato marcado como pendente.',
          )
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Não foi possível atualizar o status.',
          )
        },
      },
    )
  }

  function handleDelete(id: string) {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Contato removido.')
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Não foi possível remover o contato.',
        )
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Contatos</h2>
        <p className="text-sm text-muted-foreground">
          Pedidos de contato enviados pela página de contato da landing. Envie
          retorno por e-mail e marque como contatado após a resposta.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Pendentes"
          value={pendingCount}
          icon={Clock}
          isLoading={statsQuery.isPending}
          accent="warning"
        />
        <StatCard
          label="Contatados"
          value={statsQuery.data?.stats.respondedContacts}
          icon={CheckCircle2}
          isLoading={statsQuery.isPending}
          accent="success"
        />
        <StatCard
          label="Total"
          value={statsQuery.data?.stats.totalContacts}
          icon={Inbox}
          isLoading={statsQuery.isPending}
        />
      </div>

      <Tabs value={statusFilter} onValueChange={handleStatusChange}>
        <TabsList>
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {listQuery.isError ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Erro ao carregar</CardTitle>
            <CardDescription>{listQuery.error.message}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {listQuery.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : null}

      {listQuery.isSuccess && !hasItems ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <Inbox className="size-8" aria-hidden="true" />
            <p className="text-sm">
              {statusFilter === 'pending'
                ? 'Nenhum contato aguardando retorno.'
                : statusFilter === 'contacted'
                  ? 'Nenhum contato marcado como contatado ainda.'
                  : 'Nenhum contato recebido.'}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {hasItems ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
              isUpdating={
                updateStatus.isPending &&
                updateStatus.variables?.id === contact.id
              }
              isDeleting={
                deleteMutation.isPending &&
                deleteMutation.variables === contact.id
              }
            />
          ))}
        </div>
      ) : null}

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {String(pagination.total)} contato(s) no total
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
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

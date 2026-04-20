import {
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  MessageSquareQuote,
  Star,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { TestimonialReviewDialog } from '../components/TestimonialReviewDialog'
import { useTestimonialStats } from '../hooks/use-testimonial-stats'
import { useTestimonials } from '../hooks/use-testimonials'
import type { AdminTestimonial, TestimonialStatus } from '../types'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { formatDateTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'

type StatusFilter = TestimonialStatus | 'all'

interface StatusTab {
  readonly value: StatusFilter
  readonly label: string
}

const statusTabs: readonly StatusTab[] = [
  { value: 'pending', label: 'Pendentes' },
  { value: 'approved', label: 'Aprovados' },
  { value: 'rejected', label: 'Rejeitados' },
  { value: 'all', label: 'Todos' },
]

const statusBadge: Record<
  TestimonialStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'Pendente',
    className:
      'bg-amber-100 text-amber-900 hover:bg-amber-100 dark:bg-amber-500/20 dark:text-amber-200',
  },
  approved: {
    label: 'Aprovado',
    className: 'bg-emerald-600 text-white hover:bg-emerald-600',
  },
  rejected: {
    label: 'Rejeitado',
    className: 'border border-destructive/50 text-destructive bg-transparent',
  },
}

const PER_PAGE = 20

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function StarRatingCell({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${String(rating)} de 5 estrelas`}
    >
      <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
      <span className="text-sm font-medium">{String(rating)}</span>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number | undefined
  icon: React.ComponentType<{ className?: string }>
  isLoading: boolean
  accent?: 'default' | 'warning' | 'success' | 'destructive'
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
    destructive: 'text-destructive',
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

export function TestimonialsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<AdminTestimonial | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const statsQuery = useTestimonialStats()
  const listQuery = useTestimonials({
    page,
    perPage: PER_PAGE,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  const testimonials = listQuery.data?.testimonials ?? []
  const pagination = listQuery.data?.pagination
  const hasItems = testimonials.length > 0

  function handleStatusChange(value: string) {
    setStatusFilter(value as StatusFilter)
    setPage(1)
  }

  function openReview(item: AdminTestimonial) {
    setSelected(item)
    setDialogOpen(true)
  }

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open)
    if (!open) {
      setSelected(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Depoimentos</h2>
        <p className="text-sm text-muted-foreground">
          Modere os depoimentos enviados pelos clientes e escolha quais serão
          publicados na landing.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pendentes"
          value={statsQuery.data?.stats.pending}
          icon={Clock}
          isLoading={statsQuery.isPending}
          accent="warning"
        />
        <StatCard
          label="Aprovados"
          value={statsQuery.data?.stats.approved}
          icon={CheckCircle2}
          isLoading={statsQuery.isPending}
          accent="success"
        />
        <StatCard
          label="Rejeitados"
          value={statsQuery.data?.stats.rejected}
          icon={XCircle}
          isLoading={statsQuery.isPending}
          accent="destructive"
        />
        <StatCard
          label="Total"
          value={statsQuery.data?.stats.total}
          icon={MessageSquareQuote}
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

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Autor</TableHead>
              <TableHead>Avaliação</TableHead>
              <TableHead className="hidden md:table-cell">Comentário</TableHead>
              <TableHead className="hidden lg:table-cell w-16">Foto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Enviado</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {listQuery.isPending ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-8 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-full max-w-sm" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-10 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-20" />
                  </TableCell>
                </TableRow>
              ))
            ) : null}

            {listQuery.isSuccess && !hasItems ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <MessageSquareQuote className="size-8" />
                    <p className="text-sm">
                      {statusFilter === 'pending'
                        ? 'Nenhum depoimento aguardando moderação.'
                        : 'Nenhum depoimento nesta categoria.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : null}

            {testimonials.map((item) => {
              const badge = statusBadge[item.status]
              return (
                <TableRow
                  key={item.id}
                  className="cursor-pointer"
                  onClick={() => openReview(item)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {item.profileImageUrl ? (
                          <AvatarImage
                            src={item.profileImageUrl}
                            alt={item.authorName}
                          />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                          {getInitials(item.authorName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.authorName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {[item.authorRole, item.companyName]
                            .filter(Boolean)
                            .join(' · ') || '—'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StarRatingCell rating={item.rating} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p className="line-clamp-2 max-w-md text-sm text-muted-foreground">
                      {item.comment}
                    </p>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {item.reviewImageUrl ? (
                      <div className="flex h-10 w-12 items-center justify-center overflow-hidden rounded border bg-muted">
                        <img
                          src={item.reviewImageUrl}
                          alt=""
                          className="max-h-full max-w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-12 items-center justify-center rounded border border-dashed text-muted-foreground">
                        <ImageIcon className="size-4" aria-hidden="true" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('shrink-0', badge.className)}>
                      {badge.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap text-sm text-muted-foreground md:table-cell">
                    {formatDateTime(item.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation()
                        openReview(item)
                      }}
                    >
                      Revisar
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {pagination && pagination.totalPages > 1 ? (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {String(pagination.total)} depoimento(s) no total
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

      <TestimonialReviewDialog
        testimonial={selected}
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
      />
    </div>
  )
}

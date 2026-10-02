import { Inbox, Mail, Phone, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useDeleteTalentApplication } from '../hooks/use-delete-talent-application'
import { useTalentApplications } from '../hooks/use-talent-applications'
import type { AdminTalentApplication } from '../types'
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
import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatDateTime } from '@/shared/lib/format'

const PER_PAGE = 24

function mailtoHref(application: AdminTalentApplication): string {
  const subject = `Banco de talentos Tessa - ${application.fullName}`
  const body = `Olá ${application.fullName},\n\nRecebemos o seu cadastro no banco de talentos.\n`

  return `mailto:${encodeURIComponent(application.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

interface TalentApplicationCardProps {
  application: AdminTalentApplication
  onDelete: (id: string) => void
  isDeleting: boolean
}

function TalentApplicationCard({
  application,
  onDelete,
  isDeleting,
}: TalentApplicationCardProps) {
  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate text-base">{application.fullName}</CardTitle>
            <CardDescription>{formatDateTime(application.createdAt)}</CardDescription>
          </div>
          <Badge variant="secondary">{application.practiceArea}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <a
          href={mailtoHref(application)}
          className="flex items-center gap-2 text-foreground hover:text-primary"
        >
          <Mail className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate">{application.email}</span>
        </a>
        <a
          href={`tel:${application.phone}`}
          className="flex items-center gap-2 text-foreground hover:text-primary"
        >
          <Phone className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          {application.phone}
        </a>
        <p>
          <span className="text-muted-foreground">Escolaridade: </span>
          {application.educationLevel}
        </p>
        <p>
          <span className="text-muted-foreground">Formação: </span>
          {application.education}
        </p>
        <p className="whitespace-pre-line leading-relaxed text-foreground/90">
          {application.professionalSummary}
        </p>
      </CardContent>
      <CardFooter className="justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={isDeleting}>
              <Trash2 className="size-4" aria-hidden />
              Excluir
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir cadastro?</AlertDialogTitle>
              <AlertDialogDescription>
                O cadastro de {application.fullName} será removido do banco de talentos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(application.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}

export function TalentApplicationsPage() {
  const [page, setPage] = useState(1)
  const listQuery = useTalentApplications({ page, perPage: PER_PAGE })
  const deleteMutation = useDeleteTalentApplication()

  const applications = listQuery.data?.talentApplications ?? []
  const pagination = listQuery.data?.pagination

  function handleDelete(id: string) {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Cadastro removido.')
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Não foi possível remover o cadastro.',
        )
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Trabalhe conosco</h2>
        <p className="text-sm text-muted-foreground">
          Cadastros enviados pelo formulário de banco de talentos da landing.
        </p>
      </div>

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
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {listQuery.isSuccess && applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <Inbox className="size-8" aria-hidden />
            <p className="text-sm">Nenhum cadastro recebido.</p>
          </CardContent>
        </Card>
      ) : null}

      {applications.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {applications.map((application) => (
            <TalentApplicationCard
              key={application.id}
              application={application}
              onDelete={handleDelete}
              isDeleting={
                deleteMutation.isPending && deleteMutation.variables === application.id
              }
            />
          ))}
        </div>
      ) : null}

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {String(pagination.total)} cadastro(s) no total
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

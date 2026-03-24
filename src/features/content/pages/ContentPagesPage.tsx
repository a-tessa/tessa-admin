import { Link, useNavigate } from '@tanstack/react-router'
import { Eye, FileText, Loader2, MoreHorizontal, Plus, Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useContentPages } from '@/features/content/hooks/use-content-pages'
import { usePublishContentPage } from '@/features/content/hooks/use-publish-content-page'
import type { LandingPageStatus } from '@/features/content/types'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { formatRelativeDate } from '@/shared/lib/format'

const statusConfig: Record<LandingPageStatus, { label: string; variant: 'default' | 'secondary' }> = {
  published: { label: 'Publicada', variant: 'default' },
  draft: { label: 'Rascunho', variant: 'secondary' },
}

export function ContentPagesPage() {
  const [page, setPage] = useState(1)
  const perPage = 20
  const pagesQuery = useContentPages(page, perPage)
  const publishMutation = usePublishContentPage()
  const navigate = useNavigate()

  const [newSlug, setNewSlug] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [publishSlug, setPublishSlug] = useState<string | null>(null)

  function handleCreatePage() {
    const slug = newSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
    if (!slug) return

    setCreateDialogOpen(false)
    setNewSlug('')
    void navigate({ to: '/conteudo/$slug', params: { slug } })
  }

  function handlePublish() {
    if (!publishSlug) return
    publishMutation.mutate(publishSlug, {
      onSuccess: () => {
        toast.success('Página publicada com sucesso.')
        setPublishSlug(null)
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Páginas</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie as landing pages da Tessa.
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Nova página
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar nova página</DialogTitle>
              <DialogDescription>
                Defina o slug (identificador URL) da página. Ele não poderá ser alterado depois.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="ex: pagina-inicial"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreatePage()
                }}
              />
              <p className="text-xs text-muted-foreground">
                Use letras minúsculas, números e hífens.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreatePage} disabled={!newSlug.trim()}>
                Criar e editar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Atualizada</TableHead>
              <TableHead>Publicada</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagesQuery.isPending ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell />
                </TableRow>
              ))
            ) : null}

            {pagesQuery.isSuccess && pagesQuery.data.pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileText className="size-8" />
                    <p>Nenhuma página cadastrada.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : null}

            {pagesQuery.data?.pages.map((contentPage) => {
              const config = statusConfig[contentPage.status]
              return (
                <TableRow key={contentPage.id}>
                  <TableCell className="font-medium">
                    <Link
                      to="/conteudo/$slug"
                      params={{ slug: contentPage.slug }}
                      className="hover:underline"
                    >
                      {contentPage.title}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {contentPage.slug}
                  </TableCell>
                  <TableCell>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatRelativeDate(contentPage.updatedAt)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {contentPage.publishedAt
                      ? formatRelativeDate(contentPage.publishedAt)
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to="/conteudo/$slug" params={{ slug: contentPage.slug }}>
                            <Eye className="mr-2 size-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPublishSlug(contentPage.slug)}>
                          <Send className="mr-2 size-4" />
                          Publicar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {pagesQuery.isSuccess && pagesQuery.data.pagination.totalPages > 1 ? (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {pagesQuery.data.pagination.total} página(s) no total
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
                disabled={page >= pagesQuery.data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <AlertDialog open={publishSlug !== null} onOpenChange={(open) => { if (!open) setPublishSlug(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publicar página?</AlertDialogTitle>
            <AlertDialogDescription>
              O rascunho atual de <strong>{publishSlug}</strong> será promovido para a versão publicada.
              Esta ação é visível imediatamente para o público.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePublish}
              disabled={publishMutation.isPending}
            >
              {publishMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Publicar agora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Calendar,
  FileText,
  Loader2,
  MoreHorizontal,
  Newspaper,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { categoriesListQuery } from '@/features/content/categories/categories.queries'
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
import { BlogArticleStatusBadge } from '../components/BlogArticleStatusBadge'
import { useAdminBlogArticles } from '../hooks/use-admin-blog-articles'
import { useDeleteBlogArticle } from '../hooks/use-delete-blog-article'
import type { BlogArticleListItem, BlogArticleStatus } from '../types'

const ALL_VALUE = '__all__'

type StatusFilterValue = BlogArticleStatus | typeof ALL_VALUE

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

function formatUpdatedAt(iso: string): string {
  try {
    return dateFormatter.format(new Date(iso))
  } catch {
    return iso
  }
}

export function BlogArticlesPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>(ALL_VALUE)
  const [categoryFilter, setCategoryFilter] = useState(ALL_VALUE)
  const [deletingArticle, setDeletingArticle] =
    useState<BlogArticleListItem | null>(null)

  const articlesQuery = useAdminBlogArticles({
    ...(statusFilter !== ALL_VALUE ? { status: statusFilter } : {}),
    ...(categoryFilter !== ALL_VALUE ? { categorySlug: categoryFilter } : {}),
    perPage: 50,
  })
  const categoriesQuery = useQuery(categoriesListQuery())
  const deleteMutation = useDeleteBlogArticle()

  const articles = articlesQuery.data?.articles ?? []
  const total = articlesQuery.data?.pagination.total ?? 0

  const categoryLabelBySlug = useMemo(() => {
    const map = new Map<string, string>()
    for (const category of categoriesQuery.data?.categories ?? []) {
      map.set(category.slug, category.name)
    }
    return map
  }, [categoriesQuery.data])

  function handleConfirmDelete() {
    if (!deletingArticle) return

    deleteMutation.mutate(deletingArticle.slug, {
      onSuccess: () => {
        toast.success('Artigo removido.')
        setDeletingArticle(null)
      },
      onError: (error) => toast.error(error.message),
    })
  }

  const hasArticles = articles.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Blog</h2>
          <p className="text-sm text-muted-foreground">
            Crie, edite e publique os artigos do blog Tessa.
          </p>
        </div>

        <Button asChild className="gap-2">
          <Link to="/conteudo/blog/novo">
            <Plus className="size-4" />
            Novo artigo
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label
            htmlFor="blog-status-filter"
            className="text-sm font-medium text-muted-foreground"
          >
            Status
          </label>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as StatusFilterValue)
            }
          >
            <SelectTrigger id="blog-status-filter" className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Todos</SelectItem>
              <SelectItem value="draft">Rascunhos</SelectItem>
              <SelectItem value="published">Publicados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="blog-category-filter"
            className="text-sm font-medium text-muted-foreground"
          >
            Categoria
          </label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger id="blog-category-filter" className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Todas</SelectItem>
              {(categoriesQuery.data?.categories ?? []).map((category) => (
                <SelectItem key={category.slug} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {statusFilter !== ALL_VALUE || categoryFilter !== ALL_VALUE ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter(ALL_VALUE)
              setCategoryFilter(ALL_VALUE)
            }}
          >
            Limpar filtros
          </Button>
        ) : null}
      </div>

      {articlesQuery.isPending ? (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Atualizado</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-64" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
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

      {articlesQuery.isError ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Erro ao carregar</CardTitle>
            <CardDescription>{articlesQuery.error.message}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {articlesQuery.isSuccess && !hasArticles ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Newspaper className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum artigo encontrado.</p>
            <Button asChild className="mt-2 gap-2">
              <Link to="/conteudo/blog/novo">
                <Plus className="size-4" />
                Criar primeiro artigo
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {hasArticles ? (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Atualizado</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow
                  key={article.id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate({
                      to: '/conteudo/blog/$slug',
                      params: { slug: article.slug },
                    })
                  }
                >
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <p className="font-medium">{article.title}</p>
                        <p className="text-xs text-muted-foreground">
                          /{article.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {categoryLabelBySlug.get(article.categorySlug) ??
                      article.categorySlug}
                  </TableCell>
                  <TableCell>
                    <BlogArticleStatusBadge status={article.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {article.author.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      {formatUpdatedAt(article.updatedAt)}
                    </span>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            navigate({
                              to: '/conteudo/blog/$slug',
                              params: { slug: article.slug },
                            })
                          }
                        >
                          <Pencil className="mr-2 size-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingArticle(article)}
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
              {`${String(articles.length)} de ${String(total)} artigo(s)`}
            </p>
          </div>
        </div>
      ) : null}

      <AlertDialog
        open={deletingArticle !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingArticle(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover artigo?</AlertDialogTitle>
            <AlertDialogDescription>
              O artigo <strong>{deletingArticle?.title}</strong> será removido
              permanentemente, junto com sua imagem de capa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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

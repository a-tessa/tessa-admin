import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { BlogArticleForm } from '../components/BlogArticleForm'
import { BlogArticleStatusBadge } from '../components/BlogArticleStatusBadge'
import { useBlogArticle } from '../hooks/use-blog-article'
import { useUpdateBlogArticle } from '../hooks/use-update-blog-article'

export function BlogArticleEditPage() {
  const params = useParams({ strict: false })
  const slug = params.slug ?? ''
  const navigate = useNavigate()
  const articleQuery = useBlogArticle(slug)
  const updateMutation = useUpdateBlogArticle()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1">
            <Link to="/conteudo/blog">
              <ArrowLeft className="size-3.5" />
              Voltar para a lista
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              {articleQuery.data?.article.title ?? 'Editar artigo'}
            </h2>
            {articleQuery.data ? (
              <BlogArticleStatusBadge
                status={articleQuery.data.article.status}
              />
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            Atualize o conteúdo, troque o status ou ajuste os metadados.
          </p>
        </div>
      </div>

      {articleQuery.isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[340px] w-full" />
        </div>
      ) : null}

      {articleQuery.isError ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">
              Erro ao carregar artigo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {articleQuery.error.message}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {articleQuery.data ? (
        <BlogArticleForm
          key={articleQuery.data.article.id}
          article={articleQuery.data.article}
          isSubmitting={updateMutation.isPending}
          onCancel={() => navigate({ to: '/conteudo/blog' })}
          onSubmit={(input) => {
            updateMutation.mutate(
              { slug, input },
              {
                onSuccess: ({ article }) => {
                  toast.success('Artigo atualizado.')
                  if (article.slug !== slug) {
                    void navigate({
                      to: '/conteudo/blog/$slug',
                      params: { slug: article.slug },
                      replace: true,
                    })
                  }
                },
                onError: (error) => toast.error(error.message),
              },
            )
          }}
        />
      ) : null}
    </div>
  )
}
